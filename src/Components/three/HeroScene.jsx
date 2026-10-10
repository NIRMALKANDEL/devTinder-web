import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// Added: decorative 3D hero (React Three Fiber). Loaded lazily via Scene3D, so
// three.js is only downloaded on pages that show it.

const isDark = () => {
  const mode = document.documentElement.getAttribute("data-theme");
  return mode === "dark" || (!mode && window.matchMedia("(prefers-color-scheme: dark)").matches);
};

// Theme colors are oklch() CSS variables; paint one pixel to turn each into RGB for three.js
const readThemeColors = () => {
  const style = getComputedStyle(document.documentElement);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const toColor = (cssVar, fallback) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = fallback;
    ctx.fillStyle = style.getPropertyValue(cssVar).trim() || fallback;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return new THREE.Color(r / 255, g / 255, b / 255);
  };
  return {
    primary: toColor("--color-primary", "#7c3aed"),
    accent2: toColor("--accent-2", "#06b6d4"),
    accent3: toColor("--accent-3", "#a3e635"),
    dark: isDark(),
  };
};

// Re-read the colors whenever the skin or light/dark mode changes
const useThemeColors = () => {
  const [colors, setColors] = useState(readThemeColors);
  useEffect(() => {
    const update = () => setColors(readThemeColors());
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-skin", "data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);
  return colors;
};

// A slowly turning cloud of points linked to their near neighbours: a "developer network"
const Constellation = ({ color, animate, count = 46, radius = 2.6 }) => {
  const group = useRef();
  const { points, lines } = useMemo(() => {
    // fixed seed so the shape is the same on every visit
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const pts = Array.from({ length: count }, () => {
      const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
      return v.multiplyScalar(radius * (0.75 + rand() * 0.35));
    });
    const segs = [];
    pts.forEach((a, i) =>
      pts.slice(i + 1).forEach((b) => {
        if (a.distanceTo(b) < 1.35) segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
      })
    );
    return {
      points: new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])),
      lines: new Float32Array(segs),
    };
  }, [count, radius]);

  useFrame((_, delta) => {
    if (group.current && animate) group.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.07} sizeAttenuation transparent opacity={0.9} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach='attributes-position' args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.22} />
      </lineSegments>
    </group>
  );
};

// Tilts the whole scene a little toward the pointer
const PointerParallax = ({ animate, children }) => {
  const group = useRef();
  useFrame(({ pointer }) => {
    if (!group.current || !animate) return;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.18, 0.05);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.28, 0.05);
  });
  return <group ref={group}>{children}</group>;
};

const Shapes = ({ colors, animate }) => (
  <PointerParallax animate={animate}>
    <Float speed={animate ? 1.6 : 0} rotationIntensity={0.6} floatIntensity={1.1}>
      <mesh scale={1.05}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color={colors.primary}
          distort={0.34}
          speed={animate ? 1.6 : 0}
          roughness={0.18}
          metalness={0.35}
        />
      </mesh>
    </Float>
    <Float speed={animate ? 2.2 : 0} rotationIntensity={1.4} floatIntensity={1.6}>
      <mesh position={[1.9, 0.75, -0.4]} rotation={[0.6, 0.2, 0]}>
        <torusGeometry args={[0.42, 0.14, 24, 64]} />
        <meshStandardMaterial color={colors.accent2} roughness={0.25} metalness={0.5} />
      </mesh>
    </Float>
    <Float speed={animate ? 1.8 : 0} rotationIntensity={1.8} floatIntensity={1.4}>
      <mesh position={[-1.85, -0.7, 0.2]}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={colors.accent3} roughness={0.3} metalness={0.4} flatShading />
      </mesh>
    </Float>
    <Float speed={animate ? 2.6 : 0} floatIntensity={2}>
      <mesh position={[-1.25, 1.25, -0.8]}>
        <sphereGeometry args={[0.16, 32, 32]} />
        <meshStandardMaterial color={colors.accent2} emissive={colors.accent2} emissiveIntensity={0.6} />
      </mesh>
    </Float>
    <Constellation color={colors.dark ? colors.accent2 : colors.primary} animate={animate} />
  </PointerParallax>
);

const HeroScene = ({ animate = true }) => {
  const colors = useThemeColors();
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}>
      <ambientLight intensity={colors.dark ? 0.55 : 0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} />
      <pointLight position={[-4, -2, 2]} intensity={18} color={colors.accent2} />
      <pointLight position={[3, -3, -2]} intensity={10} color={colors.accent3} />
      <Shapes colors={colors} animate={animate} />
    </Canvas>
  );
};

export default HeroScene;
