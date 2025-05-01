import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API = process.env.REACT_APP_API_URL;

const ChatbotPage = ({ darkMode }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

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
        .post(`${API}/api/login`, {
          email: "user@example.com",
          password: "yourpassword",
        })
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

  const fetchChatHistory = async (session, chat) => {
    try {
      const res = await axios.get(`${API}/api/chat/history`, {
        params: { session_id: session, chat_id: chat },
      });

      if (res.data.history && res.data.history.length > 0) {
        const formatted = res.data.history.map((msg) => ({
          sender: msg.role === "user" ? "user" : "bot",
          text: msg.message,
          timestamp: msg.timestamp,
        }));

        setMessages(formatted);

        const previewMsg =
          formatted.find((m) => m.sender === "user")?.text || "New Chat";

        setChatHistory((prevHistory) => {
          const alreadyExists = prevHistory.some((c) => c.chat_id === chat);
          const newEntry = {
            chat_id: chat,
            preview: previewMsg,
            messages: formatted,
          };

          return alreadyExists
            ? prevHistory.map((item) =>
              item.chat_id === chat ? newEntry : item
            )
            : [...prevHistory, newEntry];
        });
      }
    } catch (error) {
      console.error(" Error fetching chat history:", error);
    }
  };

  const fetchSidebarChats = async (session) => {
    try {
      const res = await axios.get(`${API}/api/chat/all-chats`, {
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

  const startNewSession = async () => {
    const storedSession = sessionStorage.getItem("chatSessionId");
    try {
      const res = await axios.post(
        `${API}/api/chat/new?session_id=${storedSession}`
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/chat/`, {
        query: input.trim(),
        session_id: sessionStorage.getItem("chatSessionId"),
        chat_id: sessionStorage.getItem("chatId"),
      });

      const botMessage = {
        sender: "bot",
        text: res.data.response || "No response from AI.",
      };

      setMessages([...updatedMessages, botMessage]);
      fetchSidebarChats(sessionStorage.getItem("chatSessionId"));
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { sender: "bot", text: " Error: Unable to get response." },
      ]);
    }

    setLoading(false);
  };

  const handleDeleteChat = async (chat_id) => {
    const session_id = sessionStorage.getItem("chatSessionId");
  
    try {
      await axios.delete(`${API}/api/chat/delete`, {
        data: { session_id, chat_id },
      });
  
      setChatHistory((prev) => prev.filter((chat) => chat.chat_id !== chat_id));
  
      if (selectedChat?.chat_id === chat_id) {
        setMessages([]);
        setSelectedChat(null);
      }
  
      toast.success("🗑 Chat deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        theme: "colored",
      });
    } catch (err) {
      console.error("Failed to delete chat:", err);
      toast.error(" Failed to delete chat.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        theme: "colored",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        // display: "flex",
        // height: "100vh",
        // overflowY: "auto",
        display: "flex",
        flexDirection: "row",
        minHeight: "100vh",
        height: "100dvh", // modern mobile-friendly
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: darkMode ? "#0d1117" : "#f8f9fa",
        color: darkMode ? "#e6edf3" : "#222",
        transition: "all 0.3s ease-in-out"
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          background: darkMode ? "#161b22" : "#12151f",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <button
            onClick={startNewSession}
            style={{
              backgroundColor: "#2d3748",
              color: "#fff",
              padding: "10px 12px",
              width: "100%",
              border: "none",
              borderRadius: "8px",
              marginBottom: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            + New Chat
          </button>

          <select
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              background: "#2d3748",
              color: "#fff",
              border: "none",
              marginBottom: "20px",
            }}
          >
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
          </select>

          <div style={{ overflowY: "auto", maxHeight: "55vh" }}>
            {chatHistory.length ? (
              chatHistory.map((chat, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor:
                      selectedChat?.chat_id === chat.chat_id
                        ? "#2d3748"
                        : "transparent",
                    padding: "10px",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setChatId(chat.chat_id);
                    setMessages(chat.messages);
                    setSelectedChat(chat);
                    console.log("Selected Chat:", chat, "Session:", sessionId);
                    fetchChatHistory(sessionId, chat.chat_id);
                  }}
                >
                  <span style={{ color: "#e0e0e0", flex: 1 }}>
                    💬 {chat.preview.slice(0, 22)}...
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatHistory(
                        chatHistory.filter((c) => c.chat_id !== chat.chat_id)
                      );
                      handleDeleteChat(chat.chat_id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "#aaa" }}>No chats yet</p>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <img
            src="https://i.pravatar.cc/100"
            alt="avatar"
            style={{ borderRadius: "50%", marginBottom: "8px" }}
          />
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#2d3748",
              color: "white",
              border: "none",
              borderRadius: "6px",
              marginTop: "8px",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
          <p style={{ fontSize: "12px", color: "#bbb", marginTop: "10px" }}>
            Developed by <a href="#" style={{ color: "#00bcd4" }}>Urby_Experts</a>
          </p>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ textAlign: "center", marginBottom: "16px" }}>🤖 My Chatbot</h2>

        <div
          style={{
            flex: 1,
            backgroundColor: darkMode ? "#1e293b" : "#fff",
            borderRadius: "10px",
            padding: "20px",
            overflowY: "auto",
            boxShadow: darkMode
              ? "0 2px 6px rgba(255, 255, 255, 0.05)"
              : "0 2px 6px rgba(0,0,0,0.08)",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  backgroundColor:
                    msg.sender === "user"
                      ? "#007bff"
                      : darkMode
                        ? "#2d3748"
                        : "#f1f1f1",
                  color:
                    msg.sender === "user"
                      ? "#fff"
                      : darkMode
                        ? "#e6edf3"
                        : "#000",
                  padding: "12px 16px",
                  borderRadius: "20px",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                }}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <p style={{ textAlign: "center", color: "#888" }}>Thinking...</p>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} style={{ display: "flex", marginTop: "16px" }}>
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "15px",
              backgroundColor: darkMode ? "#0d1117" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          />
          <button
            type="submit"
            style={{
              marginLeft: "8px",
              padding: "12px 18px",
              backgroundColor: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🖊 SEND
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ChatbotPage;
