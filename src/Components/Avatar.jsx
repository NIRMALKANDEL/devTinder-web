import React, { useState } from "react";

// UI: avatar that falls back to initials when the photo is missing or fails to load.
// Added: `rounded` lets cards use a squircle while the navbar keeps a circle.
const Avatar = ({
  src,
  firstName = "",
  lastName = "",
  className = "w-20 h-20",
  textClass = "text-2xl",
  rounded = "rounded-full",
}) => {
  const [broken, setBroken] = useState(false);
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  if (!src || broken) {
    return (
      <div
        className={`${className} ${rounded} bg-primary text-primary-content flex items-center justify-center font-semibold shrink-0 ${textClass}`}
        role='img'
        aria-label={`${firstName} ${lastName}`.trim() || "User"}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${firstName} ${lastName}`.trim() || "User"}
      loading='lazy'
      onError={() => setBroken(true)}
      className={`${className} ${rounded} object-cover shrink-0`}
    />
  );
};

export default Avatar;
