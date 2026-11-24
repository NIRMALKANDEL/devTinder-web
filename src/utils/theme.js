// Changed: one look for the whole app (the old "Aurora" colors) with light/dark mode only.
// The color-skin picker was removed. The mode uses data-theme (daisyUI) and is saved in
// localStorage, applied before React loads (see index.html).
// /login keeps the Classic look so the login/signup page never changes.

export const APP_SKIN = "aurora";
const MODE_KEY = "theme";

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage blocked (private mode): the choice still applies for this visit
  }
};

export const isLoginPath = (pathname) => pathname.replace(/\/+$/, "") === "/login";

// The look shown on a page (/login is pinned to Classic)
export const applySkin = (pathname = window.location.pathname) => {
  document.documentElement.setAttribute("data-skin", isLoginPath(pathname) ? "classic" : APP_SKIN);
};

// "light" | "dark" | "system"
export const getMode = () => {
  const saved = read(MODE_KEY);
  return saved === "light" || saved === "dark" ? saved : "system";
};

export const setMode = (mode) => {
  if (mode === "system") {
    write(MODE_KEY, null);
    document.documentElement.removeAttribute("data-theme");
  } else {
    write(MODE_KEY, mode);
    document.documentElement.setAttribute("data-theme", mode);
  }
};
