import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { API_URL } from '../api/auth'; // Import API_URL from auth.js

const Register = () => {
  const navigate = useNavigate(); // Initialize navigation

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/register`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(response.data.message);
      setFormData({ username: "", email: "", password: "", confirmPassword: "" }); // Clear form

      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <ToastContainer /> {/* Toast Notifications */}

      <div className="w-150 h-110 relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5"
        style={{ backgroundImage: "url('src/assets/Group 6.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">
          <h2 className="text-4xl font-bold">Boost Productivity,<br />Accomplish More</h2>
        </div>
      </div>

      <div className="w-186 flex flex-col justify-center px-16 mb-5">
        <h2 className="text-3xl font-bold text-black">Create your Account</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your Username"
              value={formData.username}
              onChange={handleChange}
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="hello@quest.com"
              value={formData.email}
              onChange={handleChange}
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <div className="relative w-120">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Your Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white text-black pr-10"
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

          {/* Confirm Password Input */}
          <div className="relative">
            <label className="block text-gray-700">Re-Enter Password</label>
            <div className="relative w-120">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Enter your Password Again"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg bg-white text-black pr-10"
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

          <button className="w-120 bg-blue-500 text-white px-4 py-2 rounded-lg">Create Account</button>
        </form>

        <p className="text-center text-gray-500 mt-4 mr-25">
          Already have an Account?{" "}
          <a href="http://localhost:5173/" className="text-red font-bold">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
