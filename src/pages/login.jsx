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
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation for email and password
    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
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
    } finally {
      setIsLoading(false);
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
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => { if(!isLoading) e.currentTarget.style.backgroundColor = '#DC2626' }}
            onMouseOut={(e) => { if(!isLoading) e.currentTarget.style.backgroundColor = '#EF4444' }}
            disabled={isLoading}
          >
            {isLoading && (
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-5 h-5 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: '0.5rem' }}
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            )}
            {isLoading ? "Logging in" : "Login"}
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