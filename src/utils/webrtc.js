import axios from "axios";
import { BASE_URL } from "./constants";

// Added: browser helpers for in-app calls (WebRTC media and ICE servers)

const FALLBACK_ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }], iceTransportPolicy: "all" };

// Returns an error message when calling can't work in this browser, otherwise null
export const callSupportError = () => {
  if (typeof window === "undefined") return "Calls aren't available here.";
  if (!window.isSecureContext) return "Calls need a secure (https) connection.";
  if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
    return "This browser doesn't support calls. Try the latest Chrome, Edge, Firefox or Safari.";
  }
  return null;
};

// Audio calls never ask for the camera
export const getLocalMedia = (kind, facingMode = "user") =>
  navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video:
      kind === "video"
        ? { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
        : false,
  });

export const mediaErrorMessage = (err, kind) => {
  const what = kind === "video" ? "camera and microphone" : "microphone";
  switch (err?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return `Access to your ${what} was blocked. Allow it in your browser's site settings, then try again.`;
    case "NotFoundError":
    case "OverconstrainedError":
      return `No ${what} was found on this device.`;
    case "NotReadableError":
    case "AbortError":
      return `Your ${what} is being used by another app. Close it and try again.`;
    default:
      return `Couldn't start your ${what}. Please try again.`;
  }
};

export const hasMultipleCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === "videoinput").length > 1;
  } catch {
    return false;
  }
};

// STUN/TURN servers with short-lived TURN credentials from the backend
export const fetchIceConfig = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/call/ice-servers`, { withCredentials: true });
    const data = res?.data?.data;
    return data?.iceServers?.length ? data : FALLBACK_ICE;
  } catch {
    return FALLBACK_ICE;
  }
};

export const formatDuration = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = String(Math.floor((total % 3600) / 60)).padStart(h ? 2 : 1, "0");
  const s = String(total % 60).padStart(2, "0");
  return h ? `${h}:${m}:${s}` : `${m}:${s}`;
};
