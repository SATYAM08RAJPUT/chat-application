import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

import axios from "axios";
import "./chat.css";

const socket = io("http://localhost:7002");

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const name = prompt("Enter your name:");
    setUsername(name || "Anonymous");
  }, []);

  useEffect(() => {
    axios.get("http://localhost:7001/messages").then((res) => {
      setMessages(res.data);
    });

    socket.on("chat message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit("chat message", {
        username,
        message: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-header">Chat App</h2>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-bubble ${
              msg.username === username ? "sender" : "receiver"
            }`}
          >
            <div className="message-text">{msg.message}</div>
            <div className="message-meta">
              <span>{msg.username}</span> |{" "}
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
