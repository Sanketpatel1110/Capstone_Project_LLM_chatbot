// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const Navbar = () => {
//     const [hovered, setHovered] = useState(null);
//     const navigate = useNavigate();

//     const sessionToken = localStorage.getItem("session_token");
//     const userRole = localStorage.getItem("user_role"); // Retrieve stored role clearly

//     const handleLogout = () => {
//         localStorage.removeItem("session_token");
//         localStorage.removeItem("user_role");  // Clear user role on logout
//         navigate("/"); // Redirect to login page
//     };

//     const navbarStyle = {
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//         background: "#222",
//         padding: "15px 30px",
//         color: "white"
//     };

//     const logoStyle = {
//         fontSize: "22px",
//         fontWeight: "bold",
//         textDecoration: "none",
//         color: "white"
//     };

//     const navLinksStyle = {
//         listStyle: "none",
//         display: "flex",
//         alignItems: "center",
//         margin: "0",
//         padding: "0"
//     };

//     const navItemStyle = {
//         marginLeft: "20px"
//     };

//     const linkStyle = (isHovered) => ({
//         textDecoration: "none",
//         color: isHovered ? "#ff9900" : "white",
//         fontSize: "18px",
//         transition: "color 0.3s ease-in-out"
//     });

//     const logoutButtonStyle = {
//         marginLeft: "20px",
//         padding: "8px 15px",
//         background: "#ff4444",
//         color: "white",
//         border: "none",
//         borderRadius: "5px",
//         cursor: "pointer",
//         fontSize: "16px",
//         transition: "background 0.3s ease-in-out"
//     };

//     // Common links visible to all logged-in users
//     // const commonPaths = ["/main", "/blogs", "/add-post"];
//     // const commonLabels = ["CHATBOT", "BLOGS", "ADD POST"];

//     const commonPaths = ["/main", "/blogs"];
//     const commonLabels = ["CHATBOT", "BLOGS"];

//     // Additional links visible only to admin users
//     const adminPaths = ["/admin-dashboard", "/add-markdown-page" ,"/EventForm"];
//     const adminLabels = ["ADMIN DASHBOARD", "ADD MARKDOWN PAGE", "EventForm"];

//     return (
//         <nav style={navbarStyle}>
//             <div>
//                 <Link to="/" style={logoStyle}>
//                     URBAN SYSTEMS
//                 </Link>
//             </div>
//             <ul style={navLinksStyle}>
//                 {commonPaths.map((path, index) => (
//                     <li key={index} style={navItemStyle}>
//                         <Link
//                             to={path}
//                             style={linkStyle(hovered === path)}
//                             onMouseEnter={() => setHovered(path)}
//                             onMouseLeave={() => setHovered(null)}
//                         >
//                             {commonLabels[index]}
//                         </Link>
//                     </li>
//                 ))}

//                 {/* Clearly render admin links only if user is admin */}
//                 {userRole === 'admin' && adminPaths.map((path, index) => (
//                     <li key={`admin-${index}`} style={navItemStyle}>
//                         <Link
//                             to={path}
//                             style={linkStyle(hovered === path)}
//                             onMouseEnter={() => setHovered(path)}
//                             onMouseLeave={() => setHovered(null)}
//                         >
//                             {adminLabels[index]}
//                         </Link>
//                     </li>
//                 ))}

//                 <li>
//                     <button style={logoutButtonStyle} onClick={handleLogout}>
//                         Logout
//                     </button>
//                 </li>
//             </ul>
//         </nav>
//     );
// };

// export default Navbar;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ darkMode, toggleTheme }) => {
    const [hovered, setHovered] = useState(null);
    const navigate = useNavigate();

    const sessionToken = localStorage.getItem("session_token");
    const userRole = localStorage.getItem("user_role");

    const handleLogout = () => {
        localStorage.removeItem("session_token");
        localStorage.removeItem("user_role");
        navigate("/");
    };

    const navbarStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#222",
        padding: "15px 30px",
        color: "white",
        flexWrap: "wrap"
    };

    const logoStyle = {
        fontSize: "22px",
        fontWeight: "bold",
        textDecoration: "none",
        color: "white"
    };

    const navLinksStyle = {
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        margin: "0",
        padding: "0",
        flexWrap: "wrap"
    };

    const navItemStyle = {
        marginLeft: "20px"
    };

    const linkStyle = (isHovered) => ({
        textDecoration: "none",
        color: isHovered ? "#ff9900" : "white",
        fontSize: "18px",
        transition: "color 0.3s ease-in-out"
    });

    const logoutButtonStyle = {
        marginLeft: "20px",
        padding: "8px 15px",
        background: "#ff4444",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background 0.3s ease-in-out"
    };

    const commonPaths = ["/main", "/blogs"];
    const commonLabels = ["CHATBOT", "BLOGS"];

    const adminPaths = ["/admin-dashboard", "/add-markdown-page", "/EventForm", "/blogform"];
    const adminLabels = ["ADMIN DASHBOARD", "ADD MARKDOWN PAGE", "EVENTFORM", "BLOGFORM"];

    return (
        <nav style={navbarStyle}>
            <div>
                <Link to="/" style={logoStyle}>
                    URBAN SYSTEMS
                </Link>
            </div>
            <ul style={navLinksStyle}>
                {commonPaths.map((path, index) => (
                    <li key={index} style={navItemStyle}>
                        <Link
                            to={path}
                            style={linkStyle(hovered === path)}
                            onMouseEnter={() => setHovered(path)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {commonLabels[index]}
                        </Link>
                    </li>
                ))}

                {userRole === 'admin' && adminPaths.map((path, index) => (
                    <li key={`admin-${index}`} style={navItemStyle}>
                        <Link
                            to={path}
                            style={linkStyle(hovered === path)}
                            onMouseEnter={() => setHovered(path)}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {adminLabels[index]}
                        </Link>
                    </li>
                ))}

                {/* 🌙 Theme toggle button */}
                <li style={navItemStyle}>
                    <label style={{
                        display: "inline-flex",
                        alignItems: "center",
                        background: darkMode ? "#555" : "#ddd",
                        borderRadius: "20px",
                        padding: "5px",
                        cursor: "pointer",
                        transition: "background 0.3s ease-in-out"
                    }}>
                        <span style={{
                            background: darkMode ? "#ffcc00" : "#222",
                            color: darkMode ? "#222" : "#fff",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            transition: "all 0.3s ease-in-out"
                        }}>
                            {darkMode ? "☀️" : "🌙"}
                        </span>
                        <input
                            type="checkbox"
                            checked={darkMode}
                            onChange={toggleTheme}
                            style={{ display: "none" }}
                        />
                    </label>
                </li>

                {/* 🚪 Logout button */}
                <li>
                    <button style={logoutButtonStyle} onClick={handleLogout}>
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;