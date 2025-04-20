import React, { useState, useEffect } from "react";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, updateProject } from "../api/projectService";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [username, setUsername] = useState("Guest");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectImage, setProjectImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projectList, setProjectList] = useState([]);

  const token = localStorage.getItem("token");

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
  }, [token]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!token || !projectId) return;
      try {
        const data = await getProjectById(token, projectId);
        if (data && data.project) {
          setProjectName(data.project.name || "");
          setProjectDescription(data.project.description || "");
          setImagePreview(data.project.projectImage || null);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project data");
      }
    };
    fetchProject();
  }, [token, projectId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectName || !projectDescription) {
      toast.error("Please provide name and description");
      return;
    }

    if (!token) {
      toast.error("Please login to update projects");
      return;
    }

    const formData = new FormData();
    formData.append("name", projectName);
    formData.append("description", projectDescription);
    if (projectImage) {
      formData.append("projectImage", projectImage);
    }

    try {
      setLoading(true);
      const response = await updateProject(token, projectId, formData);
      if (response && response.success) {
        toast.success(response.message || "Project updated successfully!", {
          autoClose: 3000,
          onClose: () => {
            navigate(`/viewproject/${projectId}`);
          }
        });
      } else {
        toast.error(response?.message || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error(error.message || "Error updating project");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="h-screen flex">
        <div className="fixed h-screen">
          <Sidebar username={username} userProjects={projectList} />
        </div>

        <div className="bg-gray-100 ml-[200px] w-300 overflow-y-auto p-6">
          <PageHeader />
          <div className="flex items-center p-6">
            <div className="ml-[30px] mt-[1px] rounded-lg w-200 max-w-2xl">
              <h2 className="text-xl font-bold text-red-800">Edit Project</h2>
              <p className="text-sm text-gray-600">Update your project details</p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="bg-grey p-4 rounded-lg border border-gray-300">
                  <label className="block text-gray-700 font-semibold">Upload Project Logo</label>
                  <div className="relative w-24 h-24 mt-2">
                    <img
                      src={imagePreview || "/src/assets/default_project.png"}
                      alt="Project Logo"
                      className="w-full h-full rounded-full object-cover border"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

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

                <button
                  type="submit"
                  className="w-full bg-red-800 text-white p-3 rounded-lg font-semibold hover:bg-red-900"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Project"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProject;
