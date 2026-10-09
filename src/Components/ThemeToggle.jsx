import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoonIcon, SunIcon } from "./Icons";

// Added: light / dark switch. Until the user picks one, the OS setting is used.
// The choice is saved in localStorage and applied before React loads (see index.html),
// so the page never flashes the wrong theme.
const STORAGE_KEY = "theme";
const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const savedTheme = () => {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => savedTheme() || systemTheme());

  // Follow OS changes while the user hasn't chosen a theme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!savedTheme()) setTheme(systemTheme());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked (private mode): the theme still applies for this visit
    }
    setTheme(next);
  };

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={label}
      title={label}
      className='btn btn-ghost btn-circle overflow-hidden'>
      <AnimatePresence mode='wait' initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='flex'>
          {theme === "dark" ? <SunIcon className='w-[18px] h-[18px]' /> : <MoonIcon className='w-[18px] h-[18px]' />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
