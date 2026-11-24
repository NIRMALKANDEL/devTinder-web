import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { getErrorMessage } from "../utils/api";

// Added: "Continue with Google". Uses Google Identity Services: Google shows its own
// button and account chooser, then hands us a signed ID token that the backend checks.
// The client ID comes from the backend (/auth/google/config); with none set, nothing shows.
const GSI_SRC = "https://accounts.google.com/gsi/client";
let gsiPromise;
const loadGsi = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  gsiPromise ||= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      gsiPromise = null;
      reject(new Error("Couldn't load Google sign-in."));
    };
    document.head.appendChild(s);
  });
  return gsiPromise;
};

const GoogleSignIn = ({ mode = "signup", onSuccess, onError }) => {
  const boxRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const handlers = useRef({ onSuccess, onError });
  handlers.current = { onSuccess, onError };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/auth/google/config`);
        if (!data?.clientId || cancelled) return;
        await loadGsi();
        if (cancelled || !boxRef.current) return;
        window.google.accounts.id.initialize({
          client_id: data.clientId,
          ux_mode: "popup",
          callback: async ({ credential }) => {
            setBusy(true);
            try {
              const res = await axios.post(`${BASE_URL}/auth/google`, { credential }, { withCredentials: true });
              handlers.current.onSuccess?.(res.data);
            } catch (err) {
              handlers.current.onError?.(getErrorMessage(err, "Google sign-in failed. Please try again."));
            } finally {
              setBusy(false);
            }
          },
        });
        const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
          (!document.documentElement.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
        window.google.accounts.id.renderButton(boxRef.current, {
          type: "standard",
          theme: dark ? "filled_black" : "outline",
          size: "large",
          shape: "pill",
          text: mode === "login" ? "signin_with" : "signup_with",
          width: Math.min(boxRef.current.offsetWidth || 360, 400),
        });
        setReady(true);
      } catch {
        // Google sign-in unavailable (not set up, blocked or offline): email signup still works
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode]);

  return (
    <div className={ready ? "flex flex-col gap-4" : "hidden"}>
      <div className='relative flex justify-center min-h-10'>
        <div ref={boxRef} className='w-full flex justify-center' aria-busy={busy}></div>
        {busy && (
          <div className='absolute inset-0 flex items-center justify-center rounded-full bg-base-100/80'>
            <span className='loading loading-spinner loading-sm'></span>
          </div>
        )}
      </div>
      <div className='flex items-center gap-3 text-xs opacity-60'>
        <span className='flex-1 border-t border-hairline'></span>
        or with email
        <span className='flex-1 border-t border-hairline'></span>
      </div>
    </div>
  );
};

export default GoogleSignIn;
