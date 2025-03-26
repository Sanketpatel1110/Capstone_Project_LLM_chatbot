import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, matchPath } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import UrbanRegistrationForm from "./components/UrbanRegistrationForm";
import ChatbotPage from "./components/ChatbotPage";
// import BlogPost from "./components/BlogsPage";
import AddPost from "./components/AddPost";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ThankYou from "./components/ThankYou";
import MFA from "./components/MFA";
import AdminDashboard from "./components/AdminDashboard";
import AddMarkdownPage from "./components/AddMarkdownPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import EventForm from "./components/EventForm";
import MarkdownContentPage from "./components/MarkdownContentPage";
import BlogGrid from "./components/landing_page";
import BlogPost from "./components/BlogsPage";

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  const noNavbarPaths = [
    "/",
    "/register",
    "/forgot-password",
    "/reset-password/:token",
    "/mfa",
    "/thank-you",
  ];

  const showNavbar = !noNavbarPaths.some(path => matchPath(path, location.pathname));

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  // Theme styles
  const appStyle = {
    backgroundColor: darkMode ? "#121212" : "#ffffff",
    color: darkMode ? "#f5f5f5" : "#000000",
    minHeight: "100vh",
    transition: "background-color 0.3s ease, color 0.3s ease",
  };

  return (
    <div style={appStyle}>
      {showNavbar && <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<UrbanRegistrationForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/mfa" element={<MFA />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/main" element={<ChatbotPage darkMode={darkMode} />} />
          {/* <Route path="/blogs" element={<BlogPost />} /> */}
          <Route path="/add-post" element={<AddPost />} />
          <Route path="/EventForm" element={<EventForm />} />
          <Route path="/blogs" element={<BlogGrid darkMode={darkMode} />} />
          <Route path="/blog/:id" element={<BlogPost darkMode={darkMode} />} />
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/add-markdown-page" element={<AddMarkdownPage />} />
            <Route path="/markdown-page/:Id" element={<MarkdownContentPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;