import React from "react";
import { GithubIcon, LinkIcon } from "./Icons";
import { toHref } from "../utils/constants";

// Added: Portfolio + GitHub links shared by the feed card, connection cards and profile page.
// Links sit above any "stretched" card link (relative z-10) and don't start a card drag.
const ProfileLinks = ({ portfolioUrl, githubUrl, className = "" }) => {
  if (!portfolioUrl && !githubUrl) return null;
  const linkClass =
    "relative z-10 link link-primary link-hover text-sm font-medium inline-flex items-center gap-1.5 w-fit";
  const stop = (e) => e.stopPropagation();

  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${className}`}>
      {portfolioUrl && (
        <a href={toHref(portfolioUrl)} target='_blank' rel='noopener noreferrer' onPointerDown={stop} className={linkClass}>
          <LinkIcon className='w-4 h-4' />
          Portfolio
        </a>
      )}
      {githubUrl && (
        <a href={toHref(githubUrl)} target='_blank' rel='noopener noreferrer' onPointerDown={stop} className={linkClass}>
          <GithubIcon className='w-4 h-4' />
          GitHub
        </a>
      )}
    </div>
  );
};

export default ProfileLinks;
