import React, { useRef } from "react";

// Added: a surface whose soft glow follows the pointer (styles: .spotlight in skins.css).
// Pass `as` to render a different element (e.g. "article", "li").
const SpotlightCard = ({ as: Tag = "div", className = "", children, ...props }) => {
  const ref = useRef(null);
  const onPointerMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };
  return (
    <Tag ref={ref} onPointerMove={onPointerMove} className={`spotlight ${className}`} {...props}>
      {children}
    </Tag>
  );
};

export default SpotlightCard;
