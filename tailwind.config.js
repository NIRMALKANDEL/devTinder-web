/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This ensures Tailwind scans all components
  ],
  theme: {
    extend: {
      // UI: Geist for a sharper, more intentional type voice (loaded in index.html)
      fontFamily: {
        sans: [
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      // UI: lightweight entry animations used for page / card transitions
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        // "backwards" fill so no transform lingers after the animation
        // (a lingering transform would break position:fixed toasts inside)
        "page-in": "fade-in-up 0.35s ease-out backwards",
        "card-in": "scale-in 0.3s ease-out backwards",
      },
    },
  },
  // Changed: ESM import instead of require() (fixes the eslint no-undef error)
  plugins: [daisyui],
};
