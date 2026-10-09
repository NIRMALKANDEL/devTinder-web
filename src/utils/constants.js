export const BASE_URL = "/api";

// Backend default for "about"; treated as "no bio yet" in the UI
export const DEFAULT_ABOUT = "This is the default about section of the user.";

// Make a user-entered link openable even if it was typed without http(s)://
export const toHref = (url) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);
