// Added: app-wide themes. A theme = a "skin" (color palette, fonts, effects) plus a
// light/dark mode. The mode keeps using data-theme (daisyUI); the skin is data-skin.
// Both are saved in localStorage and applied before React loads (see index.html).
// /login always uses the Classic skin so the login/signup page never changes.

export const SKINS = [
  { id: "aurora", label: "Aurora", hint: "Violet & cyan glow", swatch: ["#7c3aed", "#06b6d4", "#a3e635"] },
  { id: "ocean", label: "Ocean", hint: "Trust blue & orange", swatch: ["#2563eb", "#0ea5e9", "#ea580c"] },
  { id: "sunset", label: "Sunset", hint: "Coral, pink & gold", swatch: ["#f43f5e", "#f97316", "#facc15"] },
  { id: "forest", label: "Forest", hint: "Emerald & teal", swatch: ["#059669", "#14b8a6", "#84cc16"] },
  { id: "mono", label: "Mono", hint: "Minimal black & white", swatch: ["#18181b", "#71717a", "#e4e4e7"] },
  { id: "classic", label: "Classic", hint: "The original indigo", swatch: ["#605dff", "#ec4899", "#38bdf8"] },
];

export const DEFAULT_SKIN = "aurora";
const SKIN_KEY = "skin";
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

export const getSkin = () => {
  const saved = read(SKIN_KEY);
  return SKINS.some((s) => s.id === saved) ? saved : DEFAULT_SKIN;
};

// The skin actually shown on a page (/login is pinned to Classic)
export const applySkin = (pathname = window.location.pathname) => {
  document.documentElement.setAttribute("data-skin", isLoginPath(pathname) ? "classic" : getSkin());
};

export const setSkin = (skin) => {
  write(SKIN_KEY, skin);
  applySkin();
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
