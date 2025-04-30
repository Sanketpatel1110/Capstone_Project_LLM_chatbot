// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";
// import { useParams } from "react-router-dom";

// const MarkdownContentPage = () => {
//   const [content, setContent] = useState(null);
//   const { contentId } = useParams();

//   useEffect(() => {
//     axios.get(`http://localhost:8000/api/admin/get-markdown-content`)
//       .then(res => setContent(res.data.find(c => c._id === contentId)));
//   }, [contentId]);

//   return content ? (
//     <div>
//       <h1>{content.title}</h1>
//       <ReactMarkdown>{content.markdown_content}</ReactMarkdown>
//     </div>
//   ) : <div>Loading...</div>;
// };

// export default MarkdownContentPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";

const MarkdownContentPage = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { contentId } = useParams();
  const API_BASE = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/admin/get-markdown-content`);
        const matched = res.data.find(c => c._id === contentId);
        if (matched) {
          setContent(matched);
        } else {
          setError("Content not found.");
        }
      } catch (err) {
        console.error("Error fetching markdown content:", err);
        setError("Failed to load content.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [API_BASE, contentId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "#d32f2f", marginBottom: "20px" }}>{content.title}</h1>
      <ReactMarkdown>{content.markdown_content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownContentPage;

