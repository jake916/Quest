import axios from 'axios';

const API_URL = 'https://quest-qjg0.onrender.com/api/auth'; // Adjust if needed

export const loginUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData, {
            headers: {
                'Content-Type': 'application/json'
            }
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
