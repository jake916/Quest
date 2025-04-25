import React, { useState, useEffect } from "react";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import { createProject } from "../api/projectService";
import { ToastContainer, toast } from 'react-toastify';
import { getProjects } from "../api/projectService";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const token = localStorage.getItem("token");

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Simulate progress increase
  const simulateProgress = (startFrom = 0) => {
    setLoadingProgress(startFrom);
    
    const incrementProgress = () => {
      setLoadingProgress(prev => {
        let increment;
        if (prev < 30) increment = Math.random() * 10;
        else if (prev < 60) increment = Math.random() * 5;
        else if (prev < 85) increment = Math.random() * 3;
        else increment = Math.random() * 0.5;
        
        return Math.min(prev + increment, 90);
      });
    };
    
    const intervalId = setInterval(incrementProgress, 300);
    return intervalId;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedFormats = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedFormats.includes(file.type)) {
        toast.error("Please upload a file in jpg, jpeg, or png format.");
        return;
      }
      setProjectImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const DEFAULT_LOGO = null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName || !projectDescription) {
      toast.error("Please provide name and description");
      return;
    }

    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("description", projectDescription);
    if (projectImage) {
      formData.append("projectImage", projectImage);
    }

    if (!token) {
      toast.error("Please login to create projects");
      return;
    }

    try {
      setLoading(true);
      const progressInterval = simulateProgress();
      
      const response = await createProject(formData, token);
      
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
      const progressInterval = simulateProgress();
      
      try {
        const data = await getProjects(token);
        setLoadingProgress(100);
        clearInterval(progressInterval);
        
        setProjectList(data.projects);
        
        setTimeout(() => {
          setLoadingProjects(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoadingProgress(0);
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Mobile view (< 768px)
  if (windowWidth < 768) {
    return (
      <div className="bg-[#EEEFEF] min-h-screen">
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <Sidebar username={username} userProjects={projectList} />
        </div>
        
        {/* Main content with padding for bottom nav */}
        <div className="pb-16">
          <PageHeader title="Create Project" />
          
          <div className="p-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-bold text-red-800">Project Details</h2>
              <p className="text-xs text-gray-600 mb-3">Provide details for your Projects</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Upload Project Logo */}
                <div className="p-3 rounded-lg border border-gray-300">
                  <label className="block text-sm font-semibold text-gray-700">Upload Project Logo</label>
                  <div className="relative w-20 h-20 mt-2">
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
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 text-xs"
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
                  <label className="block text-sm font-semibold text-gray-700">Name of Project</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full p-2 text-sm border rounded focus:ring focus:ring-red-200"
                    placeholder="Enter project name"
                  />
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Project Description</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full p-2 text-sm border rounded focus:ring focus:ring-red-200"
                    placeholder="Enter project description"
                    rows="3"
                  ></textarea>
                </div>

                {/* Submit Button */}
                {loading ? (
                  <button
                    type="button"
                    disabled
                    className="w-full bg-red-800 text-white p-2 rounded text-sm font-semibold relative overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      Creating ({Math.round(loadingProgress)}%)
                    </div>
                    <div 
                      className="absolute top-0 left-0 h-full bg-red-700 transition-all duration-300" 
                      style={{ width: `${loadingProgress}%`, opacity: '0.6' }}
                    ></div>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-red-800 text-white p-2 rounded text-sm font-semibold hover:bg-red-900"
                  >
                    Create Project
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        {loadingProjects && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
            <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-red-600 transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm">Loading Projects ({Math.round(loadingProgress)}%)</p>
          </div>
        )}

        <ToastContainer />
      </div>
    );
  }

  // Tablet view (768px - 1024px)
  if (windowWidth >= 768 && windowWidth < 1024) {
    return (
      <div className="h-screen bg-[#EEEFEF] flex">
        <div className="fixed h-screen">
          <Sidebar username={username} userProjects={projectList} />
        </div>

        <div className="ml-16 w-full overflow-y-auto p-4">
          <PageHeader title="Create Project" />
          
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-red-800">Project Details</h2>
            <p className="text-sm text-gray-600 mb-4">Provide details for your Projects</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Upload Project Logo */}
              <div className="p-4 rounded-lg border border-gray-300">
                <label className="block font-semibold text-gray-700">Upload Project Logo</label>
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
                <label className="block font-semibold text-gray-700">Name of Project</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-red-200"
                  placeholder="Enter project name"
                />
              </div>

              {/* Project Description */}
              <div>
                <label className="block font-semibold text-gray-700">Project Description</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full p-2 border rounded focus:ring focus:ring-red-200"
                  placeholder="Enter project description"
                  rows="4"
                ></textarea>
              </div>

              {/* Submit Button */}
              {loading ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-red-800 text-white p-3 rounded font-semibold relative overflow-hidden"
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
                  className="w-full bg-red-800 text-white p-3 rounded font-semibold hover:bg-red-900"
                >
                  Create Project
                </button>
              )}
            </form>
          </div>
        </div>

        {loadingProjects && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
            <div className="w-56 h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-red-600 transition-all duration-300" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm">Loading Projects ({Math.round(loadingProgress)}%)</p>
          </div>
        )}

        <ToastContainer />
      </div>
    );
  }

  // Desktop view (≥ 1024px)
  return (
    <div className="h-screen bg-[#EEEFEF] flex">
      <div className="fixed h-screen">
        <Sidebar username={username} userProjects={projectList} />
      </div>

      <div className="ml-64 w-full overflow-y-auto p-6">
        <PageHeader title="Create Project" />
        
        <div className="bg-white w-full max-w-3xl mx-auto p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-800">Project Details</h2>
          <p className="text-gray-600 mb-6">Provide details for your Projects</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Project Logo */}
            <div className="p-5 rounded-lg border border-gray-300">
              <label className="block text-lg font-semibold text-gray-700">Upload Project Logo</label>
              <div className="relative w-32 h-32 mt-3">
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
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 text-lg"
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
              <label className="block text-lg font-semibold text-gray-700">Name of Project</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-300"
                placeholder="Enter project name"
              />
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-lg font-semibold text-gray-700">Project Description</label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-300"
                placeholder="Enter project description"
                rows="5"
              ></textarea>
            </div>

            {/* Submit Button */}
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

      {loadingProjects && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
          <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-red-600 transition-all duration-300" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p>Loading Projects ({Math.round(loadingProgress)}%)</p>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default CreateProject;