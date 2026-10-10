import { ChatIcon, FlameIcon, InboxIcon, UsersIcon } from "../Components/Icons";

// Main pages, shared by the top navbar and the mobile dock
export const NAV_LINKS = [
  { to: "/", label: "Feed", Icon: FlameIcon, end: true },
  { to: "/connections", label: "Connections", Icon: UsersIcon },
  // Added: chat
  { to: "/messages", label: "Messages", Icon: ChatIcon },
  { to: "/requests", label: "Requests", Icon: InboxIcon },
];
