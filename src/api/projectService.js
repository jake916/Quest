import axios from "axios";

const API_URL = "http://localhost:5000/api/projects"; // Adjust if needed

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
    const res = await axios.post(`${API_URL}/createproject`, formData, { // Fixed the URL here
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};
