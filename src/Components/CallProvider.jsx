import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CallContext } from "../utils/callContext";
import { getSocket } from "../utils/socket";
import { showToast } from "../utils/toastSlice";
import {
  callSupportError,
  fetchIceConfig,
  formatDuration,
  getLocalMedia,
  hasMultipleCameras,
  mediaErrorMessage,
} from "../utils/webrtc";
import CallOverlay from "./CallOverlay";

// Added: one-to-one audio/video calls.
// Signaling (ring, accept, offer/answer, ICE candidates) goes over the existing
// Socket.IO connection; audio/video goes peer to peer with WebRTC (or via TURN).
// The server checks every rule (connections only, video needs Premium, busy, etc.);
// the checks here only give quicker, friendlier messages.
//
// status: idle -> preparing (getting mic/camera) -> outgoing (ringing) -> connecting -> active
//         idle -> incoming -> accepting -> connecting -> active
const IDLE = {
  status: "idle",
  callId: null,
  kind: null,
  role: null,
  peer: null,
  startedAt: null,
  muted: false,
  cameraOff: false,
  reconnecting: false,
  canSwitchCamera: false,
  localStream: null,
  remoteStream: null,
};
const CONNECT_TIMEOUT_MS = 25000;
const RECOVER_TIMEOUT_MS = 15000;
const ACK_TIMEOUT_MS = 8000;

const nameOf = (peer) => peer?.firstName || "They";

const CallProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = useSelector((store) => store.user);
  const myId = me?._id;

  const [call, setCall] = useState(IDLE);
  const callRef = useRef(IDLE); // always the latest state, for socket/WebRTC callbacks
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const iceRef = useRef(null);
  const pendingCandidates = useRef([]);
  const timers = useRef({});
  const restartTried = useRef(false);
  const facingRef = useRef("user");

  const toast = (message, type = "error") => dispatch(showToast(message, type));

  const update = (patch) => {
    callRef.current = { ...callRef.current, ...patch };
    setCall(callRef.current);
  };

  const clearTimer = (name) => {
    clearTimeout(timers.current[name]);
    delete timers.current[name];
  };

  const cleanup = () => {
    Object.keys(timers.current).forEach(clearTimer);
    const pc = pcRef.current;
    if (pc) {
      pc.onicecandidate = pc.ontrack = pc.onconnectionstatechange = pc.oniceconnectionstatechange = null;
      pc.close();
    }
    pcRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    pendingCandidates.current = [];
    restartTried.current = false;
    facingRef.current = "user";
  };

  // Ends the call locally and shows an optional message
  const finish = (message, type = "error") => {
    const { startedAt } = callRef.current;
    cleanup();
    callRef.current = IDLE;
    setCall(IDLE);
    if (message === "ended") {
      toast(startedAt ? `Call ended · ${formatDuration(Date.now() - startedAt)}` : "Call ended", "success");
    } else if (message) {
      toast(message, type);
    }
  };

  const sendSignal = (data) => {
    const { callId } = callRef.current;
    if (callId) getSocket().emit("call:signal", { callId, data });
  };

  const emitWithAck = (event, payload) => getSocket().timeout(ACK_TIMEOUT_MS).emitWithAck(event, payload);

  const flushCandidates = async () => {
    const pc = pcRef.current;
    const list = pendingCandidates.current;
    pendingCandidates.current = [];
    for (const c of list) {
      await pc?.addIceCandidate(c).catch(() => {});
    }
  };

  const startConnectTimer = () => {
    clearTimer("connect");
    timers.current.connect = setTimeout(() => {
      if (callRef.current.status === "active") return;
      getSocket().emit("call:end", { callId: callRef.current.callId });
      finish("Couldn't connect the call. Your network may be blocking calls; try another network.");
    }, CONNECT_TIMEOUT_MS);
  };

  // The caller restarts ICE once after a drop; both sides give up after a while
  const recover = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    if (!timers.current.recover) {
      timers.current.recover = setTimeout(() => {
        if (pcRef.current && pcRef.current.connectionState !== "connected") {
          getSocket().emit("call:end", { callId: callRef.current.callId });
          finish("The call dropped because of a connection problem.");
        }
      }, RECOVER_TIMEOUT_MS);
    }
    if (callRef.current.role === "caller" && !restartTried.current) {
      restartTried.current = true;
      try {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        sendSignal({ type: "offer", sdp: offer.sdp, iceRestart: true });
      } catch {
        // the recover timer ends the call
      }
    }
  };

  const onConnectionState = () => {
    const pc = pcRef.current;
    if (!pc) return;
    const state = pc.connectionState || pc.iceConnectionState;
    if (state === "connected" || state === "completed") {
      clearTimer("connect");
      clearTimer("recover");
      clearTimer("drop");
      restartTried.current = false;
      update({ status: "active", reconnecting: false, startedAt: callRef.current.startedAt || Date.now() });
    } else if (state === "disconnected") {
      update({ reconnecting: true });
      clearTimer("drop");
      timers.current.drop = setTimeout(recover, 3000); // "disconnected" often recovers alone
    } else if (state === "failed") {
      update({ reconnecting: true });
      recover();
    }
  };

  const createPeer = async () => {
    const config = await iceRef.current;
    const pc = new RTCPeerConnection({
      iceServers: config.iceServers,
      iceTransportPolicy: config.iceTransportPolicy || "all",
    });
    localRef.current?.getTracks().forEach((track) => pc.addTrack(track, localRef.current));
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal({ type: "candidate", candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      const stream = e.streams[0] || new MediaStream([e.track]);
      update({ remoteStream: stream });
    };
    pc.onconnectionstatechange = onConnectionState;
    pc.oniceconnectionstatechange = () => {
      if (!("connectionState" in pc)) onConnectionState();
    };
    pcRef.current = pc;
    return pc;
  };

  const prepareMedia = async (kind) => {
    iceRef.current = fetchIceConfig();
    const stream = await getLocalMedia(kind, "user");
    localRef.current = stream;
    const canSwitchCamera = kind === "video" ? await hasMultipleCameras() : false;
    return { stream, canSwitchCamera };
  };

  // ---- actions ------------------------------------------------------------

  const startCall = async (peer, kind) => {
    if (!peer?._id) return;
    if (callRef.current.status !== "idle") return toast("You're already in a call.");
    const unsupported = callSupportError();
    if (unsupported) return toast(unsupported);
    if (kind === "video" && !me?.isPremium) {
      toast("Video calling is a Premium feature. Audio calls are free for everyone.");
      return navigate("/premium");
    }
    if (!getSocket().connected) return toast("You're offline. Check your connection and try again.");

    update({ ...IDLE, status: "preparing", kind, role: "caller", peer });
    try {
      const { stream, canSwitchCamera } = await prepareMedia(kind);
      if (callRef.current.status !== "preparing") return cleanup(); // cancelled meanwhile
      update({ localStream: stream, canSwitchCamera });
    } catch (err) {
      return finish(mediaErrorMessage(err, kind));
    }

    let ack;
    try {
      ack = await emitWithAck("call:start", { toUserId: peer._id, kind });
    } catch {
      return finish("Couldn't reach the server. Please try again.");
    }
    if (callRef.current.status !== "preparing") {
      // Hung up before the server answered
      if (ack?.ok) getSocket().emit("call:end", { callId: ack.callId });
      return;
    }
    if (!ack?.ok) {
      finish(ack?.message || "The call couldn't be started.");
      if (ack?.reason === "premium_required") navigate("/premium");
      return;
    }
    update({ status: "outgoing", callId: ack.callId });
  };

  const acceptCall = async () => {
    const { callId, kind, status } = callRef.current;
    if (status !== "incoming") return;
    const unsupported = callSupportError();
    if (unsupported) {
      getSocket().emit("call:reject", { callId, reason: "unavailable" });
      return finish(unsupported);
    }
    update({ status: "accepting" });
    try {
      const { stream, canSwitchCamera } = await prepareMedia(kind);
      if (callRef.current.callId !== callId) return cleanup(); // caller hung up meanwhile
      update({ localStream: stream, canSwitchCamera });
      await createPeer();
    } catch (err) {
      getSocket().emit("call:reject", { callId, reason: "unavailable" });
      return finish(mediaErrorMessage(err, kind));
    }
    let ack;
    try {
      ack = await emitWithAck("call:accept", { callId });
    } catch {
      ack = null;
    }
    if (callRef.current.callId !== callId) return;
    if (!ack?.ok) return finish(ack?.message || "This call has ended.");
    update({ status: "connecting" });
    startConnectTimer();
  };

  const rejectCall = () => {
    const { callId, status } = callRef.current;
    if (status !== "incoming") return;
    getSocket().emit("call:reject", { callId, reason: "rejected" });
    finish();
  };

  const endCall = () => {
    const { callId, status } = callRef.current;
    if (status === "idle") return;
    if (status === "incoming") return rejectCall();
    if (status === "accepting") {
      // Not bound to the call on the server yet, so decline instead
      getSocket().emit("call:reject", { callId, reason: "unavailable" });
      return finish();
    }
    if (callId) getSocket().emit("call:end", { callId });
    finish(status === "active" ? "ended" : null);
  };

  const toggleMute = () => {
    const track = localRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    update({ muted: !track.enabled });
  };

  const toggleCamera = () => {
    const track = localRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    update({ cameraOff: !track.enabled });
  };

  const switchCamera = async () => {
    const stream = localRef.current;
    const oldTrack = stream?.getVideoTracks()[0];
    if (!oldTrack) return;
    const next = facingRef.current === "user" ? "environment" : "user";
    try {
      const fresh = await navigator.mediaDevices.getUserMedia({ video: { facingMode: next } });
      const newTrack = fresh.getVideoTracks()[0];
      newTrack.enabled = !callRef.current.cameraOff;
      const sender = pcRef.current?.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(newTrack);
      stream.removeTrack(oldTrack);
      oldTrack.stop();
      stream.addTrack(newTrack);
      facingRef.current = next;
      update({ localStream: new MediaStream(stream.getTracks()) });
    } catch {
      toast("Couldn't switch the camera.");
    }
  };

  // ---- socket events --------------------------------------------------------

  const onIncoming = ({ callId, kind, from }) => {
    if (callRef.current.status !== "idle") {
      getSocket().emit("call:reject", { callId, reason: "busy" });
      return;
    }
    update({ ...IDLE, status: "incoming", callId, kind, role: "callee", peer: from });
    navigator.vibrate?.([300, 200, 300]);
  };

  const onAccepted = async ({ callId }) => {
    if (callId !== callRef.current.callId || callRef.current.status !== "outgoing") return;
    update({ status: "connecting" });
    startConnectTimer();
    try {
      const pc = await createPeer();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal({ type: "offer", sdp: offer.sdp });
    } catch {
      getSocket().emit("call:end", { callId });
      finish("Couldn't connect the call. Please try again.");
    }
  };

  const onSignal = async ({ callId, data }) => {
    if (callId !== callRef.current.callId) return;
    const pc = pcRef.current;
    try {
      if (data.type === "candidate") {
        if (!data.candidate) return;
        if (pc?.remoteDescription) await pc.addIceCandidate(data.candidate).catch(() => {});
        else pendingCandidates.current.push(data.candidate);
      } else if (data.type === "offer" && pc) {
        await pc.setRemoteDescription({ type: "offer", sdp: data.sdp });
        await flushCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ type: "answer", sdp: answer.sdp });
      } else if (data.type === "answer" && pc?.signalingState === "have-local-offer") {
        await pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
        await flushCandidates();
      }
    } catch {
      // A bad or late description: the connect/recover timers handle the outcome
    }
  };

  const onEnded = ({ callId, reason }) => {
    const current = callRef.current;
    if (callId !== current.callId) return;
    const name = nameOf(current.peer);
    const caller = current.role === "caller";
    const messages = {
      rejected: [`${name} declined the call.`],
      busy: [`${name} is on another call.`],
      unavailable: [`${name} couldn't take the call right now.`],
      timeout: [caller ? `No answer from ${name}.` : `Missed call from ${name}.`],
      cancelled: [`Missed call from ${name}.`],
      disconnected: ["The call dropped because of a connection problem."],
    };
    if (reason === "ended") return finish(current.status === "active" ? "ended" : `${name} ended the call.`);
    finish(...(messages[reason] || ["Call ended."]));
  };

  const onHandledElsewhere = ({ callId }) => {
    if (callId === callRef.current.callId && callRef.current.status === "incoming") finish();
  };

  const onPeerReconnecting = ({ callId }) => {
    if (callId === callRef.current.callId) update({ reconnecting: true });
  };
  const onPeerReconnected = ({ callId }) => {
    if (callId === callRef.current.callId && pcRef.current?.connectionState === "connected") {
      update({ reconnecting: false });
    }
  };

  // Our own socket reconnected (new socket id): rejoin the call on the server
  const onReconnect = async () => {
    const { callId, status } = callRef.current;
    if (!callId || !["outgoing", "connecting", "active"].includes(status)) return;
    let ack;
    try {
      ack = await emitWithAck("call:resume", { callId });
    } catch {
      ack = null;
    }
    if (callRef.current.callId !== callId) return;
    if (!ack?.ok) return finish("The call ended while you were offline.");
    // The answer may have come while we were offline
    if (ack.state === "active" && callRef.current.status === "outgoing") onAccepted({ callId });
  };

  // Latest handlers for the long-lived socket listeners below
  const handlers = useRef({});
  handlers.current = {
    onIncoming,
    onAccepted,
    onSignal,
    onEnded,
    onHandledElsewhere,
    onPeerReconnecting,
    onPeerReconnected,
    onReconnect,
    endCall,
  };

  useEffect(() => {
    if (!myId) return;
    const socket = getSocket();
    const latest = handlers;
    const state = callRef;
    const events = {
      "call:incoming": (p) => latest.current.onIncoming(p),
      "call:accepted": (p) => latest.current.onAccepted(p),
      "call:signal": (p) => latest.current.onSignal(p),
      "call:ended": (p) => latest.current.onEnded(p),
      "call:handled-elsewhere": (p) => latest.current.onHandledElsewhere(p),
      "call:peer-reconnecting": (p) => latest.current.onPeerReconnecting(p),
      "call:peer-reconnected": (p) => latest.current.onPeerReconnected(p),
      connect: () => latest.current.onReconnect(),
    };
    Object.entries(events).forEach(([name, fn]) => socket.on(name, fn));
    // Closing the tab hangs up
    const onUnload = () => {
      const { callId } = state.current;
      if (callId) socket.emit("call:end", { callId });
    };
    window.addEventListener("pagehide", onUnload);
    return () => {
      Object.entries(events).forEach(([name, fn]) => socket.off(name, fn));
      window.removeEventListener("pagehide", onUnload);
      // Logged out (or unmounted) during a call
      if (state.current.status !== "idle") latest.current.endCall();
    };
  }, [myId]);

  const actions = useRef({});
  actions.current = { startCall, acceptCall, rejectCall, endCall, toggleMute, toggleCamera, switchCamera };

  // Stable functions for consumers; they always run the latest action
  const api = useMemo(
    () => ({
      startCall: (...a) => actions.current.startCall(...a),
      acceptCall: () => actions.current.acceptCall(),
      rejectCall: () => actions.current.rejectCall(),
      endCall: () => actions.current.endCall(),
      toggleMute: () => actions.current.toggleMute(),
      toggleCamera: () => actions.current.toggleCamera(),
      switchCamera: () => actions.current.switchCamera(),
    }),
    []
  );

  const value = useMemo(() => ({ call, ...api }), [call, api]);

  return (
    <CallContext.Provider value={value}>
      {children}
      {myId && <CallOverlay />}
    </CallContext.Provider>
  );
};

export default CallProvider;
