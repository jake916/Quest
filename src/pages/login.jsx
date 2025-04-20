import React, { useState } from "react";
import { loginUser } from '../api/auth'; // Add this import statement

import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

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
<div className="flex h-screen bg-white items-center justify-center">

      <ToastContainer />


      <div className="w-186 flex flex-col justify-center ml-100 px-16 mb-25  ">

        <h2 className="text-3xl font-bold mb-6 text-black">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form className="space-y-4 justify-center" onSubmit={handleLogin}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your Email"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-38 top-5 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: "none", border: "none", padding: "0" }} 
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="w-120 bg-red-500 text-white py-2 rounded-lg">
            Login
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4 mr-25">
          Forgot Password? <Link to="/password" className="text-red font-bold">Reset here</Link>
        </p>
        <p className="text-center text-gray-500 mt-4 mr-25">
          Don't have an account? <Link to="/register" className="text-red font-bold">Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
