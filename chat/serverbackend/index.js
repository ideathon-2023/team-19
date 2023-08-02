const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017", {
  dbName: "GhostTalk",
})
.then(() => console.log("Database Connected"))
.catch((e) => console.log(e));

const chatSchema = new mongoose.Schema({
  room: String,
  author: String,
  time: String,
  message: String,
});

const chat = mongoose.model("chat", chatSchema);

app.get("/chat/:room", async (req, res) => {
  try {
    const { room } = req.params;
    const chatHistory = await chat.find({ room }).exec();
    res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
                            
    chat.create({room:data.room,author:data.author,time:data.time,message:data.message});

    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
