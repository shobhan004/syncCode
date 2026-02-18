const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { ACTIONS } = require("./action");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config(); // Environment variables ke liye

const app = express();
const server = http.createServer(app);

require("dotenv").config();
console.log("ENV CHECK:", {
  PORT: process.env.PORT,
  KEY: process.env.GEMINI_API_KEY ? "LOADED" : "MISSING",
});

/* -------------------- AI CONFIG -------------------- */
// API Key yahan hai, par testing ke baad ise process.env.GEMINI_API_KEY mein daal dena


// NOTE: Is API Key ko .env file mein daal dena production ke time
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// async function listModels() {
//   try {
//     const models = await ai.models.list();
//     console.log("Available models:", models);
//   } catch (err) {
//     console.error(err);
//   }
// }

// listModels();

// ✅ FIX: apiVersion: 'v1' add kiya hai taaki 404 error na aaye

/* -------------------- CORS -------------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://realtime-code-editor-ae35c.firebaseapp.com",
  "https://realtime-code-editor-ae35c.web.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: false, // keep false since we removed withCredentials on client
  })
);



/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("SyncCode Server mast chal raha hai bhai!");
});

/* -------------------- SOCKET.IO -------------------- */
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: false,
  },
  transports: ["polling", "websocket"],
});

/* -------------------- MEMORY MAPS -------------------- */
const userSocketMap = {};
const roomInputMap = {};

/* -------------------- HELPER -------------------- */
function getAllClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId]?.username,
      isAdmin: userSocketMap[socketId]?.isAdmin,
    })
  );
}

/* -------------------- CONNECTION -------------------- */
io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  // --- Join Room ---
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    const isAdmin = !io.sockets.adapter.rooms.get(roomId);
    userSocketMap[socket.id] = { username, isAdmin };
    socket.join(roomId);

    const clients = getAllClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

 socket.on("SEND_AI_PROMPT", async ({ roomId, prompt }) => {
  if (!prompt || !prompt.trim()) return;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // ✅ SAFE MODEL
    });

    const result = await model.generateContent(
      `You are SyncCode AI, a helpful coding assistant. Use Markdown for code.\n\nUser Question: ${prompt}`
    );

    const response = await result.response;
    const text = response.text(); // ✅ SIMPLE & SAFE

    io.to(roomId).emit("ADD_MESSAGE", {
      text,
      username: "SyncCode AI",
      isAi: true,
      timestamp: Date.now(),
    });

  } catch (err) {
    console.error("🔥 Gemini Error:", err.message);

    io.to(roomId).emit("ADD_MESSAGE", {
      text: "⚠️ AI temporarily unavailable. Please try again.",
      username: "SyncCode AI",
      isAi: true,
    });
  }
});

  // --- Code & Editor Sync ---
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.CURSOR_CHANGE, ({ roomId, lineNumber, username }) => {
    socket.to(roomId).volatile.emit(ACTIONS.CURSOR_CHANGE, {
      lineNumber,
      username,
      socketId: socket.id,
    });
  });

  socket.on(ACTIONS.TYPING, ({ roomId, username }) => {
    socket.to(roomId).emit(ACTIONS.TYPING, { username });
  });

  // --- Output & Input Sync ---
  socket.on(ACTIONS.SYNC_OUTPUT, ({ roomId, output }) => {
    io.to(roomId).emit(ACTIONS.SYNC_OUTPUT, { output });
  });

  socket.on(ACTIONS.SYNC_INPUT, ({ roomId, stdin }) => {
    roomInputMap[roomId] = stdin;
    socket.to(roomId).emit(ACTIONS.SYNC_INPUT, { stdin });
  });

  // --- Disconnect Logic ---
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    const username = userSocketMap[socket.id]?.username;

    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username,
        });
      }
    });

    delete userSocketMap[socket.id];
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected:", reason);
  });
});

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SyncCode Server running on port ${PORT}`);
});