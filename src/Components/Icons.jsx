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

// Added: external-link icon for the portfolio website link
export const LinkIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
    <path d='M15 3h6v6M10 14L21 3' />
  </svg>
);

// Added: icons for search, alerts, retry, editing, keyboard hints and password visibility
export const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <circle cx='11' cy='11' r='7' />
    <path d='M21 21l-4.35-4.35' />
  </svg>
);

export const AlertIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <circle cx='12' cy='12' r='10' />
    <path d='M12 8v4M12 16h.01' />
  </svg>
);

export const RefreshIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M21 12a9 9 0 1 1-2.64-6.36L21 8' />
    <path d='M21 3v5h-5' />
  </svg>
);

export const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M12 20h9' />
    <path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z' />
  </svg>
);

export const ArrowLeftIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M19 12H5M12 19l-7-7 7-7' />
  </svg>
);

export const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M5 12h14M12 5l7 7-7 7' />
  </svg>
);

export const EyeIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
    <circle cx='12' cy='12' r='3' />
  </svg>
);

export const EyeOffIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22' />
  </svg>
);

export const CompassIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <circle cx='12' cy='12' r='10' />
    <path d='M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z' />
  </svg>
);

// Added: GitHub mark (outline) and theme toggle icons
export const GithubIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22' />
  </svg>
);

export const SunIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <circle cx='12' cy='12' r='4' />
    <path d='M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41' />
  </svg>
);

export const MoonIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
  </svg>
);

// Added: icons for chat, settings, themes, safety (block/report) and filters
export const ChatIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
  </svg>
);

export const SendIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' />
  </svg>
);

export const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <circle cx='12' cy='12' r='3' />
    <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' />
  </svg>
);

export const PaletteIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M12 22a10 10 0 1 1 10-10c0 2.5-2 4-4.5 4H15a2 2 0 0 0-1.5 3.3A1.6 1.6 0 0 1 12 22z' />
    <circle cx='7.5' cy='11' r='1' />
    <circle cx='10.5' cy='7' r='1' />
    <circle cx='15.5' cy='7.5' r='1' />
  </svg>
);

export const FlagIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7' />
  </svg>
);

export const BanIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <circle cx='12' cy='12' r='10' />
    <path d='M4.93 4.93l14.14 14.14' />
  </svg>
);

export const MoreIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <circle cx='12' cy='5' r='1' />
    <circle cx='12' cy='12' r='1' />
    <circle cx='12' cy='19' r='1' />
  </svg>
);

export const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
    <path d='M10 11v6M14 11v6' />
  </svg>
);

export const FilterIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M22 3H2l8 9.46V19l4 2v-8.54z' />
  </svg>
);

export const SparklesIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <path d='M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z' />
    <path d='M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z' />
  </svg>
);

export const MonitorIcon = ({ className = "w-5 h-5" }) => (
  <svg {...base} className={className}>
    <rect x='2' y='3' width='20' height='14' rx='2' />
    <path d='M8 21h8M12 17v4' />
  </svg>
);
