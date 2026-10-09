import React, { useState } from "react";
import { CloseIcon, HeartIcon } from "./Icons";
import ProfileLinks from "./ProfileLinks";
import SkillChips from "./SkillChips";

// Changed: sending the request moved up to Feed (so the card can animate out and be
// restored if the request fails). The card calls onAction("ignored" | "interested").
// Without onAction (e.g. the Edit Profile live preview) no buttons are shown.
const UserCard = ({ user, onAction, disabled = false }) => {
  // Added: pull skills + portfolioUrl + githubUrl so the card can show chips and links
  const { _id, firstName, lastName, photoURL, age, gender, about, skills, portfolioUrl, githubUrl } =
    user;
  // UI: remember a photo URL that failed to load and show initials instead
  const [brokenSrc, setBrokenSrc] = useState(null);
  const showPhoto = photoURL && brokenSrc !== photoURL;

  // UI: initials shown when there is no photo (e.g. live preview in Edit Profile)
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();
  const meta = [age, gender].filter(Boolean).join(" · ");

  return (
    <article className='surface w-full max-w-sm overflow-hidden select-none'>
      {/* UI: fixed-height photo so every card is the same size; name sits on a soft scrim */}
      <figure className='relative h-[min(24rem,44dvh)] min-h-56 bg-base-200'>
        {showPhoto ? (
          <img
            src={photoURL}
            alt={fullName || "photo"}
            draggable={false}
            onError={() => setBrokenSrc(photoURL)}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center tint-primary'>
            <span className='text-7xl font-bold text-primary opacity-70 tracking-tight'>
              {initials}
            </span>
          </div>
        )}
        <div
          className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/30 to-transparent'
          aria-hidden='true'></div>
        <figcaption className='absolute inset-x-0 bottom-0 p-5 text-white text-left'>
          <h2 className='text-2xl font-bold leading-tight [overflow-wrap:anywhere]'>
            {fullName || "Your name"}
          </h2>
          {meta && <p className='text-sm text-white/80 capitalize mt-0.5 tabular'>{meta}</p>}
        </figcaption>
      </figure>

      <div className='p-5 flex flex-col gap-3 text-left'>
        {about && (
          <p className='opacity-80 text-sm leading-relaxed [overflow-wrap:anywhere]'>{about}</p>
        )}
        {/* Added: Top Skills chips (wrap to multiple lines), hidden when empty */}
        <SkillChips skills={skills} />
        {/* Added: Portfolio / GitHub links (open in a new tab), hidden when empty */}
        <ProfileLinks portfolioUrl={portfolioUrl} githubUrl={githubUrl} />
        {_id && onAction && (
          // UI: Ignore = outlined/red, Interested = primary
          <div className='grid grid-cols-2 gap-3 mt-2'>
            <button
              type='button'
              className='btn btn-outline btn-error rounded-full gap-2 transition-transform active:scale-95'
              disabled={disabled}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onAction("ignored")}>
              <CloseIcon />
              Ignore
            </button>
            <button
              type='button'
              className='btn btn-primary rounded-full gap-2 shadow-lg transition-transform active:scale-95'
              disabled={disabled}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onAction("interested")}>
              <HeartIcon />
              Interested
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
export default UserCard;
