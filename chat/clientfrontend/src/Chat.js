import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import EmojiPicker from "emoji-picker-react";


import { AiOutlineCamera } from "react-icons/ai";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  const sendMessage = async () => {
    if (currentMessage.trim() !== "" ) {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,

        time: new Date(Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      
      setShowEmojiPicker(false);
    }
  };




  const handleEmojiSelect = (emoji) => {
    setCurrentMessage(currentMessage + emoji.emoji);
  };

  useEffect(() => {
    const getChatHistory = async () => {
      try {
        const response = await fetch(`http://192.168.29.84:3001/chat/${room}`);
        const chatHistory = await response.json();
        setMessageList(chatHistory);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    getChatHistory();

    socket.emit("join_room", room);
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
    return () => socket.removeListener("receive_message");
  }, [socket, room, username]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => (
            <div
              className="message"
              id={username === messageContent.author ? "you" : "other"}
              key={index}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                  

                  
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
      {showEmojiPicker && (
        <div className="emoji-picker" style={{ position: 'relative', bottom: '460px', left: '50px',width: '0px' }}>
          <EmojiPicker onEmojiClick={handleEmojiSelect} preload />
        </div>
      )}

        <input
          type="text"
          value={currentMessage}
          placeholder="Type your message..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <input
          type="file"
          name="myImage"

          accept="image/*"
          id="image-input"
          style={{ display: "none" }}
        />
        <label htmlFor="image-input">
          <div className="camera-icon-container">
          <AiOutlineCamera className="camera-icon" style={{ fontSize: "45px" }} />
          </div>
        </label>
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ fontSize: "24px", padding: "6px 12px" }}
        >
          😄
        </button>
        <button
          onClick={sendMessage}
          style={{ fontSize: "24px", padding: "6px 12px" }}
        >
          &#9658;
        </button>
      </div>
    </div>
  );
}

export default Chat;