import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import { FlameIcon, InboxIcon, LogoutIcon, UserIcon, UsersIcon } from "./Icons";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { removeFeed } from "../utils/feedSlice";
import { removeConnections } from "../utils/connectionSlice";
import { removeRequests } from "../utils/requestSlice";
import { showToast } from "../utils/toastSlice";
import { fetchRequests, getErrorMessage } from "../utils/api";

const NAV_LINKS = [
  { to: "/", label: "Feed", Icon: FlameIcon, end: true },
  { to: "/connections", label: "Connections", Icon: UsersIcon },
  { to: "/requests", label: "Requests", Icon: InboxIcon },
];

const NavBar = () => {
  const user = useSelector((store) => store.user);
  // Added: pending request count for a small badge (only once requests are loaded)
  const pendingCount = useSelector((store) => store.requests?.length || 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const requestsLoaded = useSelector((store) => store.requests !== null);

  // Added: load the pending-request count once per login so the badge is right on every page
  const countFor = useRef(null);
  useEffect(() => {
    if (!user?._id || requestsLoaded || countFor.current === user._id) return;
    countFor.current = user._id;
    fetchRequests(dispatch).catch(() => {}); // badge is optional; the Requests page shows errors
  }, [user?._id, requestsLoaded, dispatch]);

  const handelLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      // Fixed: also clear the cached feed / connections / requests, otherwise the next
      // account to log in on this tab saw the previous user's data
      dispatch(removeFeed());
      dispatch(removeConnections());
      dispatch(removeRequests());
      countFor.current = null;
      return navigate("/login", { replace: true });
    } catch (err) {
      // Changed: tell the user instead of failing silently
      dispatch(showToast(getErrorMessage(err, "Couldn't log out. Please try again."), "error"));
    } finally {
      setLoggingOut(false);
    }
  };

  // UI: closes the focus-based daisyUI dropdown after a menu item is clicked
  const closeMenu = () => document.activeElement?.blur();

  const menuLinkClass = ({ isActive }) =>
    `rounded-lg p-2 gap-3 ${isActive ? "menu-active" : ""}`;

  const countBadge = (label) =>
    label === "Requests" && pendingCount > 0 ? (
      <span className='badge badge-primary badge-xs tabular min-w-5'>{pendingCount}</span>
    ) : null;

  return (
    // UI: floating glass navbar, sticky so navigation is always reachable
    <header className='sticky top-0 z-40 px-3 sm:px-4 pt-3'>
      <nav
        aria-label='Main'
        className='liquid-glass max-w-6xl mx-auto rounded-2xl h-16 pl-2 pr-2 sm:pl-3 flex items-center gap-2'>
        <Link
          to='/'
          className='flex items-center gap-2 px-2 py-1.5 rounded-xl text-lg font-bold tracking-tight mr-auto transition-colors hover:text-primary'>
          <span className='w-8 h-8 rounded-[10px] bg-primary text-primary-content flex items-center justify-center shadow-md'>
            <FlameIcon className='w-[18px] h-[18px]' />
          </span>
          DevTinder
        </Link>

        {user && (
          <>
            {/* UI: links with a sliding active pill on larger screens */}
            <div className='hidden md:flex items-center gap-1'>
              {NAV_LINKS.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? "text-primary" : "opacity-75 hover:opacity-100"
                    }`
                  }>
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId='nav-active-pill'
                          className='absolute inset-0 rounded-xl tint-primary'
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <Icon className='relative w-4 h-4' />
                      <span className='relative'>{label}</span>
                      <span className='relative'>{countBadge(label)}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Welcome Message */}
            <div className='hidden lg:block text-sm opacity-80 pl-3 ml-1 border-l border-hairline'>
              Welcome <span className='font-semibold'>{user.firstName}</span>
            </div>

            {/* Added: light / dark mode switch */}
            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className='dropdown dropdown-end'>
              <div
                tabIndex={0}
                role='button'
                aria-label='User menu'
                className='btn btn-ghost btn-circle transition-transform hover:scale-105 relative p-0'>
                <Avatar
                  src={user.photoURL}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  className='w-10 h-10 ring-2 ring-primary ring-offset-2 ring-offset-base-100'
                  textClass='text-sm'
                />
                {pendingCount > 0 && (
                  <span
                    className='md:hidden absolute top-0 right-0 w-3 h-3 rounded-full bg-primary ring-2 ring-base-100'
                    aria-label={`${pendingCount} pending requests`}></span>
                )}
              </div>
              <ul
                tabIndex={0}
                onClick={closeMenu}
                className='menu menu-sm dropdown-content liquid-glass rounded-2xl z-50 mt-3 w-60 p-2'>
                <li className='menu-title'>
                  <span className='truncate'>
                    Hi, {user.firstName}
                  </span>
                </li>
                <li>
                  <NavLink to='/profile' className={menuLinkClass}>
                    <UserIcon className='w-4 h-4' />
                    Profile
                  </NavLink>
                </li>
                {/* UI: page links only needed in the dropdown on small screens */}
                {NAV_LINKS.map(({ to, label, Icon, end }) => (
                  <li key={to} className='md:hidden'>
                    <NavLink to={to} end={end} className={menuLinkClass}>
                      <Icon className='w-4 h-4' />
                      {label}
                      <span className='ml-auto'>{countBadge(label)}</span>
                    </NavLink>
                  </li>
                ))}
                <li aria-hidden='true' className='border-t border-hairline my-1'></li>
                <li>
                  <button
                    type='button'
                    className='rounded-lg p-2 gap-3 text-error'
                    disabled={loggingOut}
                    onClick={handelLogout}>
                    {loggingOut ? (
                      <span className='loading loading-spinner loading-xs'></span>
                    ) : (
                      <LogoutIcon className='w-4 h-4' />
                    )}
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
        {/* Added: theme switch is also available when logged out */}
        {!user && <ThemeToggle />}
      </nav>
    </header>
  );
};

export default NavBar;
