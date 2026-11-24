import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useCall } from "../utils/callContext";
import { formatDuration } from "../utils/webrtc";
import Avatar from "./Avatar";
import {
  MicIcon,
  MicOffIcon,
  PhoneIcon,
  PhoneOffIcon,
  SwitchCameraIcon,
  VideoIcon,
  VideoOffIcon,
} from "./Icons";

// Added: call screens. Incoming calls show a small card (the page stays usable until
// you answer); an active call takes the whole screen.

const PRIVACY_NOTE = "Calls are never recorded, and your phone number is never shared.";

// Plays a MediaStream in a <video> or <audio> element
const Media = ({ stream, as = "video", muted = false, className = "" }) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.srcObject !== stream) el.srcObject = stream || null;
    if (stream) el.play?.().catch(() => {});
  }, [stream]);
  return as === "audio" ? (
    <audio ref={ref} autoPlay className='hidden' />
  ) : (
    <video ref={ref} autoPlay playsInline muted={muted} className={className} />
  );
};

// Added: make an incoming call hard to miss. Plays a ring tone (Web Audio, no file),
// flashes the tab title, and shows a system notification when the tab is in the
// background and notifications are allowed. Everything stops when the call is answered.
const useRinging = (active, name, kind) => {
  useEffect(() => {
    if (!active) return;
    let ctx;
    let timer;
    const ring = () => {
      try {
        ctx ||= new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume?.();
        const t = ctx.currentTime;
        [0, 0.45].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, t + offset);
          osc.frequency.setValueAtTime(660, t + offset + 0.18);
          gain.gain.setValueAtTime(0.0001, t + offset);
          gain.gain.exponentialRampToValueAtTime(0.25, t + offset + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.38);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t + offset);
          osc.stop(t + offset + 0.4);
        });
      } catch {
        // audio blocked until the user has clicked the page once; the card still shows
      }
    };
    ring();
    timer = setInterval(ring, 2000);

    const title = document.title;
    const alertTitle = `Incoming ${kind} call from ${name}`;
    const flash = setInterval(() => {
      document.title = document.title === alertTitle ? title : alertTitle;
    }, 1000);

    let note;
    try {
      if (document.hidden && "Notification" in window && Notification.permission === "granted") {
        note = new Notification(alertTitle, { body: "Open DevTinder to answer.", tag: "devtinder-call", requireInteraction: true });
        note.onclick = () => {
          window.focus();
          note.close();
        };
      }
    } catch {
      // notifications not supported here
    }

    return () => {
      clearInterval(timer);
      clearInterval(flash);
      document.title = title;
      note?.close();
      ctx?.close?.().catch(() => {});
    };
  }, [active, name, kind]);
};

// Re-renders every second while the call is live
const useNow = (active) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
};

const ControlButton = ({ label, onClick, active = false, danger = false, children }) => (
  <button
    type='button'
    onClick={onClick}
    aria-label={label}
    aria-pressed={danger ? undefined : active}
    title={label}
    className={`btn btn-circle w-14 h-14 border-0 transition-transform hover:scale-105 ${
      danger ? "btn-error" : active ? "bg-base-100 text-base-content" : "liquid-glass"
    }`}>
    {children}
  </button>
);

const IncomingCard = ({ call, acceptCall, rejectCall }) => {
  const acceptRef = useRef(null);
  const accepting = call.status === "accepting";
  const name = `${call.peer.firstName || ""} ${call.peer.lastName || ""}`.trim();
  useEffect(() => {
    acceptRef.current?.focus();
  }, []);
  useRinging(call.status === "incoming", name || "a connection", call.kind);

  return (
    // Changed: centred card over a dimmed page (the small corner card was easy to miss)
    <motion.div
      key='incoming-backdrop'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50'>
    <motion.div
      role='alertdialog'
      aria-modal='false'
      aria-labelledby='incoming-call-title'
      aria-describedby='incoming-call-note'
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className='w-full max-w-sm bg-base-100 border border-hairline shadow-2xl rounded-3xl p-6'>
      <div className='flex items-center gap-4'>
        <span className='relative'>
          <motion.span
            className='absolute inset-0 rounded-full ring-4 ring-primary'
            animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            aria-hidden='true'
          />
          <Avatar src={call.peer.photoURL} firstName={call.peer.firstName} lastName={call.peer.lastName} className='w-14 h-14' textClass='text-lg' />
        </span>
        <div className='min-w-0'>
          <p id='incoming-call-title' className='font-semibold truncate'>
            {name}
          </p>
          <p className='text-sm opacity-70 flex items-center gap-1.5'>
            {call.kind === "video" ? <VideoIcon className='w-4 h-4' /> : <PhoneIcon className='w-4 h-4' />}
            {accepting ? "Connecting..." : `Incoming ${call.kind} call`}
          </p>
        </div>
      </div>
      <p id='incoming-call-note' className='text-xs opacity-60 mt-3'>
        {PRIVACY_NOTE}{" "}
        {call.kind === "video" ? "Answering turns on your camera and microphone." : "Answering uses your microphone only."}
      </p>
      <div className='grid grid-cols-2 gap-3 mt-4'>
        <button type='button' className='btn btn-error rounded-full gap-2' onClick={rejectCall} disabled={accepting}>
          <PhoneOffIcon className='w-4 h-4' />
          Decline
        </button>
        <button ref={acceptRef} type='button' className='btn btn-success rounded-full gap-2' onClick={acceptCall} disabled={accepting}>
          {accepting ? <span className='loading loading-spinner loading-xs'></span> : <PhoneIcon className='w-4 h-4' />}
          Accept
        </button>
      </div>
    </motion.div>
    </motion.div>
  );
};

const CallScreen = ({ call, endCall, toggleMute, toggleCamera, switchCamera }) => {
  const live = call.status === "active";
  const now = useNow(live);
  const isVideo = call.kind === "video";
  const name = `${call.peer.firstName || ""} ${call.peer.lastName || ""}`.trim();
  const hasRemoteVideo = isVideo && call.remoteStream?.getVideoTracks().length > 0;

  const statusText = {
    preparing: isVideo ? "Starting your camera and microphone..." : "Starting your microphone...",
    outgoing: "Ringing...",
    connecting: "Connecting...",
    active: call.reconnecting ? "Reconnecting..." : formatDuration(now - (call.startedAt || now)),
  }[call.status];

  return (
    <motion.div
      role='dialog'
      aria-modal='true'
      aria-label={`${isVideo ? "Video" : "Audio"} call with ${name}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[70] flex flex-col ${isVideo ? "bg-black text-white" : "bg-base-200"}`}>
      {/* Remote side */}
      {hasRemoteVideo ? (
        <Media stream={call.remoteStream} className='absolute inset-0 w-full h-full object-cover' />
      ) : (
        call.remoteStream && <Media stream={call.remoteStream} as='audio' />
      )}

      {/* Name and status (over the video, or centered for audio) */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 ${
          hasRemoteVideo ? "pt-8 pb-16 bg-gradient-to-b from-black/60 to-transparent" : "flex-1 justify-center gap-4"
        }`}>
        {!hasRemoteVideo && (
          <Avatar src={call.peer.photoURL} firstName={call.peer.firstName} lastName={call.peer.lastName} className='w-28 h-28' textClass='text-4xl' />
        )}
        <p className='text-2xl font-bold tracking-tight [overflow-wrap:anywhere]'>{name}</p>
        <p className='text-sm opacity-80 tabular flex items-center gap-2' aria-live='polite'>
          {call.status !== "active" || call.reconnecting ? <span className='loading loading-dots loading-xs'></span> : null}
          {statusText}
        </p>
        {!hasRemoteVideo && <p className='text-xs opacity-60 max-w-xs'>{PRIVACY_NOTE}</p>}
      </div>

      {/* Your camera, picture-in-picture */}
      {isVideo && call.localStream && (
        <div className='absolute z-20 right-4 bottom-32 w-28 sm:w-44 aspect-[3/4] sm:aspect-video rounded-2xl overflow-hidden ring-2 ring-white/40 bg-black shadow-xl'>
          {call.cameraOff ? (
            <div className='w-full h-full flex items-center justify-center text-xs opacity-70'>Camera off</div>
          ) : (
            <Media stream={call.localStream} muted className='w-full h-full object-cover -scale-x-100' />
          )}
        </div>
      )}

      {/* Controls */}
      <div className='relative z-20 mt-auto flex justify-center gap-4 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6'>
        <ControlButton label={call.muted ? "Unmute" : "Mute"} onClick={toggleMute} active={call.muted}>
          {call.muted ? <MicOffIcon className='w-6 h-6' /> : <MicIcon className='w-6 h-6' />}
        </ControlButton>
        {isVideo && (
          <ControlButton label={call.cameraOff ? "Turn camera on" : "Turn camera off"} onClick={toggleCamera} active={call.cameraOff}>
            {call.cameraOff ? <VideoOffIcon className='w-6 h-6' /> : <VideoIcon className='w-6 h-6' />}
          </ControlButton>
        )}
        {isVideo && call.canSwitchCamera && (
          <ControlButton label='Switch camera' onClick={switchCamera}>
            <SwitchCameraIcon className='w-6 h-6' />
          </ControlButton>
        )}
        <ControlButton label={call.status === "active" ? "End call" : "Cancel call"} onClick={endCall} danger>
          <PhoneOffIcon className='w-6 h-6' />
        </ControlButton>
      </div>
    </motion.div>
  );
};

const CallOverlay = () => {
  const { call, ...actions } = useCall();
  const incoming = call.status === "incoming" || call.status === "accepting";
  const onScreen = ["preparing", "outgoing", "connecting", "active"].includes(call.status);

  // The page behind a full-screen call does not scroll
  useEffect(() => {
    if (!onScreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [onScreen]);

  return createPortal(
    <AnimatePresence>
      {incoming && <IncomingCard key='incoming' call={call} {...actions} />}
      {onScreen && <CallScreen key='screen' call={call} {...actions} />}
    </AnimatePresence>,
    document.body
  );
};

export default CallOverlay;
