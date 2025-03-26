import React from "react";
import { useNavigate } from "react-router-dom";


const BlogGrid = ({ darkMode }) => {
  const navigate = useNavigate();

  const blogs = [
    {
      id: 1,
      title: "How Urban Systems used one simple tool to transform public engagement",
      description: "Urban Systems used narrative maps to make public engagement more accessible and effective.",
      thumbnail: "/thumbnail_image.png"
    },
    {
      id: 2,
      title: "No need to compromise on cost, time or quality: Urban Systems & StoryMaps",
      description: "They streamlined engagement using StoryMaps without sacrificing cost, time, or quality.",
      thumbnail: "/thumbnail_image.png"
    },
    {
      id: 3,
      title: "How to drive technological change—with just one simple app",
      description: "ArcGIS StoryMaps helped internal teams embrace tech change easily and with excitement.",
      thumbnail: "/thumbnail_image.png"
    },
    {
      id: 4,
      title: "Helping Peru and Uganda with COVID-19",
      description: "The Urban Systems Foundation provided pandemic support to partners in Peru and Uganda.",
      thumbnail: "/thumbnail_image.png"
    },
    {
      id: 5,
      title: "N’Quatqua FN Hatches Plan for Food Security",
      description: "This initiative offered every household fresh fish, boosting community food resilience.",
      thumbnail: "/thumbnail_image.png"
    }
  ];

  const handleClick = (id) => {
    navigate(`/blog/${id}`);
  };

  const pageStyle = {
    minHeight: "100vh",
    overflowY: "auto",
    backgroundColor: darkMode ? "#0d1117" : "#f5f7fa",
    display: "flex",
    flexDirection: "column",
    color: darkMode ? "#e6edf3" : "#000"
  };

  const containerStyle = {
    padding: "40px 80px",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: darkMode ? "#0d1117" : "#f5f7fa"
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px"
  };

  const cardStyle = {
    backgroundColor: darkMode ? "#161b22" : "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: darkMode
      ? "0 4px 12px rgba(255,255,255,0.05)"
      : "0 4px 12px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s ease-in-out"
  };

  const imageStyle = {
    width: "100%",
    height: "160px",
    objectFit: "cover"
  };

  const contentStyle = {
    padding: "16px"
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: darkMode ? "#fefefe" : "#333"
  };

  const descriptionStyle = {
    fontSize: "14px",
    color: darkMode ? "#cbd5e1" : "#666"
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h2
          style={{
            fontSize: "28px",
            marginBottom: "30px",
            color: darkMode ? "#fefefe" : "#222"
          }}
        >
          Latest Blogs
        </h2>

        <div style={gridStyle}>
          {blogs.map((blog) => (
            <div
              key={blog.id}
              style={cardStyle}
              onClick={() => handleClick(blog.id)}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {/* Thumbnail (optional) */}
              {/* <img src={blog.thumbnail} alt={blog.title} style={imageStyle} /> */}

              <div style={contentStyle}>
                <div style={titleStyle}>{blog.title}</div>
                <div style={descriptionStyle}>{blog.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogGrid;