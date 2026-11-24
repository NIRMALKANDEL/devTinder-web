import React from "react";
import { useCall } from "../utils/callContext";
import { PhoneIcon, VideoIcon } from "./Icons";

// Added: audio and video call buttons for a connection.
// Changed: video calling is free for every user (it used to need Premium).
const CallButtons = ({ user, className = "" }) => {
  const { call, startCall } = useCall();
  const busy = call.status !== "idle";
  const firstName = user?.firstName || "them";

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        type='button'
        className='btn btn-ghost btn-circle'
        aria-label={`Audio call ${firstName}`}
        title='Audio call'
        disabled={busy}
        onClick={() => startCall(user, "audio")}>
        <PhoneIcon className='w-5 h-5' />
      </button>
      <button
        type='button'
        className='btn btn-ghost btn-circle'
        aria-label={`Video call ${firstName}`}
        title='Video call'
        disabled={busy}
        onClick={() => startCall(user, "video")}>
        <VideoIcon className='w-5 h-5' />
      </button>
    </div>
  );
};

export default CallButtons;
