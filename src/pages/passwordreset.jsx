import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PasswordReset = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Code verified");
        navigate("/newpassword", { state: { email, code } });
      } else {
        toast.error(data.message || "Invalid or expired code");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Reset code resent");
      } else {
        toast.error(data.message || "Failed to resend code");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ToastContainer />
      {/* Left Section - Image */}
      <div
        className="w-150 h-110  relative flex items-center justify-center bg-cover bg-center rounded-xl mt-10 mb-10 ml-5"
        style={{ backgroundImage: "url('src/assets/8.png')" }}
      >
        <div className="absolute inset-0 bg-primary/80 rounded-r-lg"></div>
        <div className="relative text-white text-center px-8">
          <h2 className="text-4xl font-bold relative aboslute top-40">Stay Focused</h2>
          <br />
          <p className="relative aboslute top-35"> Accomplish More</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-1/2 flex flex-col justify-center px-16">
        <h2 className="text-3xl font-bold mb-2 text-black ">Password Reset</h2>
        <p className="font-regular  text-[#292D32] ">
          We Sent a Code to {email || "your email"}
        </p>

        {/* OTP Input Fields */}
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 my-6 mb-5">
            {otp.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-12 h-12 border rounded-md text-center text-xl bg-[#D9D9D9]"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-120 bg-red-500 text-white py-2 rounded-lg"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Submit"}
          </button>
        </form>

        <p className="mt-4 ml-9 text-gray-600">
          Didn’t receive an email?{" "}
          <button
            onClick={handleResend}
            className="text-red-700 font-medium underline"
            disabled={loading}
          >
            Click to Resend
          </button>
        </p>
        <p className="mt-2 text-black ml-35">
          Back to{" "}
          <a href="http://localhost:5173/" className="text-red-700 font-medium">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default PasswordReset;
