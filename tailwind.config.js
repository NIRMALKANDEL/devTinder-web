/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This ensures Tailwind scans all components
  ],
  theme: {
    extend: {}, // Customize your theme here
  },
  plugins: [require("daisyui")],
};
