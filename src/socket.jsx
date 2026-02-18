import { io } from "socket.io-client";

const URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080"
    :  import.meta.env.VITE_BACKEND_URL;

export const initSocket = () => {
  return io(URL, {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 20000,
    transports: ["polling", "websocket"],
  });
};