import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { NAV_LINKS } from "../utils/navLinks";
import { UserIcon } from "./Icons";

// Added: bottom tab bar on phones (the top navbar only shows the logo there).
// 5 tabs max, labels always visible, 44px+ touch targets, clear of the home indicator.
const TABS = [...NAV_LINKS, { to: "/profile", label: "Profile", Icon: UserIcon }];

const MobileDock = () => {
  const pending = useSelector((store) => store.requests?.length || 0);
  const unread = useSelector((store) =>
    Object.values(store.chat.unread).reduce((sum, n) => sum + n, 0)
  );
  const badgeFor = (label) => (label === "Requests" ? pending : label === "Messages" ? unread : 0);

  return (
    <nav
      aria-label='Main (mobile)'
      className='md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pt-2 dock-bar pointer-events-none'>
      <ul className='liquid-glass rounded-2xl grid grid-cols-5 p-1 pointer-events-auto max-w-md mx-auto'>
        {TABS.map(({ to, label, Icon, end }) => {
          const badge = badgeFor(label);
          return (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                aria-label={badge ? `${label}, ${badge} new` : label}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-0.5 min-h-12 rounded-xl text-[11px] font-medium transition-colors ${
                    isActive ? "text-primary" : "opacity-70"
                  }`
                }>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId='dock-active-pill'
                        className='absolute inset-0 rounded-xl tint-primary'
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className='relative'>
                      <Icon className='w-5 h-5' />
                      {badge > 0 && (
                        <span className='absolute -top-1.5 -right-2.5 badge badge-primary badge-xs tabular min-w-4 px-1'>
                          {badge > 9 ? "9+" : badge}
                        </span>
                      )}
                    </span>
                    <span className='relative'>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileDock;
