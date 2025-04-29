import axios from 'axios';

const localAPI = 'http://localhost:5012/api/auth';
const prodAPI = 'https://quest-3ica.onrender.com/api/auth';

export const API_URL = window.location.hostname === 'localhost' ? localAPI : prodAPI;

export const loginUser = async (userData) => {
    try {
        const response = await axios.post(API_URL + '/login', userData, {
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: true
          });

        // Ensure the token exists before accessing it
        if (response.data && response.data.token && response.data.message !== "User not found") {
            return response.data.token; 
        } else {
            throw new Error("Token not found in response");
        }
        
    } catch (error) {
        console.error("Login Error:", error);
        throw new Error(error.response ? error.response.data.message : 'An error occurred during login. Please try again.');
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(API_URL + '/forgot-password', { email }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Forgot Password Error:", error);
        throw new Error(error.response ? error.response.data.message : 'Failed to send password reset email.');
    }
};

export const verifyResetCode = async (email, code) => {
    try {
        const response = await axios.post(API_URL + '/verify-reset-code', { email, code }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Verify Reset Code Error:", error);
        throw new Error(error.response ? error.response.data.message : 'Failed to verify reset code.');
    }
};

export const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await axios.post(API_URL + '/reset-password', { email, code, newPassword }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Reset Password Error:", error);
        throw new Error(error.response ? error.response.data.message : 'Failed to reset password.');
    }
};
