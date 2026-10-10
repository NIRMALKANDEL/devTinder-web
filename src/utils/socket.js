import { io } from "socket.io-client";

// Added: one Socket.IO connection for chat. It goes through the same "/api" proxy as
// the REST calls (Vite in dev, nginx in production), so the login cookie is sent and
// the server authenticates it. Connect after login, disconnect on logout.
let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("/", {
      path: "/api/socket.io",
      withCredentials: true,
      autoConnect: false,
      // default transports: start with HTTP long-polling, upgrade to WebSocket when
      // the proxy allows it, so chat still works if a proxy blocks WebSockets
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};
