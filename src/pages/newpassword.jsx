import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetPassword } from "../api/auth";

const NewPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, password);
      toast.success("Password reset successful");
      navigate("/alldone");
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <ToastContainer />
      {/* Left Section - Image */}
      <div
        className="w-150 h-110 relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5"
        style={{ backgroundImage: "url('src/assets/9.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">
          <h2 className="text-4xl font-bold relative aboslute top-40">Plan Smart</h2>
          <br />
          <p className="relative aboslute top-35">Execute Better</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-186 flex flex-col justify-center px-16">
        <h2 className="text-3xl font-bold mb-6 text-black ">Set New Password</h2>
        <p className="font-regular mb-6 text-[#292D32] ">Must be at least 8 Characters</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-120 bg-red-500 text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-4 pr-30">
          Back to{" "}
          <a href="http://localhost:5173" className="text-red font-bold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default NewPassword;
