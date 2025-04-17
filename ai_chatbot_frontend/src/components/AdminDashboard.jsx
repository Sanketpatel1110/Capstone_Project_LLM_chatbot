import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [content, setContent] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/api/admin/get-markdown-content")
      .then(res => setContent(res.data))
      .catch(err => console.error(err));
  }, []);

  const deleteContent = async (id) => {
    await axios.delete(`http://localhost:8000/api/admin/delete-markdown-content/${id}`);
    setContent(content.filter(c => c._id !== id));
  };

  const styles = {
    page: {
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
      padding: "40px",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      color: "#d32f2f",
      textAlign: "center",
      fontSize: "35px",
      fontWeight: "700",
      marginBottom: "30px",
    },
    addButton: {
      backgroundColor: "#007bff",
      color: "white",
      padding: "10px 20px",
      fontSize: "16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      marginBottom: "30px",
    },
    card: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "15px 20px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: "18px",
      color: "#333",
      fontWeight: "500",
    },
    buttonGroup: {
      display: "flex",
      gap: "10px",
    },
    viewButton: {
      backgroundColor: "#28a745",
      color: "white",
      padding: "8px 12px",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
    },
    deleteButton: {
      backgroundColor: "#dc3545",
      color: "white",
      padding: "8px 12px",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <motion.h2
        style={styles.header}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h2>

      <button
        style={styles.addButton}
        onClick={() => navigate("/add-markdown-page")}
      >
        ➕ Add New Markdown Page
      </button>

      {content.length === 0 && (
        <p style={{ textAlign: "center", color: "#888" }}>
          No content available. Please add new content.
        </p>
      )}

      {content.map(item => (
        <div key={item._id} style={styles.card}>
          <span style={styles.title}>
            {item.title || "Untitled Page"}
          </span>
          <div style={styles.buttonGroup}>
            <button
              style={styles.viewButton}
              onClick={() => navigate(`/markdown-page/${item._id}`)}
            >
              View
            </button>
            <button
              style={styles.deleteButton}
              onClick={() => deleteContent(item._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
