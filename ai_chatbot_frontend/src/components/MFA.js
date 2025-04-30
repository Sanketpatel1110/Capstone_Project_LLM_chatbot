// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const MFA = () => {
//     const [otp, setOtp] = useState('');
//     const [error, setError] = useState('');
//     const [resendDisabled, setResendDisabled] = useState(false);
//     const [timer, setTimer] = useState(30);
//     const [sessionId, setSessionId] = useState("");
//     const email = sessionStorage.getItem('email') || "";
//     const navigate = useNavigate();

//     const verifyOTP = async () => {
//         setError("");

//         if (!otp.trim()) {
//             setError("Please enter the OTP.");
//             return;
//         }

//         try {
//             const response = await fetch('http://localhost:8000/api/verify-otp', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, otp }),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 setError(data.detail?.msg || data.detail || "Invalid OTP. Please try again.");
//             } else {
//                 localStorage.setItem('session_token', data.session_token);
//                 const newSession = data.session_id;
//                 const newChat = data.chat_id;
//                 sessionStorage.setItem("chatSessionId", newSession);
//                 sessionStorage.setItem("chatId", newChat);
//                 setSessionId(newSession);
//                 setSessionId(newChat);

//                 console.log("Session ID: ", newSession);
//                 console.log("Chat ID: ", newChat);
//                 console.log("Session Token: ", data.session_token);

//                 localStorage.setItem('user_role', data.role);
//                 toast.success('🎉 Verification successful!', {
//                     position: 'top-center',
//                     autoClose: 2000,
//                     hideProgressBar: false,
//                     closeOnClick: true,
//                     pauseOnHover: true,
//                     draggable: true,
//                     theme: 'colored',
//                 });
//                 console.log("Role: ", data.role);
//                 setTimeout(() => navigate('/blogs'), 2200);
//             }
//         } catch (error) {
//             setError("Something went wrong. Please try again later.");
//         }
//     };

//     const resendOTP = async () => {
//         setResendDisabled(true);
//         setTimer(30);
//         setError("");

//         if (!email.trim()) {
//             setError("Email is missing. Please login again.");
//             return;
//         }

//         try {
//             const response = await fetch('http://localhost:8000/api/resend-otp', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email: email.trim() }),
//             });

//             if (!response.ok) {
//                 setError("Failed to resend OTP. Please try again.");
//                 setResendDisabled(false);
//             } else {
//                 toast.info('📧 A new OTP has been sent!', {
//                     position: 'top-center',
//                     autoClose: 2000,
//                     hideProgressBar: false,
//                     closeOnClick: true,
//                     pauseOnHover: true,
//                     draggable: true,
//                     theme: 'colored',
//                 });
//             }
//         } catch (error) {
//             setError("Something went wrong. Please try again later.");
//             setResendDisabled(false);
//         }
//     };

//     useEffect(() => {
//         if (resendDisabled && timer > 0) {
//             const countdown = setInterval(() => {
//                 setTimer((prev) => prev - 1);
//             }, 1000);

//             return () => clearInterval(countdown);
//         }

//         if (timer === 0) {
//             setResendDisabled(false);
//         }
//     }, [resendDisabled, timer]);

//     return (
//         <motion.div 
//             className="d-flex justify-content-center align-items-center vh-100 bg-light"
//             initial={{ opacity: 0 }} 
//             animate={{ opacity: 1 }} 
//             transition={{ duration: 0.8 }}
//         >
//             <ToastContainer />
//             <div className="card p-4 shadow-lg" style={{ width: '400px', borderRadius: '15px' }}>
//                 <motion.h2 
//                     className="text-center text-danger mb-3"
//                     initial={{ y: -20 }}
//                     animate={{ y: 0 }}
//                     transition={{ type: "spring", stiffness: 100 }}
//                 >
//                     Multi-Factor Authentication
//                 </motion.h2>

//                 <p className="text-center text-muted">
//                     An OTP has been sent to <strong>{email}</strong>. Please check your email.
//                 </p>

//                 <motion.input
//                     type="text"
//                     className="form-control text-center fs-5"
//                     placeholder="Enter OTP"
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     style={{ letterSpacing: '3px', fontWeight: 'bold' }}
//                     initial={{ scale: 0.9 }}
//                     animate={{ scale: 1 }}
//                 />

//                 {error && <p className="text-danger text-center mt-2">{error}</p>}

//                 <motion.button
//                     className="btn btn-danger w-100 mt-3"
//                     onClick={verifyOTP}
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                 >
//                     Verify OTP
//                 </motion.button>

//                 <div className="text-center mt-3">
//                     <button 
//                         className="btn btn-secondary" 
//                         onClick={resendOTP} 
//                         disabled={resendDisabled}
//                     >
//                         {resendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
//                     </button>
//                 </div>
//             </div>
//         </motion.div>
//     );
// };

// export default MFA;


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

// const MFA = () => {
//   const [otp, setOtp] = useState('');
//   const [error, setError] = useState('');
//   const [resendDisabled, setResendDisabled] = useState(false);
//   const [timer, setTimer] = useState(30);
//   const [sessionId, setSessionId] = useState('');
//   const email = sessionStorage.getItem('email') || '';
//   const navigate = useNavigate();
//   const API_BASE = process.env.REACT_APP_API_URL;

//   const verifyOTP = async () => {
//     setError('');

//     if (!otp.trim()) {
//       setError('Please enter the OTP.');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE}/api/verify-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, otp }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.detail?.msg || data.detail || 'Invalid OTP. Please try again.');
//       } else {
//         localStorage.setItem('session_token', data.session_token);
//         sessionStorage.setItem('chatSessionId', data.session_id);
//         sessionStorage.setItem('chatId', data.chat_id);

//         console.log('Session ID:', data.session_id);
//         console.log('Chat ID:', data.chat_id);
//         console.log('Session Token:', data.session_token);

//         localStorage.setItem('user_role', data.role);
//         toast.success('🎉 Verification successful!', {
//           position: 'top-center',
//           autoClose: 2000,
//           theme: 'colored',
//         });

//         setTimeout(() => navigate('/blogs'), 2200);
//       }
//     } catch (error) {
//       setError('Something went wrong. Please try again later.');
//     }
//   };

//   const resendOTP = async () => {
//     setResendDisabled(true);
//     setTimer(30);
//     setError('');

//     if (!email.trim()) {
//       setError('Email is missing. Please login again.');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE}/api/resend-otp`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email }),
//       });

//       if (!response.ok) {
//         setError('Failed to resend OTP. Please try again.');
//         setResendDisabled(false);
//       } else {
//         toast.info('📧 A new OTP has been sent!', {
//           position: 'top-center',
//           autoClose: 2000,
//           theme: 'colored',
//         });
//       }
//     } catch (error) {
//       setError('Something went wrong. Please try again later.');
//       setResendDisabled(false);
//     }
//   };

//   useEffect(() => {
//     if (resendDisabled && timer > 0) {
//       const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
//       return () => clearInterval(countdown);
//     }

//     if (timer === 0) {
//       setResendDisabled(false);
//     }
//   }, [resendDisabled, timer]);

//   return (
//     <motion.div
//       className="d-flex justify-content-center align-items-center vh-100 bg-light"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//     >
//       <ToastContainer />
//       <div className="card p-4 shadow-lg" style={{ width: '400px', borderRadius: '15px' }}>
//         <motion.h2
//           className="text-center text-danger mb-3"
//           initial={{ y: -20 }}
//           animate={{ y: 0 }}
//           transition={{ type: 'spring', stiffness: 100 }}
//         >
//           Multi-Factor Authentication
//         </motion.h2>

//         <p className="text-center text-muted">
//           An OTP has been sent to <strong>{email}</strong>. Please check your email.
//         </p>

//         <motion.input
//           type="text"
//           className="form-control text-center fs-5"
//           placeholder="Enter OTP"
//           value={otp}
//           onChange={(e) => setOtp(e.target.value)}
//           style={{ letterSpacing: '3px', fontWeight: 'bold' }}
//           initial={{ scale: 0.9 }}
//           animate={{ scale: 1 }}
//         />

//         {error && <p className="text-danger text-center mt-2">{error}</p>}

//         <motion.button
//           className="btn btn-danger w-100 mt-3"
//           onClick={verifyOTP}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           Verify OTP
//         </motion.button>

//         <div className="text-center mt-3">
//           <button
//             className="btn btn-secondary"
//             onClick={resendOTP}
//             disabled={resendDisabled}
//           >
//             {resendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default MFA;





import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const MFA = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [timer, setTimer] = useState(30);
  const email = sessionStorage.getItem('email') || '';
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_URL;

  const verifyOTP = async () => {
    setError('');

    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail?.msg || data.detail || 'Invalid OTP. Please try again.');
      } else {
        // ✅ Store session info correctly
        localStorage.setItem('session_token', data.session_id);
        localStorage.setItem('user_role', data.role);
        sessionStorage.setItem('chatSessionId', data.session_id);
        sessionStorage.setItem('chatId', data.chat_id);

        toast.success('🎉 Verification successful!', {
          position: 'top-center',
          autoClose: 2000,
          theme: 'colored',
        });

        setTimeout(() => navigate('/blogs'), 2200);
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    }
  };

  const resendOTP = async () => {
    setResendDisabled(true);
    setTimer(30);
    setError('');

    if (!email.trim()) {
      setError('Email is missing. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setError('Failed to resend OTP. Please try again.');
        setResendDisabled(false);
      } else {
        toast.info('📧 A new OTP has been sent!', {
          position: 'top-center',
          autoClose: 2000,
          theme: 'colored',
        });
      }
    } catch (error) {
      setError('Something went wrong. Please try again later.');
      setResendDisabled(false);
    }
  };

  useEffect(() => {
    if (resendDisabled && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }

    if (timer === 0) {
      setResendDisabled(false);
    }
  }, [resendDisabled, timer]);

  return (
    <motion.div
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <ToastContainer />
      <div className="card p-4 shadow-lg" style={{ width: '400px', borderRadius: '15px' }}>
        <motion.h2
          className="text-center text-danger mb-3"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          Multi-Factor Authentication
        </motion.h2>

        <p className="text-center text-muted">
          An OTP has been sent to <strong>{email}</strong>. Please check your email.
        </p>

        <motion.input
          type="text"
          className="form-control text-center fs-5"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          style={{ letterSpacing: '3px', fontWeight: 'bold' }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        />

        {error && <p className="text-danger text-center mt-2">{error}</p>}

        <motion.button
          className="btn btn-danger w-100 mt-3"
          onClick={verifyOTP}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Verify OTP
        </motion.button>

        <div className="text-center mt-3">
          <button
            className="btn btn-secondary"
            onClick={resendOTP}
            disabled={resendDisabled}
          >
            {resendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MFA;

