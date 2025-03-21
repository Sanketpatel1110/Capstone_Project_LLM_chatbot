import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState("");
  const [error, setError] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const navigate = useNavigate();
  const chatEndRef = useRef(null); // Ref for scrolling to the latest message

  useEffect(() => {
    const storedSession = sessionStorage.getItem("chatSessionId");
    const storedChat = sessionStorage.getItem("chatId");
    if (storedSession && storedChat) {
      setSessionId(storedSession);
      setChatId(storedChat);
      fetchChatHistory(storedSession, storedChat);
      fetchSidebarChats(storedSession);
    } else {

      axios
        .post("http://localhost:8000/api/login", { email: "user@example.com", password: "yourpassword" })
        .then((res) => {
          const newSession = res.data.session_id;
          const newChat = res.data.chat_id;

          sessionStorage.setItem("chatSessionId", newSession);
          sessionStorage.setItem("chatId", newChat);

          setSessionId(newSession);
          setChatId(newChat);
          fetchChatHistory(newSession, newChat);
          fetchSidebarChats(newSession);
        })
        .catch((err) => console.error("Login error:", err));
    }
  }, []);

  // ✅ Start new chat
  const startNewSession = async () => {
    const storedSession = sessionStorage.getItem("chatSessionId");
    try {
      const res = await axios.post(
        `http://localhost:8000/api/chat/new?session_id=${storedSession}`
      );
      const newChatId = res.data.chat_id;
      sessionStorage.setItem("chatId", newChatId);
      setChatId(newChatId);
      setMessages([]);
      fetchSidebarChats(storedSession);
    } catch (err) {
      console.error("Failed to start new chat:", err);
    }
  };


const fetchChatHistory = async (session, chat) => {
  try {
    const res = await axios.get(`http://localhost:8000/api/chat/history`, {
      params: { session_id: session, chat_id: chat },
    });

    if (res.data.history && res.data.history.length > 0) {
      const formatted = res.data.history.map((msg) => {
        return {
          sender: msg.role === "user" ? "user" : "bot",  // ✅ Fix this line
          text: msg.message,
          timestamp: msg.timestamp,
        };
      });

      setMessages(formatted);

      const previewMsg = formatted.find((m) => m.sender === "user")?.text || "New Chat";

      setChatHistory((prevHistory) => {
        const alreadyExists = prevHistory.some((c) => c.chat_id === chat);
        const newEntry = {
          chat_id: chat,
          preview: previewMsg,
          messages: formatted,
        };

        return alreadyExists
          ? prevHistory.map((item) => (item.chat_id === chat ? newEntry : item))
          : [...prevHistory, newEntry];
      });
    }
  } catch (error) {
    console.error("❌ Error fetching chat history:", error.response?.data || error);
  }
};

// ✅ Load all chats for sidebar
const fetchSidebarChats = async (session) => {
  try {
    const res = await axios.get("http://localhost:8000/api/chat/all-chats", {
      params: { session_id: session },
    });

    const sidebarChats = res.data.chats.map((chat) => ({
      chat_id: chat.chat_id,
      preview: chat.preview,
      messages: chat.messages.map((msg) => ({
        sender: msg.role === "user" ? "user" : "bot",
        text: msg.message,
      })),
    }));

    setChatHistory(sidebarChats);
  } catch (err) {
    console.error("Failed to fetch sidebar chats:", err);
  }
};

const handleSend = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;

  const userMessage = { sender: "user", text: input.trim() };
  const updatedMessages = [...messages, userMessage];

  setMessages(updatedMessages);
  setInput("");
  setLoading(true);

  try {
      const storedSession = sessionStorage.getItem("chatSessionId");
      console.log("Stored Session:", storedSession);
      console.log("Stored Chat:", chatId, sessionStorage.getItem("chatId"));

      const query = input.trim();
      const session_id = sessionStorage.getItem("chatSessionId");
      const chat_id = sessionStorage.getItem("chatId");

      console.log("Query:", query, "Session:", session_id, "Chat:", chat_id);

      if (!query || !session_id || !chat_id) {
        console.error("Missing one or more required fields");
        return;
      }

      const res = await axios.post("http://localhost:8000/api/chat/", {
          query: input.trim(),
          session_id: storedSession,
          // session_id: sessionStorage.getItem("chatSessionId"),
          chat_id: sessionStorage.getItem("chatId"),
      });

      console.log("Response:", res.data);

      const botMessage = { sender: "bot", text: res.data.response || "No response from AI." };
      setMessages([...updatedMessages, botMessage]);
      fetchSidebarChats(sessionStorage.getItem("chatSessionId"));

      // ✅ Refresh chat history but keep the session intact
      // fetchChatHistory(storedSession);
  } catch (error) {
      console.error("Error:", error);
      setMessages([...updatedMessages, { sender: "bot", text: "⚠️ Error: Unable to get a response from the server." }]);
  }

    setLoading(false);
  };

  // ✅ Function to Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // ✅ Scroll to the bottom when a new message is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar for Chat History */}
      <div style={{ width: "250px", backgroundColor: "#1c1c24", padding: "15px", color: "white", display: "flex", flexDirection: "column" }}>
        <button
          style={{
            backgroundColor: "#444",
            color: "white",
            padding: "10px",
            border: "none",
            width: "100%",
            borderRadius: "5px",
            marginBottom: "15px",
          }}
          onClick={startNewSession}

        >
          + New Chat
        </button>

        <select style={{ padding: "8px", marginBottom: "15px", width: "100%", backgroundColor: "#333", color: "white", border: "none", borderRadius: "5px" }}>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-4o-mini">GPT-4o Mini</option>
        </select>

<div style={{ flex: 1, overflowY: "auto" }}>
  {chatHistory.length > 0 ? (
    chatHistory.map((chat, index) => (
      <div
        key={index}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px",
          cursor: "pointer",
          backgroundColor: selectedChat?.chat_id === chat.chat_id ? "#444" : "transparent",
          borderBottom: "1px solid #666",
        }}
        onClick={() => {
          setChatId(chat.chat_id);
          setMessages(chat.messages);
          setSelectedChat(chat);
          fetchChatHistory(sessionId, chat.chat_id);
          console.log("Selected Chat:", chat)
        }}
      >
        <span style={{ color: "#fff", flex: 1 }}>💬 {chat.preview.substring(0, 20)}...</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setChatHistory(chatHistory.filter((c) => c.chat_id !== chat.chat_id));
          }}
          style={{
            backgroundColor: "transparent",
            border: "none",
            color: "gray",
            cursor: "pointer",
          }}
        >
          🗑
        </button>
      </div>
    ))
  ) : (
    <p style={{ color: "gray", textAlign: "center" }}>No chats yet</p>
  )}
</div>

        {/* Profile and Sign Out */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <img src="https://i.pravatar.cc/100" alt="User Avatar" style={{ borderRadius: "50%" }} />
          <button onClick={handleLogout}
            style={{
              marginTop: "10px",
              padding: "8px",
              backgroundColor: "#444",
              color: "white",
              border: "none",
              borderRadius: "5px",
              width: "100%",
            }}
          >
            Sign Out
          </button>
          <p style={{ fontSize: "12px", marginTop: "10px" }}>Developed by <a href="#" style={{ color: "lightblue" }}>Om V. Patel</a></p>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px" }}>
        <h2 style={{ textAlign: "center" }}>My Chatbot</h2>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            height: "400px",
            overflowY: "scroll",
            padding: "16px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.sender === "bot" ? "left" : "right",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: "16px",
                  backgroundColor: msg.sender === "bot" ? "#f0f0f0" : "#007bff",
                  color: msg.sender === "bot" ? "#000" : "#fff",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </span>
            </div>
          ))}
          {loading && <p style={{ textAlign: "center" }}>Thinking...</p>}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ marginTop: "10px", display: "flex" }}>
          <input
            style={{ flex: 1, padding: "10px" }}
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "8px",
              marginLeft: "8px",
            }}
            type="submit"
          >
            🖊 SEND
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotPage;
