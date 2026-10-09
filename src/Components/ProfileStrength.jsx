import React from "react";
import { motion } from "motion/react";
import { DEFAULT_ABOUT } from "../utils/constants";
import { CheckIcon } from "./Icons";

const PROFILE_CHECKS = [
  { label: "Photo", done: (u) => !!u.photoURL?.trim() },
  { label: "About", done: (u) => !!u.about?.trim() && u.about.trim() !== DEFAULT_ABOUT },
  { label: "Skills", done: (u) => u.skills?.length > 0 },
  { label: "Age", done: (u) => u.age !== "" && u.age != null },
  { label: "Gender", done: (u) => !!u.gender },
  { label: "Portfolio", done: (u) => !!u.portfolioUrl?.trim() },
  { label: "GitHub", done: (u) => !!u.githubUrl?.trim() },
];

// Moved from the feed: how complete the profile is, updated live from the form values
const ProfileStrength = ({ profile }) => {
  const done = PROFILE_CHECKS.filter((c) => c.done(profile)).length;
  const percent = Math.round((done / PROFILE_CHECKS.length) * 100);

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-baseline justify-between'>
        <span className='tile-label'>Profile strength</span>
        <span className='text-2xl font-bold tabular text-gradient'>{percent}%</span>
      </div>
      <div
        className='h-2.5 rounded-full bg-base-200 overflow-hidden'
        role='progressbar'
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label='Profile strength'>
        <motion.div
          className='h-full rounded-full strength-fill'
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <ul className='flex flex-wrap gap-1.5' aria-label='Profile checklist'>
        {PROFILE_CHECKS.map((c) => {
          const ok = c.done(profile);
          return (
            <li
              key={c.label}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
                ok ? "chip chip-3" : "bg-base-200 opacity-70"
              }`}>
              {ok && <CheckIcon className='w-3 h-3' />}
              {c.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProfileStrength;
