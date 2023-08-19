const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const mongoose = require('mongoose');

const fileupload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'de6yfotqd', 
  api_key: '764193511939459', 
  api_secret: 'vzMKyAoCC38HANUekZJxDNOPrbk  ',
  secure: true
});

mongoose.connect("mongodb://127.0.0.1:27017", {
  dbName: "GhostTalk",
})
.then(() => console.log("Database Connected"))
.catch((e) => console.log(e));

const chatSchema = new mongoose.Schema({
  room: String,
  author: String,
  time: String,
  message: String,
  image: String,
});

const chat = mongoose.model("chat", chatSchema);

app.use(fileupload({
  useTempFiles:true
}))

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


app.post('/upload', (req, res) => {
  const file = req.files.photos; // Access the uploaded file using the name "photos"

  cloudinary.uploader.upload(file.tempFilePath, (err, result) => {
    if (err) {
      console.error('Error uploading image to Cloudinary:', err);
      // Handle error response
      return res.status(500).json({ error: 'Error uploading image' });
    }

    const imageUrl = result.secure_url;

    // Save the image URL in your database
    // Create a new chat message with the image URL
    const messageData = {
      room: data.room,
      author: data.author,
      time: data.time,
      message: data.message,
      imageUrl: imageUrl
    };

    chat.create(messageData);

    // Emit the message data with the image URL to all connected clients
    io.to(data.room).emit('receive_message', messageData);

    // Respond with success
    res.status(200).json({ imageUrl });
  });
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
