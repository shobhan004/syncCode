const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const { ACTIONS } = require('./action.jsx');
const server = http.createServer(app);

const userSocketMap = {};
const roomCodeMap = {};
const roomInputMap = {};

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // No trailing slash!
        methods: ["GET", "POST"],
        credentials: true
    },
    // ✅ Versions match hain, par ye purane handshake versions ko handle kar lega
    allowEIO3: true, 
    // WebSocket ko priority do taaki stall na ho
    transports: ['websocket', 'polling'] 
});
function getAllClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId]?.username,
            isAdmin: userSocketMap[socketId]?.isAdmin,
        };
    });
}

io.on('connection', (socket) => {
    console.log('Connection established:', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        const isAdmin = !io.sockets.adapter.rooms.get(roomId);
        userSocketMap[socket.id] = { username, isAdmin };
        socket.join(roomId);

      // Sync Saved Data from Memory
        // if (roomCodeMap[roomId]) {
        //     io.to(socket.id).emit(ACTIONS.CODE_CHANGE, { code: roomCodeMap[roomId] });
        // }

        const clients = getAllClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    // ✅ DISCONNECTING Fix: Grace period ke saath
   socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        const user = userSocketMap[socket.id];
        const username = user?.username;

        rooms.forEach((roomId) => {
            if (roomId !== socket.id) {
                // BroadCast to others that this user is leaving
                socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                    socketId: socket.id,
                    username: username,
                });
            }
        });
        
        // Clean up from map
        delete userSocketMap[socket.id];
    });

    socket.on('disconnect', (reason) => {
        console.log(`❌ Muku permanently gaya. Reason: ${reason}`);
        delete userSocketMap[socket.id];
    });

    // Baki ke Events (Code, Input, Cursor, Typing)
    // socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    //     if (code !== null) {
    //         roomCodeMap[roomId] = code;
    //         socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    //     }
    // });

    socket.on(ACTIONS.SYNC_OUTPUT, ({ roomId, output }) => {
        io.to(roomId).emit(ACTIONS.SYNC_OUTPUT, { output });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.CURSOR_CHANGE, ({ roomId, lineNumber, username }) => {
        // 'volatile' use karne se network congestion kam hota hai (Cursor smooth chalega)
        socket.to(roomId).volatile.emit(ACTIONS.CURSOR_CHANGE, {
            lineNumber,
            username,
            socketId: socket.id // Frontend par 'if (socketId === socket.id) return' ke liye
        });
    });

    socket.on(ACTIONS.SYNC_INPUT, ({ roomId, stdin }) => {
        roomInputMap[roomId] = stdin;
        socket.to(roomId).emit(ACTIONS.SYNC_INPUT, { stdin });
    });

    socket.on(ACTIONS.TYPING, ({ roomId, username }) => {
        socket.to(roomId).emit(ACTIONS.TYPING, { username });
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Listening on the PORT ${PORT}`)); 