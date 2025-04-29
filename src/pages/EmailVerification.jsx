import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!userId) {
    return <p>Invalid access. No user ID provided.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-email', {
        userId,
        code,
      });

      if (response.data.message === 'Email verified successfully') {
        toast.success('Email verified successfully');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <label htmlFor="code" className="block mb-2 font-semibold">
          Enter Verification Code
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-full p-2 border border-gray-300 rounded mb-4"
          maxLength={6}
          required
        />
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#800020] text-white py-2 rounded"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  );
};

export default EmailVerification;
