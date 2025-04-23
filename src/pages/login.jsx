import React, { useState } from "react";
import { loginUser } from '../api/auth';
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validation for email and password
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
  
    try {
      const token = await loginUser({ email, password }); // loginUser returns the token directly
  
      if (!token) {
        throw new Error("Login failed. No token received.");
      }
  
      localStorage.setItem("token", token);
      toast.success("Login Successful");
  
      setTimeout(() => navigate("/dashboard"), 2000);

    } catch (err) {
      console.error("Login Error:", err.message);
      toast.error(err.message || "An error occurred during login. Please try again."); 
      setError(err.message || "Server error, please try again.");
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'white'
    }}>
      <ToastContainer />
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: 'black' }}>Login</h2>
        {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleLogin}>
          <div>
            <label style={{ display: 'block', color: '#374151', marginBottom: '0.25rem', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              placeholder="Enter your Email"
              style={{ 
                width: '100%', 
                padding: '0.5rem 1rem', 
                border: '1px solid #D1D5DB', 
                borderRadius: '0.5rem', 
                backgroundColor: 'white', 
                color: 'black'
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', color: '#374151', marginBottom: '0.25rem', fontWeight: '500' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 1rem', 
                  paddingRight: '2.5rem',
                  border: '1px solid #D1D5DB', 
                  borderRadius: '0.5rem', 
                  backgroundColor: 'white', 
                  color: 'black'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                style={{ 
                  position: 'absolute', 
                  right: '0.5rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  background: 'none', 
                  border: 'none', 
                  padding: '0.25rem',
                  color: '#6B7280',
                  cursor: 'pointer'
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              backgroundColor: '#EF4444', 
              color: 'white', 
              padding: '0.5rem 0', 
              borderRadius: '0.5rem', 
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
          >
            Login
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ textAlign: 'center', color: '#6B7280' }}>
            Forgot Password? <Link to="/password" style={{ color: '#EF4444', fontWeight: '500', textDecoration: 'none' }}>Reset here</Link>
          </p>
          <p style={{ textAlign: 'center', color: '#6B7280' }}>
            Don't have an account? <Link to="/register" style={{ color: '#EF4444', fontWeight: '500', textDecoration: 'none' }}>Register Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;