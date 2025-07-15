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
app.use("/api/sessions", require("./routes/sessionRoutes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const rooms = {}; // { roomId: [socketId1, socketId2] }
const users = {}; // { socketId: username }

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    console.log(🚪 ${username} joined room: ${roomId});
    socket.join(roomId);
    socket.roomId = roomId;
    users[socket.id] = username || "User";

    if (!rooms[roomId]) rooms[roomId] = [];

    rooms[roomId].forEach((id) => {
      io.to(id).emit("user-joined", {
        userId: socket.id,
        username: users[socket.id],
      });
      socket.emit("user-joined", {
        userId: id,
        username: users[id],
      });
    });

    rooms[roomId].push(socket.id);
  });

  socket.on("check-room", (roomId, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    callback(!!room && room.size > 0);
  });

  socket.on("offer", ({ sdp, caller, target }) => {
    io.to(target).emit("offer", { sdp, caller });
  });

  socket.on("answer", ({ sdp, responder, target }) => {
    io.to(target).emit("answer", { sdp, responder });
  });

  socket.on("ice-candidate", ({ candidate, target }) => {
    io.to(target).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("leave-room", ({ roomId, username }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", { userId: socket.id, username });
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
    }
  });

  socket.on("disconnect", () => {
    const roomId = socket.roomId;
    const username = users[socket.id] || "User";
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      socket.to(roomId).emit("user-left", { userId: socket.id, username });
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(🚀 Server running on port ${PORT}));
