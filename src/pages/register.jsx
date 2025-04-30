import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../api/auth';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return toast.error("All fields are required");
    }

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (formData.username.length < 1) {
      return toast.error("Username must be at least 6 ");
    }

    if (formData.password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Registration failed");
      } else {
        toast.success(data.message || "Registration successful!");
        // Navigate immediately after showing toast
        navigate("/");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

      {/* Form Container - Centered */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        margin: '0 auto'
      }}>
        <div className="max-w-md w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">Create your Account</h2>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={handleSubmit}>
            <div>
              <label style={{ display: 'block', color: '#374151', marginBottom: '0.25rem', fontWeight: '500' }}>Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your Username"
                autoComplete="off"
                value={formData.username}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 1rem', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '0.5rem', 
                  backgroundColor: 'white', 
                  color: 'black'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#374151', marginBottom: '0.25rem', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="hello@quest.com"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem 1rem', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '0.5rem', 
                  backgroundColor: 'white', 
                  color: 'black'
                }}
              />
            </div>

            <div className="relative">
              <label style={{ display: 'block', color: '#374151', marginBottom: '0.25rem', fontWeight: '500' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter Your Password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: '1px solid #D1D5DB', 
                    borderRadius: '0.5rem', 
                    backgroundColor: 'white', 
                    color: 'black'
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: "none", border: "none", padding: "0" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="relative">
              <label style={{ display: 'block', color: '#374151', marginBottom: '0.25rem', fontWeight: '500' }}>Re-Enter Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-Enter your Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: '1px solid #D1D5DB', 
                    borderRadius: '0.5rem', 
                    backgroundColor: 'white', 
                    color: 'black'
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ background: "none", border: "none", padding: "0" }}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 transition-colors text-white px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Already have an Account?{" "}
            <a href="/" className="text-red-500 font-bold hover:underline">Sign In</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
