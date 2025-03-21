// // import React from 'react';
// // import { Link, Routes, Route } from 'react-router-dom';
// // import AddInformation from './components/AddInformation';
// // import ChatbotPage from './components/ChatbotPage';
// // import BlogsPage from '.BlogsPage';
// // import ManageInfoPage from './components/ManageInfoPage';

// // function MainPage() {
// //   return (
// //     <div style={{ margin: '20px' }}>
// //       <h1>Main Dashboard</h1>
// //       <nav style={{ marginBottom: '20px' }}>
// //         <Link to="add" style={{ marginRight: '10px' }}>Add Information</Link>
// //         <Link to="chatbot" style={{ marginRight: '10px' }}>Chatbot</Link>
// //         <Link to="blogs" style={{ marginRight: '10px' }}>Blogs</Link>
// //         <Link to="manage">Manage Information</Link>
// //       </nav>

// //       <hr />

// //       <Routes>
// //         <Route path="add" element={<AddInformation />} />
// //         <Route path="chatbot" element={<ChatbotPage />} />
// //         <Route path="blogs" element={<BlogsPage />} />
// //         <Route path="manage" element={<ManageInfoPage />} />
// //       </Routes>
// //     </div>
// //   );
// // }

// // export default MainPage;
// // src/LLMChatbotPage.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column',
//     height: '100vh',
//     fontFamily: 'Arial, sans-serif',
//     background: '#f9f9f9',
//   },
//   header: {
//     background: '#d32f2f',
//     color: '#fff',
//     padding: '20px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   logoutButton: {
//     background: '#fff',
//     color: '#d32f2f',
//     border: 'none',
//     padding: '10px 20px',
//     fontSize: '16px',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
//   chatContainer: {
//     flex: 1,
//     padding: '20px',
//     overflowY: 'auto',
//     backgroundColor: '#fff',
//     margin: '20px',
//     borderRadius: '8px',
//     boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
//   },
//   chatMessage: {
//     margin: '10px 0',
//     padding: '10px',
//     borderRadius: '8px',
//     background: '#f1f1f1',
//     maxWidth: '80%',
//   },
//   userMessage: {
//     alignSelf: 'flex-end',
//     background: '#d32f2f',
//     color: '#fff',
//   },
//   inputContainer: {
//     display: 'flex',
//     padding: '20px',
//     borderTop: '1px solid #ddd',
//     background: '#fff',
//   },
//   input: {
//     flex: 1,
//     padding: '12px',
//     fontSize: '16px',
//     borderRadius: '4px',
//     border: '1px solid #ccc',
//   },
//   sendButton: {
//     marginLeft: '10px',
//     padding: '12px 20px',
//     fontSize: '16px',
//     background: '#d32f2f',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '4px',
//     cursor: 'pointer',
//   },
// };

// const LLMChatbotPage = () => {
//   const [messages, setMessages] = useState([
//     { text: 'Hello! How can I assist you today?', sender: 'bot' },
//   ]);
//   const [input, setInput] = useState('');
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // Here you can also clear authentication tokens if needed.
//     navigate('/');
//   };

//   const handleSend = () => {
//     if (!input.trim()) return;

//     const userMessage = { text: input, sender: 'user' };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput('');

//     // Simulate a bot response after a delay (replace this with your LLM integration)
//     setTimeout(() => {
//       const botResponse = { text: `Echo: ${userMessage.text}`, sender: 'bot' };
//       setMessages((prev) => [...prev, botResponse]);
//     }, 1000);
//   };

//   return (
//     <div style={styles.container}>
//       <header style={styles.header}>
//         <h1>LLM Chatbot</h1>
//         <button style={styles.logoutButton} onClick={handleLogout}>
//           Logout
//         </button>
//       </header>
//       <div style={styles.chatContainer}>
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             style={{
//               ...styles.chatMessage,
//               ...(msg.sender === 'user' ? styles.userMessage : {}),
//             }}
//           >
//             {msg.text}
//           </div>
//         ))}
//       </div>
//       <div style={styles.inputContainer}>
//         <input
//           type="text"
//           placeholder="Type your message..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           style={styles.input}
//         />
//         <button onClick={handleSend} style={styles.sendButton}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default LLMChatbotPage;
