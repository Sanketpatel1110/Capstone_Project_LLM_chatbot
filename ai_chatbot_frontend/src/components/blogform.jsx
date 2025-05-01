

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const BlogForm = ({ darkMode }) => {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    summary: "",
    introduction: "",
    explanation: "",
    sessions: [{ name: "", link: "" }],
    takeaways: [{ name: "", link: "" }],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, field, type) => (e) => {
    const updated = [...formData[type]];
    updated[index][field] = e.target.value;
    setFormData({ ...formData, [type]: updated });
  };

  const addField = (type) => {
    setFormData({ ...formData, [type]: [...formData[type], { name: "", link: "" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(" Blog submitted and stored in vector DB!");
        setFormData({
          title: "",
          date: "",
          summary: "",
          introduction: "",
          explanation: "",
          sessions: [{ name: "", link: "" }],
          takeaways: [{ name: "", link: "" }],
        });
      } else {
        alert(" Error submitting blog.");
      }
    } catch (err) {
      console.error(" Submission error:", err);
      alert(" Error connecting to backend.");
    }
  };

  const styles = {
    page: {
      padding: "40px 80px",
      backgroundColor: darkMode ? "#0d1117" : "#f5f7fa",
      color: darkMode ? "#e6edf3" : "#000",
      fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh",
    },
    input: {
      display: "block",
      margin: "10px 0",
      padding: "10px",
      width: "100%",
      borderRadius: "8px",
      backgroundColor: darkMode ? "#161b22" : "#fff",
      border: darkMode ? "1px solid #30363d" : "1px solid #ccc",
      color: darkMode ? "#fefefe" : "#000",
    },
    label: {
      marginTop: "20px",
      fontWeight: "bold",
      color: darkMode ? "#fefefe" : "#000",
    },
    primaryBtn: {
      marginTop: "20px",
      padding: "10px 20px",
      borderRadius: "8px",
      backgroundColor: darkMode ? "#2da44e" : "#007bff",
      border: "none",
      color: "#fff",
      fontWeight: "bold",
      cursor: "pointer",
    },
    secondaryBtn: {
      marginTop: "10px",
      padding: "8px 16px",
      borderRadius: "6px",
      backgroundColor: "transparent",
      border: darkMode ? "1px solid #30363d" : "1px solid #ccc",
      color: darkMode ? "#c9d1d9" : "#000",
      fontWeight: "500",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.page}>
      <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>Create New Blog</h2>
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Title</label>
        <input
          style={styles.input}
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter blog title"
          required
        />

        <label style={styles.label}>Date</label>
        <input
          style={styles.input}
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label style={styles.label}>Summary</label>
        <textarea
          style={{ ...styles.input, minHeight: "80px" }}
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          required
        />

        <label style={styles.label}>Introduction</label>
        <textarea
          style={{ ...styles.input, minHeight: "100px" }}
          name="introduction"
          value={formData.introduction}
          onChange={handleChange}
          required
        />

        <label style={styles.label}>Explanation (Markdown)</label>
        <textarea
          style={{ ...styles.input, minHeight: "120px" }}
          name="explanation"
          value={formData.explanation}
          onChange={handleChange}
          required
        />

        {formData.explanation && (
          <div style={{ marginTop: "20px" }}>
            <h4 style={styles.label}>Preview</h4>
            <div
              style={{
                ...styles.input,
                backgroundColor: darkMode ? "#0e1525" : "#fafafa",
                border: "1px solid #888",
                padding: "16px",
              }}
            >
              <ReactMarkdown>{formData.explanation}</ReactMarkdown>
            </div>
          </div>
        )}

        <label style={styles.label}>Related Study</label>
        {formData.sessions.map((session, i) => (
          <div key={i}>
            <input
              style={styles.input}
              placeholder="Name"
              value={session.name}
              onChange={handleArrayChange(i, "name", "sessions")}
            />
            <input
              style={styles.input}
              placeholder="Link"
              value={session.link}
              onChange={handleArrayChange(i, "link", "sessions")}
            />
          </div>
        ))}
        <button type="button" style={styles.secondaryBtn} onClick={() => addField("sessions")}>
          + Add Related Study
        </button>

        <label style={styles.label}>Takeaways</label>
        {formData.takeaways.map((takeaway, i) => (
          <div key={i}>
            <input
              style={styles.input}
              placeholder="Name"
              value={takeaway.name}
              onChange={handleArrayChange(i, "name", "takeaways")}
            />
            <input
              style={styles.input}
              placeholder="Link"
              value={takeaway.link}
              onChange={handleArrayChange(i, "link", "takeaways")}
            />
          </div>
        ))}
        <button type="button" style={styles.secondaryBtn} onClick={() => addField("takeaways")}>
          + Add Takeaway
        </button>

        <br />
        <button type="submit" style={styles.primaryBtn}>
          Submit Blog
        </button>
      </form>
    </div>
  );
};

export default BlogForm;
