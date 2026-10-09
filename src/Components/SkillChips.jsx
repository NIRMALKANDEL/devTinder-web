import React from "react";

// Added: colorful skill chips (hues cycle chip-0..chip-4), shared by cards and profile pages
const SkillChips = ({ skills, className = "", large = false }) => {
  if (!skills?.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label='Skills'>
      {skills.map((skill, i) => (
        <li
          key={i}
          className={`chip chip-${i % 5} max-w-full [overflow-wrap:anywhere] ${large ? "text-sm" : ""}`}>
          {skill}
        </li>
      ))}
    </ul>
  );
};

export default SkillChips;
