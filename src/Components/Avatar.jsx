import React, { useState } from "react";

// UI: round avatar that falls back to initials when the photo is missing or fails to load
const Avatar = ({ src, firstName = "", lastName = "", className = "w-20 h-20", textClass = "text-2xl" }) => {
  const [broken, setBroken] = useState(false);
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  if (!src || broken) {
    return (
      <div
        className={`${className} rounded-full bg-primary text-primary-content flex items-center justify-center font-semibold shrink-0 ${textClass}`}
        aria-label={`${firstName} ${lastName}`.trim() || "User"}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${firstName} ${lastName}`.trim() || "User"}
      onError={() => setBroken(true)}
      className={`${className} rounded-full object-cover shrink-0`}
    />
  );
};

export default Avatar;
