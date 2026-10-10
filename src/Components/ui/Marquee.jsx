import React from "react";

// Added: endless, pause-on-hover scrolling row (styles: .marquee in skins.css).
// Items are rendered twice so the loop is seamless; the copy is hidden from screen readers.
const Marquee = ({ items, renderItem, label }) => (
  <div className='marquee' role='region' aria-label={label}>
    <div className='marquee-track'>
      {items.map((item, i) => (
        <span key={`a-${i}`}>{renderItem(item, i)}</span>
      ))}
      {items.map((item, i) => (
        <span key={`b-${i}`} aria-hidden='true'>
          {renderItem(item, i)}
        </span>
      ))}
    </div>
  </div>
);

export default Marquee;
