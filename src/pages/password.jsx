import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forgotPassword } from "../api/auth";

const Password = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Password reset code sent to your email");
      navigate("/passwordreset", { state: { email } });
    } catch (error) {
      toast.error(error.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <ToastContainer />
      {/* Left Section - Image */}
      <div
        className="w-150 h-110  relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5"
        style={{ backgroundImage: "url('src/assets/7.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">
          <h2 className="text-4xl font-bold relative aboslute top-40">Organize Tasks</h2>
          <br />
          <p className="relative aboslute top-35">Stay Focused, Achieve More</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-186 flex flex-col justify-center px-16">
        <h2 className="text-3xl font-bold mb-6 text-black ">Forgot Password</h2>
        <p className="font-regular mb-6 text-[#292D32] ">No Worries we will send you reset instruction</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your Email"
              className="w-120 px-4 py-2 border rounded-lg bg-white text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-120 bg-red-500 text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Email"}
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

export default Password;
