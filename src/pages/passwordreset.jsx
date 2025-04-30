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
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
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
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <ToastContainer />
      
      {/* Left Section - Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 h-auto relative items-center justify-center bg-cover bg-center m-5 rounded-xl"
        style={{ backgroundImage: "url('src/assets/8.png')" }}>
        <div className="absolute inset-0 bg-primary/80 rounded-xl"></div>
        <div className="relative text-white text-center px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Focused</h2>
          <p className="text-xl md:text-2xl">Accomplish More</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:px-16">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-black">Password Reset</h2>
          <p className="text-gray-600 mb-6">
            We sent a code to <span className="font-medium">{email || "your email"}</span>
          </p>

          {/* OTP Input Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2 sm:gap-3">
              {otp.map((value, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 sm:w-14 sm:h-14 border border-gray-300 rounded-md text-center text-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus={index === 0}
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : "Submit"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Didn't receive an email?{" "}
              <button
                onClick={handleResend}
                className="text-red-600 font-medium hover:underline focus:outline-none"
                disabled={loading}
              >
                Click to Resend
              </button>
            </p>
            <p className="mt-2 text-gray-600">
              Back to{" "}
              <a href="/login" className="text-red-600 font-medium hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;