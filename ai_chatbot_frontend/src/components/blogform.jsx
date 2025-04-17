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
        takeaways: [{ name: "", link: "" }]
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
            const res = await fetch("http://localhost:8000/api/blogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("✅ Blog submitted and stored in vector DB!");
                setFormData({
                    title: "",
                    date: "",
                    summary: "",
                    introduction: "",
                    sessions: [{ name: "", link: "" }],
                    takeaways: [{ name: "", link: "" }]
                });
            } else {
                alert("❌ Error submitting blog.");
            }
        } catch (err) {
            console.error("❌ Submission error:", err);
            alert("❌ Error connecting to backend.");
        }
    };

    const pageStyle = {
        padding: "40px 80px",
        backgroundColor: darkMode ? "#0d1117" : "#f5f7fa",
        color: darkMode ? "#e6edf3" : "#000",
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh"
    };

    const inputStyle = {
        display: "block",
        margin: "10px 0",
        padding: "10px",
        width: "100%",
        borderRadius: "8px",
        backgroundColor: darkMode ? "#161b22" : "#fff",
        border: darkMode ? "1px solid #30363d" : "1px solid #ccc",
        color: darkMode ? "#fefefe" : "#000"
    };

    const labelStyle = {
        marginTop: "20px",
        fontWeight: "bold",
        color: darkMode ? "#fefefe" : "#000"
    };

    const buttonStyle = {
        marginTop: "20px",
        padding: "10px 20px",
        borderRadius: "8px",
        backgroundColor: darkMode ? "#238636" : "#007bff",
        border: "none",
        color: "#fff",
        fontWeight: "bold",
        cursor: "pointer"
    };

    const primaryButtonStyle = {
        marginTop: "20px",
        padding: "10px 20px",
        borderRadius: "8px",
        backgroundColor: darkMode ? "#2da44e" : "#007bff",
        border: "none",
        color: "#fff",
        fontWeight: "bold",
        cursor: "pointer"
    };

    const secondaryButtonStyle = {
        marginTop: "10px",
        padding: "8px 16px",
        borderRadius: "6px",
        backgroundColor: "transparent",
        border: darkMode ? "1px solid #30363d" : "1px solid #ccc",
        color: darkMode ? "#c9d1d9" : "#000",
        fontWeight: "500",
        cursor: "pointer"
    };

    return (
        <div style={pageStyle}>
            <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>Create New Blog</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
                    <div style={{ flex: 2 }}>
                        <label style={labelStyle}>Title</label>
                        <input
                            style={inputStyle}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter blog title"
                            required
                        />
                    </div>

                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Date</label>
                        <input
                            style={inputStyle}
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <label style={labelStyle}>Summary</label>
                <textarea
                    style={{ ...inputStyle, minHeight: "80px" }}
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    required
                />

                <label style={labelStyle}>Introduction</label>
                <textarea
                    style={{ ...inputStyle, minHeight: "100px" }}
                    name="introduction"
                    value={formData.introduction}
                    onChange={handleChange}
                    required
                />

                <label style={labelStyle}>Explanation</label>
                <textarea
                    style={{ ...inputStyle, minHeight: "120px" }}
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleChange}
                    placeholder="Use markdown: **bold**, _italic_, - bullet, [link](url)"
                    required
                />

                {formData.explanation && (
                    <div style={{ marginTop: "20px" }}>
                        <h4 style={labelStyle}>Preview</h4>
                        <div
                            style={{
                                ...inputStyle,
                                backgroundColor: darkMode ? "#0e1525" : "#fafafa",
                                border: "1px solid #888",
                                padding: "16px",
                                borderRadius: "8px"
                            }}
                        >
                            <ReactMarkdown>{formData.explanation}</ReactMarkdown>
                        </div>
                    </div>
                )}

                <label style={labelStyle}>Realted Study</label>
                {formData.sessions.map((session, i) => (
                    <div key={i}>
                        <input
                            style={inputStyle}
                            placeholder="Name"
                            value={session.name}
                            onChange={handleArrayChange(i, "name", "sessions")}
                        />
                        <input
                            style={inputStyle}
                            placeholder="Link"
                            value={session.link}
                            onChange={handleArrayChange(i, "link", "sessions")}
                        />
                    </div>
                ))}
                <button type="button" style={secondaryButtonStyle} onClick={() => addField("sessions")}>
                    + Add Realted Study
                </button>
                <br></br>

                <label style={labelStyle}>Takeaways</label>
                {formData.takeaways.map((takeaway, i) => (
                    <div key={i}>
                        <input
                            style={inputStyle}
                            placeholder="Name"
                            value={takeaway.name}
                            onChange={handleArrayChange(i, "name", "takeaways")}
                        />
                        <input
                            style={inputStyle}
                            placeholder="Link"
                            value={takeaway.link}
                            onChange={handleArrayChange(i, "link", "takeaways")}
                        />
                    </div>
                ))}
                <button type="button" style={secondaryButtonStyle} onClick={() => addField("takeaways")}>
                    + Add Takeaway
                </button>

                <br />
                <button type="submit" style={{ ...primaryButtonStyle, backgroundColor: darkMode ? "#2da44e" : "#007bff" }}>
                    Submit Blog
                </button>
            </form>
        </div>
    );
};

export default BlogForm;