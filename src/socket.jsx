import {io} from 'socket.io-client'

// helper function hai
export const initSocket = async () => {
    return io("https://synccode-production.up.railway.app", {
        forceNew: true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        // ✅ Pehle WebSocket try karo, ye fast hota hai
        transports: ['websocket', 'polling'], 
        withCredentials: true,
    });
};