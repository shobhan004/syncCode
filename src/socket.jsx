import {io} from 'socket.io-client'

// helper function hai
export const initSocket = async () => {
    return io("https://synccode-production.up.railway.app", {
        forceNew: true,
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        // Pehle polling try karo, fir websocket par upgrade hoga
        transports: ['polling', 'websocket'], 
        withCredentials: true,
    });
};