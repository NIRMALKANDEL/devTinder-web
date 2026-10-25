import React from "react";
import { useSelector } from "react-redux";
import { useCall } from "../utils/callContext";
import { CrownIcon, PhoneIcon, VideoIcon } from "./Icons";

// Added: audio (everyone) and video (Premium) call buttons for a connection.
// Non-Premium users still see the video button; it explains Premium instead of calling.
const CallButtons = ({ user, className = "" }) => {
  const me = useSelector((store) => store.user);
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
        className='btn btn-ghost btn-circle relative'
        aria-label={me?.isPremium ? `Video call ${firstName}` : `Video call ${firstName} (Premium)`}
        title={me?.isPremium ? "Video call" : "Video call · Premium"}
        disabled={busy}
        onClick={() => startCall(user, "video")}>
        <VideoIcon className='w-5 h-5' />
        {!me?.isPremium && (
          <span className='absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-content flex items-center justify-center'>
            <CrownIcon className='w-2.5 h-2.5' />
          </span>
        )}
      </button>
    </div>
  );
};

export default CallButtons;
