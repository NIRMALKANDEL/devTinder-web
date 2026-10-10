import React, { Component, Suspense, lazy, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

// Added: wrapper for the 3D hero. Loads three.js only when this mounts, renders a
// still frame for reduced-motion users, pauses when scrolled off screen, and shows a
// gradient instead when WebGL isn't available or the scene fails.
const HeroScene = lazy(() => import("./HeroScene"));

const hasWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

const Fallback = () => (
  <div className='absolute inset-0 flex items-center justify-center'>
    <div className='glow-backdrop !static w-40 h-40 rounded-full'></div>
  </div>
);

class SceneErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Fallback /> : this.props.children;
  }
}

const Scene3D = ({ className = "" }) => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  const [webgl] = useState(hasWebGL);

  // Stop rendering frames while the hero is scrolled out of view (saves battery)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`} aria-hidden='true'>
      {webgl ? (
        <SceneErrorBoundary>
          <Suspense fallback={<Fallback />}>
            <HeroScene animate={!reduce && visible} />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <Fallback />
      )}
    </div>
  );
};

export default Scene3D;
