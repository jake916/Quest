import React, { useState, useEffect } from "react";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import { createProject } from "../api/projectService";
import { ToastContainer, toast } from 'react-toastify'; // Import toast components
import { getProjects } from "../api/projectService";
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [username, setUsername] = useState("Guest");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true); // Loading state for fetching projects
  const [loadingProgress, setLoadingProgress] = useState(0); // Progress percentage

  const token = localStorage.getItem("token");

  // Function to simulate progress increase
  const simulateProgress = (startFrom = 0) => {
    setLoadingProgress(startFrom);
    
    // Reset to starting point
    const incrementProgress = () => {
      setLoadingProgress(prev => {
        // Increase more slowly as we approach 90%
        let increment;
        if (prev < 30) increment = Math.random() * 10;
        else if (prev < 60) increment = Math.random() * 5;
        else if (prev < 85) increment = Math.random() * 3;
        else increment = Math.random() * 0.5;
        
        const newProgress = Math.min(prev + increment, 90); // Cap at 90% until complete
        return newProgress;
      });
    };
    
    // Start incremental progress
    const intervalId = setInterval(incrementProgress, 300);
    return intervalId;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedFormats.includes(file.type)) {
        toast.error("Please upload a file in jpg, jpeg, or png format."); // Use toast for error
        return;
      }
      setProjectImage(file);
      setImagePreview(URL.createObjectURL(file)); // Fix: Create a preview URL
    }
  };

  const DEFAULT_LOGO = null; // No default logo

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName || !projectDescription) {
      toast.error("Please provide name and description"); // Updated validation
      return;
    }

    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("description", projectDescription);
    if (projectImage) {
      formData.append("projectImage", projectImage); // Only append if file was selected
    }

    if (!token) {
      toast.error("Please login to create projects");
      return;
    }

    try {
      setLoading(true);
      // Start progress simulation for project creation
      const progressInterval = simulateProgress();
      
      const response = await createProject(formData, token);
      
      // Set progress to 100% when complete
      setLoadingProgress(100);
      clearInterval(progressInterval);
      
      if (response && response.success) {
        toast.success(response.message || "Project created successfully!", {
          autoClose: 3000,
          onClose: () => {
            navigate("/projects");
          }
        });
      } else {
        toast.error(response?.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setLoadingProgress(0);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error(error.message || "Error creating project");
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUsername(decodedUser?.username || "Guest");
      } catch (error) {
        console.error("Invalid token:", error);
        setUsername("Guest");
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    const fetchProjects = async () => {
      setLoadingProjects(true);
      // Start progress simulation for loading projects
      const progressInterval = simulateProgress();
      
      try {
        const data = await getProjects(token);
        // Set progress to 100% when complete
        setLoadingProgress(100);
        clearInterval(progressInterval);
        
        setProjectList(data.projects);
        
        // Small delay to show 100% before hiding loader
        setTimeout(() => {
          setLoadingProjects(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoadingProgress(0);
        setLoadingProjects(false);
      }
    };

    fetchProjects(); // Call the function to fetch projects
  }, []);

  return (
    <>
      <ToastContainer /> {/* Add ToastContainer to render notifications */}
      <div className="h-screen flex">
        <div className="fixed h-screen">
          <Sidebar username={username} userProjects={projectList} />  
        </div>

        <div className="bg-gray-100 ml-[200px] w-300 overflow-y-auto p-6">
          <PageHeader title="Create Project" />
          
          {/* Loading Overlay */}
          {loadingProjects && (
            <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
                <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-red-600 transition-all duration-300" 
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-lg font-medium">Loading Page to Create your Projects ({Math.round(loadingProgress)}%)</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center p-6">
            <div className="ml-[30px] mt-[1px] rounded-lg w-200 max-w-2xl">
              <h2 className="text-xl font-bold text-red-800">Project Details</h2>
              <p className="text-sm text-gray-600">Provide details for your Projects</p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {/* Upload Project Logo */}
                <div className="bg-grey p-4 rounded-lg border border-gray-300">
                  <label className="block text-gray-700 font-semibold">Upload Project Logo</label>
                  <div className="relative w-24 h-24 mt-2">
                    <img
                      src={imagePreview || projectImage || DEFAULT_LOGO}
                      alt="Project Logo"
                      className="w-full h-full rounded-full object-cover border"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                    { (imagePreview || projectImage) && (
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                        onClick={() => {
                          setProjectImage(null);
                          setImagePreview(null);
                        }}
                        aria-label="Remove project logo"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>

                {/* Name of Project */}
                <div>
                  <label className="block text-gray-700 font-semibold">Name of Project</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-red-200"
                    placeholder="Enter project name"
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-gray-700 font-semibold">Project Description</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring focus:ring-red-200"
                    placeholder="Enter project description"
                    rows="3"
                  ></textarea>
                </div>

                {/* Submit Button with Progress */}
                {loading ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-red-800 text-white p-3 rounded-lg font-semibold relative overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      Creating Project ({Math.round(loadingProgress)}%)
                    </div>
                    <div 
                      className="absolute top-0 left-0 h-full bg-red-700 transition-all duration-300" 
                      style={{ width: `${loadingProgress}%`, opacity: '0.6' }}
                    ></div>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-red-800 text-white p-3 rounded-lg font-semibold hover:bg-red-900"
                  >
                    Create Project
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProject;