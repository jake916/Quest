// taskService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/tasks"; // Adjust if needed

export const getTasks = async (token) => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("API Response:", res.data); // Log the API response for debugging

    // Return the entire response object
    return res.data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error("Error fetching tasks: " + error.message);
  }
};