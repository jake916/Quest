// taskService.js
import axios from "axios";

const localAPI = 'http://localhost:5012/api/tasks';
const prodAPI = 'https://quest-3ica.onrender.com/api/tasks';

export const API_URL = window.location.hostname === 'localhost' ? localAPI : prodAPI;

export const getTask = async (token, taskId) => {
  try {
    const res = await axios.get(`${API_URL}/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return {
      success: true,
      task: res.data.task,
      message: res.data.message || "Task fetched successfully"
    };
  } catch (error) {
    console.error("Error fetching task:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message
    };
  }
};

export const getTasks = async (token) => {
  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Raw API response:", res.data); // Debug the actual response

    // Handle the response format from your updated backend
    if (res.data && res.data.tasks) {
      // New format with counters and tasks array
      return {
        success: true,
        data: res.data.tasks,
        stats: {
          total: res.data.totalTasks || 0,
          ongoing: res.data.ongoingTasks || 0,
          completed: res.data.completedTasks || 0,
          overdue: res.data.overdueTasks || 0
        }
      };
    } else if (Array.isArray(res.data)) {
      // Old format with just array of tasks
      return {
        success: true,
        data: res.data,
        stats: {
          total: res.data.length || 0,
          ongoing: 0,
          completed: 0,
          overdue: 0
        }
      };
    } else {
      console.warn("Unexpected API response format:", res.data);
      return {
        success: true,
        data: [],
        stats: { total: 0, ongoing: 0, completed: 0, overdue: 0 }
      };
    }
  } catch (error) {
    console.error("Error fetching tasks:", error.response?.data || error.message);
    return {
      success: false,
      data: [],
      stats: { total: 0, ongoing: 0, completed: 0, overdue: 0 },
      message: error.response?.data?.message || error.message
    };
  }
};

export const updateTask = async (token, taskId, updates) => {
  try {
    const res = await axios.patch(`${API_URL}/${taskId}`, updates, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return {
      success: true,
      task: res.data.task,
      message: res.data.message || "Task updated successfully"
    };
  } catch (error) {
    console.error("Full error object:", error);
    console.error("Error response data:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error headers:", error.response?.headers);
    
    return {
      success: false,
      message: error.response?.data?.message || 
               error.response?.data?.error || 
               error.message ||
               "Failed to update task",
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

export const createTask = async (token, taskData) => {
  try {
    console.log("Sending task data:", taskData); // Debug data being sent
    
    const res = await axios.post(API_URL, taskData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Task creation response:", res.data); // Debug response
    
    return {
      success: true,
      task: res.data.task,
      message: res.data.message || "Task created successfully"
    };
  } catch (error) {
    console.error("Error creating task:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.error 
      ? `${error.response.data.message}: ${error.response.data.error}`
      : error.message || "Failed to create task";
    return {
      success: false,
      message: errorMessage
    };
  }
};