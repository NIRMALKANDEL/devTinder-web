import React, { useCallback, useEffect, useRef, useState } from "react";
import NavBar from "./NavBar";
import { useLocation, useNavigate, useNavigationType, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Footer from "./Footer";
import Toast from "./Toast";
import EmptyState from "./EmptyState";
import { AlertIcon } from "./Icons";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { applySkin, isLoginPath } from "../utils/theme";
import { connectSocket, disconnectSocket } from "../utils/socket";
import { messageArrived } from "../utils/chatSlice";
import MobileDock from "./MobileDock";

// Added: pages that need a logged-in user (login, reset-password and 404 stay public)
const PROTECTED_PATHS = ["/", "/profile", "/connections", "/requests", "/messages", "/settings"];

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);
  const location = useLocation();
  const navigationType = useNavigationType();
  // UI: keeps the previous page mounted while it animates out
  const outlet = useOutlet();

  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const isProtected =
    PROTECTED_PATHS.includes(pathname) ||
    pathname.startsWith("/connections/") ||
    pathname.startsWith("/messages/");

  // Added: "checking" | "ready" | "guest" | "error" — protected pages wait for this
  // instead of firing their own API calls before we know who is logged in
  const [authState, setAuthState] = useState(userData ? "ready" : "checking");
  const requested = useRef(false);

  const fetchUser = useCallback(async () => {
    setAuthState("checking");
    try {
      const res = await axios.get(BASE_URL + "/profile/view", {
        withCredentials: true,
      });

      // ✅ FIX: store only payload
      if (res?.data?.payload) {
        dispatch(addUser(res.data.payload));
        setAuthState("ready");
      } else {
        setAuthState("guest");
      }
    } catch (err) {
      // Fixed: the auth middleware answers 400 (not only 401) for an expired or invalid token,
      // which used to leave the page loading forever. Anything else is a server/network problem.
      const status = err?.response?.status;
      setAuthState(status === 401 || status === 400 ? "guest" : "error");
    }
  }, [dispatch]);

  useEffect(() => {
    if (userData || requested.current) return;
    requested.current = true;
    fetchUser();
  }, [userData, fetchUser]);

  // Changed: redirects use replace so Back never returns to a page that bounces again
  useEffect(() => {
    // ("ready" with no user = just logged out; Back to a protected page must return to login)
    if (!userData && isProtected && (authState === "guest" || authState === "ready")) {
      navigate("/login", { replace: true });
    } else if (userData && pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [userData, isProtected, authState, pathname, navigate]);

  // Added: the color skin follows the route (/login is always Classic)
  useEffect(() => {
    applySkin(pathname);
  }, [pathname]);

  // Added: live chat connection while logged in; new messages go to the chat slice
  const myId = userData?._id;
  useEffect(() => {
    if (!myId) {
      disconnectSocket();
      return;
    }
    const socket = connectSocket();
    const onMessage = (message) => dispatch(messageArrived({ message, myId }));
    socket.on("messageReceived", onMessage);
    return () => socket.off("messageReceived", onMessage);
  }, [myId, dispatch]);

  // Added: new pages start at the top; Back/Forward (POP) keeps the browser's position
  useEffect(() => {
    if (navigationType !== "POP") window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, navigationType]);

  let content = outlet;
  if (isProtected && !userData) {
    content =
      authState === "error" ? (
        <div className='py-16'>
          <EmptyState
            icon={<AlertIcon className='w-7 h-7' />}
            title="We couldn't reach the server"
            message='Check your connection, then try again.'
            actionText='Try again'
            onAction={fetchUser}
          />
        </div>
      ) : (
        <div className='flex justify-center py-24' aria-label='Loading'>
          <span className='loading loading-spinner loading-lg text-primary'></span>
        </div>
      );
  }

  return (
    // UI: full-height column so the footer sits at the bottom without covering content
    <div className='min-h-[100dvh] flex flex-col overflow-x-clip'>
      <div className='app-backdrop' aria-hidden='true'></div>
      <a href='#main' className='skip-link'>
        Skip to content
      </a>
      <NavBar />
      <AnimatePresence mode='wait' initial={false}>
        <motion.main
          // Switching between chats stays on one Messages page (no page transition)
          key={pathname.startsWith("/messages") ? "/messages" : pathname}
          id='main'
          tabIndex={-1}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className={`flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 outline-none ${
            userData && !isLoginPath(pathname) ? "pb-28 md:pb-16" : "pb-16"
          }`}>
          {content}
        </motion.main>
      </AnimatePresence>
      <Footer />
      {/* Added: bottom navigation on phones */}
      {userData && !isLoginPath(pathname) && <MobileDock />}
      <Toast />
    </div>
  );
};

export default Body;
