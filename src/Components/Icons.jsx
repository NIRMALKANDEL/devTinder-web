// UI: small inline SVG icons (no icon library needed)
const base = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const BackIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M15 18l-6-6 6-6' />
  </svg>
);

export const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M18 6L6 18M6 6l12 12' />
  </svg>
);

export const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z' />
  </svg>
);

export const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M20 6L9 17l-5-5' />
  </svg>
);

export const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
  </svg>
);

export const InboxIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M22 12h-6l-2 3h-4l-2-3H2' />
    <path d='M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' />
  </svg>
);

export const FlameIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z' />
  </svg>
);

export const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
    <circle cx='12' cy='7' r='4' />
  </svg>
);

export const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9' />
  </svg>
);
