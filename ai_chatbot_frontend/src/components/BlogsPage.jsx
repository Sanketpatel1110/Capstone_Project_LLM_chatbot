// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import ReactMarkdown from "react-markdown";
// // import blogData from "../data/blogs";

// const BlogPost = ({ darkMode }) => {
//   const { id } = useParams();
//   const [blog, setBlog] = useState(null);
//   const [allBlogs, setAllBlogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch all blogs (for the left sidebar) and the current blog
//   useEffect(() => {
//     const fetchBlogData = async () => {
//       try {
//         const res = await fetch("http://localhost:8000/api/all-blogs");
//         const data = await res.json();
//         setAllBlogs(data);

//         const selectedBlog = data.find((b) => b.id === parseInt(id));
//         setBlog(selectedBlog);
//       } catch (error) {
//         console.error("❌ Error fetching blog data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBlogData();
//   }, [id]);


//   if (loading) return <div style={{ padding: "20px" }}>Loading blog...</div>;
//   if (!blog) return <div style={{ padding: "20px" }}>Blog not found</div>;

//   const pageStyle = {
//     minHeight: "100vh",
//     overflowY: "auto",
//     backgroundColor: darkMode ? "#0d1117" : "#f0f2f5",
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//     padding: "30px",
//     color: darkMode ? "#e6edf3" : "#000",
//     transition: "all 0.3s ease-in-out",
//   };

//   const containerStyle = {
//     display: "flex",
//     gap: "20px",
//     backgroundColor: darkMode ? "#161b22" : "#ffffff",
//     borderRadius: "12px",
//     padding: "24px",
//     boxShadow: darkMode
//       ? "0 8px 24px rgba(255,255,255,0.05)"
//       : "0 8px 24px rgba(0,0,0,0.05)",
//   };

//   const sidebarStyle = {
//     width: "20%",
//     paddingRight: "16px",
//     borderRight: `1px solid ${darkMode ? "#30363d" : "#e0e0e0"}`
//   };

//   const contentStyle = {
//     width: "60%",
//     padding: "0 20px"
//   };

//   const rightSidebarStyle = {
//     width: "20%",
//     paddingLeft: "16px",
//     borderLeft: `1px solid ${darkMode ? "#30363d" : "#e0e0e0"}`
//   };

//   const headingStyle = {
//     fontSize: "28px",
//     fontWeight: "700",
//     color: darkMode ? "#fefefe" : "#1a1a1a",
//     marginBottom: "10px"
//   };

//   const dateStyle = {
//     fontWeight: "500",
//     color: darkMode ? "#bbb" : "#666",
//     marginBottom: "20px"
//   };

//   const sectionHeadingStyle = {
//     color: darkMode ? "#93c5fd" : "#2c3e50",
//     fontSize: "20px",
//     marginTop: "24px",
//     marginBottom: "12px"
//   };

//   const paragraphStyle = {
//     lineHeight: "1.7",
//     color: darkMode ? "#cbd5e1" : "#444",
//     marginBottom: "12px"
//   };

//   const linkStyle = {
//     color: darkMode ? "#66b3ff" : "#d32f2f",
//     textDecoration: "none",
//     transition: "color 0.2s"
//   };

//   const listItemStyle = {
//     marginBottom: "8px"
//   };

//   return (
//     <div style={pageStyle}>
//       <div style={containerStyle}>
//         {/* Left Sidebar */}
//         <div style={sidebarStyle}>
//           <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Conferences</h3>
//           <ul style={{ paddingLeft: "16px" }}>
//             {allBlogs.map((conf) => (
//               <li key={conf.id} style={listItemStyle}>
//                 <a
//                   href={`/blog/${conf.id}`}
//                   style={linkStyle}
//                   onMouseOver={(e) => (e.target.style.color = darkMode ? "#3399ff" : "#a31616")}
//                   onMouseOut={(e) => (e.target.style.color = darkMode ? "#66b3ff" : "#d32f2f")}
//                 >
//                   {conf.title}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Main Content */}
//         <div style={contentStyle}>
//           <h1 style={headingStyle}>{blog.title}</h1>
//           <p style={dateStyle}>{blog.date}</p>

//           <h2 style={sectionHeadingStyle}>Executive Summary</h2>
//           <p style={paragraphStyle}>{blog.summary}</p>

//           <h2 style={sectionHeadingStyle}>1.0 Introduction</h2>
//           <p style={paragraphStyle}>{blog.introduction}</p>

//           <h2 style={sectionHeadingStyle}>2.0 Explanation</h2>
//           {/* <p style={paragraphStyle}>{blog.explanation}</p> */}
//           <div style={paragraphStyle}>
//             <ReactMarkdown>{blog.explanation}</ReactMarkdown>
//           </div>

//           <h2 style={sectionHeadingStyle}>3.0 Related Study</h2>
//           <ul style={{ paddingLeft: "20px" }}>
//             {blog.sessions.map((session, idx) => (
//               <li key={idx} style={listItemStyle}>
//                 <a
//                   href={session.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style={linkStyle}
//                   onMouseOver={(e) => (e.target.style.color = darkMode ? "#3399ff" : "#a31616")}
//                   onMouseOut={(e) => (e.target.style.color = darkMode ? "#66b3ff" : "#d32f2f")}
//                 >
//                   {session.name}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Right Sidebar */}
//         <div style={rightSidebarStyle}>
//           <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Key Takeaways</h3>
//           <ul style={{ paddingLeft: "16px" }}>
//             {blog.takeaways.map((item, idx) => (
//               <li key={idx} style={listItemStyle}>
//                 <a
//                   href={item.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   style={linkStyle}
//                   onMouseOver={(e) => (e.target.style.color = darkMode ? "#3399ff" : "#a31616")}
//                   onMouseOut={(e) => (e.target.style.color = darkMode ? "#66b3ff" : "#d32f2f")}
//                 >
//                   {item.name}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogPost;


import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const BlogPost = ({ darkMode }) => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-blogs`);
        const data = await res.json();
        setAllBlogs(data);

        const selectedBlog = data.find((b) => b.id === parseInt(id));
        setBlog(selectedBlog);
      } catch (error) {
        console.error("❌ Error fetching blog data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [id]);

  if (loading) return <div style={{ padding: "20px" }}>Loading blog...</div>;
  if (!blog) return <div style={{ padding: "20px" }}>Blog not found</div>;

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: darkMode ? "#0d1117" : "#f0f2f5",
      fontFamily: "Segoe UI, sans-serif",
      padding: "30px",
      color: darkMode ? "#e6edf3" : "#000",
    },
    container: {
      display: "flex",
      gap: "20px",
      backgroundColor: darkMode ? "#161b22" : "#fff",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: darkMode
        ? "0 8px 24px rgba(255,255,255,0.05)"
        : "0 8px 24px rgba(0,0,0,0.05)",
    },
    sidebar: {
      width: "20%",
      borderRight: `1px solid ${darkMode ? "#30363d" : "#e0e0e0"}`,
      paddingRight: "16px",
    },
    content: {
      width: "60%",
      padding: "0 20px",
    },
    rightSidebar: {
      width: "20%",
      borderLeft: `1px solid ${darkMode ? "#30363d" : "#e0e0e0"}`,
      paddingLeft: "16px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "10px",
    },
    date: {
      color: darkMode ? "#bbb" : "#666",
      marginBottom: "20px",
    },
    sectionTitle: {
      color: darkMode ? "#93c5fd" : "#2c3e50",
      fontSize: "20px",
      marginTop: "24px",
      marginBottom: "12px",
    },
    paragraph: {
      lineHeight: "1.7",
      color: darkMode ? "#cbd5e1" : "#444",
      marginBottom: "12px",
    },
    listItem: {
      marginBottom: "8px",
    },
    link: {
      color: darkMode ? "#66b3ff" : "#d32f2f",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Conferences</h3>
          <ul style={{ paddingLeft: "16px" }}>
            {allBlogs.map((conf) => (
              <li key={conf.id} style={styles.listItem}>
                <Link
                  to={`/blog/${conf.id}`}
                  style={styles.link}
                  onMouseEnter={(e) => (e.target.style.color = darkMode ? "#3399ff" : "#a31616")}
                  onMouseLeave={(e) => (e.target.style.color = darkMode ? "#66b3ff" : "#d32f2f")}
                >
                  {conf.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          <h1 style={styles.title}>{blog.title}</h1>
          <p style={styles.date}>{blog.date}</p>

          <h2 style={styles.sectionTitle}>Executive Summary</h2>
          <p style={styles.paragraph}>{blog.summary}</p>

          <h2 style={styles.sectionTitle}>1.0 Introduction</h2>
          <p style={styles.paragraph}>{blog.introduction}</p>

          <h2 style={styles.sectionTitle}>2.0 Explanation</h2>
          <div style={styles.paragraph}>
            <ReactMarkdown>{blog.explanation}</ReactMarkdown>
          </div>

          <h2 style={styles.sectionTitle}>3.0 Related Study</h2>
          <ul style={{ paddingLeft: "20px" }}>
            {blog.sessions?.map((session, idx) => (
              <li key={idx} style={styles.listItem}>
                <a
                  href={session.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  {session.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Sidebar */}
        <div style={styles.rightSidebar}>
          <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>Key Takeaways</h3>
          <ul style={{ paddingLeft: "16px" }}>
            {blog.takeaways?.map((item, idx) => (
              <li key={idx} style={styles.listItem}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
