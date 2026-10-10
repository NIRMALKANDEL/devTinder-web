import React, { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

// Added: counts up to `value` when it scrolls into view (instant with reduced motion)
const NumberTicker = ({ value = 0, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = String(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => (el.textContent = String(Math.round(v))),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      0
    </span>
  );
};

export default NumberTicker;
