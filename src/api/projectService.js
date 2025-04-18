import axios from "axios";

const localAPI = 'http://localhost:5012/api/projects';
const prodAPI = 'https://quest-3ica.onrender.com/api/projects';

export const API_URL = window.location.hostname === 'localhost' ? localAPI : prodAPI;

// Get all projects
export const getProjects = async (token) => {
  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

// Create a new project
export const createProject = async (formData, token) => {
  try {
    const res = await axios.post(`${API_URL}/createproject`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating project:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
      throw {
        ...error,
        message: error.response.data.message || "Failed to create project",
        validationErrors: error.response.data.errors
      };
    }
    throw error;
  }
};
