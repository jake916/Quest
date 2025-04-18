import axios from 'axios';

const localAPI = 'http://localhost:5012/api/auth';
const prodAPI = 'https://quest-3ica.onrender.com/api/auth';

export const API_URL = window.location.hostname === 'localhost' ? localAPI : prodAPI;

export const loginUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData, {
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
