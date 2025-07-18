

// ================== SERVER: index.js ==================
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "https://skillswap-client-jm4y.onrender.com",
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("SkillSwap API is running...");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
const sessionRoutes = require("./routes/sessionRoutes");
app.use("/api/sessions", sessionRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // { roomId: [socketId1, socketId2] }


io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(socket.id);

    // Notify others in the room (except the new user)
    socket.to(roomId).emit("user-joined");

    // Clean up on disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      if (rooms[roomId]) {
  rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
  
  if (rooms[roomId].length === 0) {
    delete rooms[roomId]; // clean up empty room
  }
}

    });
  });

  socket.on("leave-room", (roomId) => {
  console.log(`${socket.id} is leaving room ${roomId}`);
  socket.leave(roomId);
  rooms[roomId] = rooms[roomId]?.filter(id => id !== socket.id);
  if (rooms[roomId]?.length === 0) {
    delete rooms[roomId];
  }
});


  socket.on("offer", ({ offer, roomId }) => {
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ answer, roomId }) => {
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ candidate, roomId }) => {
    socket.to(roomId).emit("ice-candidate", { candidate });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
