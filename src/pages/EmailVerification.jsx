import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Access</h2>
          <p className="mb-4">No user ID provided. Please try registering again.</p>
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-[#800020] hover:bg-[#600018] text-white py-2 px-4 rounded-lg transition-colors"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (index, value) => {
    if (!/^[A-Z0-9]*$/.test(value)) return; // Only allow alphanumeric
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    // Auto-focus to next input
    if (value && index < 5) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-email', {
        userId,
        code: verificationCode,
      });

      if (response.data.message === 'Email verified successfully') {
        toast.success('Email verified successfully! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(response.data.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mobile view
  if (windowWidth < 768) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <ToastContainer />
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <div className="text-center mb-6">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h1 className="text-2xl font-bold mt-2">Verify Your Email</h1>
            <p className="text-gray-600 mt-2">Enter the 6-digit code sent to your email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between space-x-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center border border-gray-300 rounded-md text-xl focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                  autoFocus={index === 0}
                  disabled={loading}
                />
              ))}
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3 rounded-lg flex items-center justify-center transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Didn't receive a code? <button className="text-[#800020] font-medium">Resend Code</button></p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-4xl flex">
        {/* Left side - Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#800020] to-[#a00028] items-center justify-center p-8">
          <div className="text-center text-white">
            <svg className="mx-auto h-24 w-24 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h2 className="text-3xl font-bold mb-4">Email Verification</h2>
            <p className="text-lg">Please check your inbox for the verification code</p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-gray-600 mb-8">Enter the 6-digit verification code sent to your email address</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                <div className="flex justify-between space-x-4">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-input-${index}`}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center border border-gray-300 rounded-lg text-xl focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                      autoFocus={index === 0}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3 rounded-lg flex items-center justify-center transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : 'Verify Email'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Didn't receive a code? <button className="text-[#800020] font-medium hover:underline">Resend Code</button></p>
              <p className="mt-2">Need help? <a href="/contact" className="text-[#800020] font-medium hover:underline">Contact Support</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;