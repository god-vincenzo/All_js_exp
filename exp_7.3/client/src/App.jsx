import React, { useEffect, useState } from "react";
import socket from "./socket";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && name.trim()) {
      const time = new Date().toLocaleTimeString();
      socket.emit("sendMessage", { name, message, time });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2>Real-Time Chat</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="chat-box">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.name}</strong> [{msg.time}]: {msg.message}
          </p>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
