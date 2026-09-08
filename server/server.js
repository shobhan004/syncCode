const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { ACTIONS } = require("./action");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require("dotenv").config();
console.log("ENV CHECK:", {
  PORT: process.env.PORT,
  KEY: process.env.GEMINI_API_KEY ? "LOADED" : "MISSING",
});

/* -------------------- AI CONFIG -------------------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* -------------------- CORS -------------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://realtime-code-editor-ae35c.firebaseapp.com",
  "https://realtime-code-editor-ae35c.web.app"
];

const app = express();
const server = http.createServer(app);

app.use(express.json()); // ✅ JSON body parse karne ke liye

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
    credentials: false,
  })
);

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.send("SyncCode Server mast chal raha hai bhai!");
});

/* -------------------- CODE EXECUTION -------------------- */
app.post("/execute", async(req, res) => {
  const { language, version, code, stdin } = req.body;


  const languageIds = {
    javascript: 63,
    python: 71,
    "c++": 54,
    java: 62,
  };

  const language_id = languageIds[language];
  if (!language_id) return res.status(400).json({ error: "Unsupported language" });

  try {
    // Step 1: Submit
    const submitRes = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language_id, source_code: code, stdin: stdin || "" }),
      }
    );
    const { token } = await submitRes.json();

    // Step 2: Poll result
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const pollRes = await fetch(
        `https://ce.judge0.com/submissions/${token}?base64_encoded=false`
      );
      result = await pollRes.json();
      if (result.status?.id >= 3) break;
    }

    res.json(result);
  } catch (err) {
    console.error("Judge0 Error:", err.message);
    res.status(500).json({ error: "Execution failed" });
  }
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
// 1st to trigger when clinet user makes connction

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  // --- Join Room ---
  // socket.on mtlb sunna and socket.emit mtlb bolna 
  socket.on(ACTIONS.JOIN, ({ roomId , username }) => {
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

  // --- AI Prompt ---
  socket.on("SEND_AI_PROMPT", async ({ roomId, prompt }) => {
    if (!prompt || !prompt.trim()) return;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const result = await model.generateContent(
        `You are SyncCode AI, a helpful coding assistant. Use Markdown for code.\n\nUser Question: ${prompt}`
      );

      const response = await result.response;
      const text = response.text();

      console.log("Ai logs received" , text);

      // io.to(roomId).emit("ADD_MESSAGE", {
      //   text,
      //   username: "SyncCode AI",
      //   isAi: true,
      //   timestamp: Date.now(),
      // });

      socket.emit("ADD_MESSAGE" , {
      text,
      username: "SyncCode AI",
        isAi: true,
        timestamp: Date.now(),
      });

    } catch (err) {
      console.error("🔥 Gemini Error:", err.message);

    socket.emit("ADD_MESSAGE", {
  text: "⚠️ AI temporarily unavailable. Please try again.",
  username: "SyncCode AI",
  isAi: true,
  timestamp: Date.now(),
});
    }
  });

  // --- Code & Editor Sync ---


  socket.on(ACTIONS.CURSOR_CHANGE, ({ roomId, lineNumber, username }) => {
    socket.to(roomId).volatile.emit(ACTIONS.CURSOR_CHANGE, {
      lineNumber,
      username,
      socketId: socket.id,
    });
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
