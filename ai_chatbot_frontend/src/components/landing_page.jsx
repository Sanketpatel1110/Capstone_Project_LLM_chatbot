// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// const BlogGrid = ({ darkMode }) => {
//   const navigate = useNavigate();
//   const [blogs, setBlogs] = useState([]);

//   useEffect(() => {
//     const fetchBlogs = async () => {
//       try {
//         const res = await fetch("http://localhost:8000/api/all-blogs");
//         if (!res.ok) throw new Error("Failed to fetch blogs");
//         const data = await res.json();

//         // Optional: sort blogs by descending ID or date if needed
//         const sorted = data.sort((a, b) => b.id - a.id);
//         setBlogs(sorted);
//       } catch (err) {
//         console.error("❌ Error fetching blogs:", err);
//       }
//     };

//     fetchBlogs();
//   }, []);

//   const handleClick = (id) => {
//     navigate(`/blog/${id}`);
//   };

//   const pageStyle = {
//     minHeight: "100vh",
//     overflowY: "auto",
//     backgroundColor: darkMode ? "#0d1117" : "#f5f7fa",
//     display: "flex",
//     flexDirection: "column",
//     color: darkMode ? "#e6edf3" : "#000"
//   };

//   const containerStyle = {
//     padding: "40px 80px",
//     fontFamily: "Segoe UI, sans-serif",
//     backgroundColor: darkMode ? "#0d1117" : "#f5f7fa"
//   };

//   const gridStyle = {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//     gap: "30px"
//   };

//   const cardStyle = {
//     backgroundColor: darkMode ? "#161b22" : "#fff",
//     borderRadius: "12px",
//     overflow: "hidden",
//     boxShadow: darkMode
//       ? "0 4px 12px rgba(255,255,255,0.05)"
//       : "0 4px 12px rgba(0,0,0,0.1)",
//     cursor: "pointer",
//     transition: "transform 0.2s ease-in-out"
//   };

//   const contentStyle = {
//     padding: "16px"
//   };

//   const titleStyle = {
//     fontSize: "18px",
//     fontWeight: "bold",
//     marginBottom: "8px",
//     color: darkMode ? "#fefefe" : "#333"
//   };

//   const descriptionStyle = {
//     fontSize: "14px",
//     color: darkMode ? "#cbd5e1" : "#666"
//   };

//   return (
//     <div style={pageStyle}>
//       <div style={containerStyle}>
//         <h2
//           style={{
//             fontSize: "28px",
//             marginBottom: "30px",
//             color: darkMode ? "#fefefe" : "#222"
//           }}
//         >
//           Latest Blogs
//         </h2>

//         <div style={gridStyle}>
//           {blogs.map((blog) => (
//             <div
//               key={blog.id}
//               style={cardStyle}
//               onClick={() => handleClick(blog.id)}
//               onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
//               onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
//             >
//               {/* Optional image */}
//               {/* <img src={blog.thumbnail || "/thumbnail_image.png"} alt={blog.title} style={imageStyle} /> */}

//               <div style={contentStyle}>
//                 <div style={titleStyle}>{blog.title}</div>
//                 <div style={descriptionStyle}>{blog.summary}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogGrid;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BlogGrid = ({ darkMode }) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/all-blogs`);
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();

        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent
        setBlogs(sorted);
      } catch (err) {
        console.error("❌ Error fetching blogs:", err);
      }
    };

    fetchBlogs();
  }, []);

  const handleClick = (id) => {
    navigate(`/blog/${id}`);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: darkMode ? "#0d1117" : "#f5f7fa",
      color: darkMode ? "#e6edf3" : "#000",
      fontFamily: "Segoe UI, sans-serif",
    },
    container: {
      padding: "40px 80px",
    },
    heading: {
      fontSize: "28px",
      marginBottom: "30px",
      color: darkMode ? "#fefefe" : "#222",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "30px",
    },
    card: {
      backgroundColor: darkMode ? "#161b22" : "#fff",
      borderRadius: "12px",
      boxShadow: darkMode
        ? "0 4px 12px rgba(255,255,255,0.05)"
        : "0 4px 12px rgba(0,0,0,0.1)",
      transition: "transform 0.2s ease-in-out",
      cursor: "pointer",
    },
    content: {
      padding: "16px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "8px",
      color: darkMode ? "#fefefe" : "#333",
    },
    summary: {
      fontSize: "14px",
      color: darkMode ? "#cbd5e1" : "#666",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Latest Blogs</h2>
        <div style={styles.grid}>
          {blogs.map((blog) => (
            <div
              key={blog.id}
              style={styles.card}
              onClick={() => handleClick(blog.id)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div style={styles.content}>
                <div style={styles.title}>{blog.title}</div>
                <div style={styles.summary}>
                  {blog.summary?.slice(0, 100)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogGrid;
