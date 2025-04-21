import { useEffect, useState } from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import ProjectCard from "../Component/projectcard";
import { getProjects } from "../api/projectService";


const Projects = () => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [username, setUsername] = useState("Guest");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // Get user token

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects(token);
        setProjectList(data.projects);
        setLoadingProgress(100);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects(); // Call the function to fetch projects
  }, [token]);

  useEffect(() => {
    let interval = null;
    if (loading && loadingProgress < 100) {
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const nextProgress = prev + 10;
          if (nextProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return nextProgress;
        });
      }, 200);
    } else if (!loading) {
      setLoadingProgress(100);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, loadingProgress]);

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
    const token = localStorage.getItem("token"); // Get user token
    const fetchProjects = async () => {
      try {
        const data = await getProjects(token);
        setProjectList(data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects(); // Call the function to fetch projects
  }, []);

  // Handler to navigate to view project page
  const handleCardClick = (project) => {
    navigate(`/viewproject/${project._id}`);
  };

  // Handler for search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter projects based on search query (case-insensitive)
  const filteredProjects = projectList.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-[#EEEFEF]">
      {/* Sidebar */}
      <div className="fixed h-screen">
        <Sidebar username={username} userProjects={projectList} />  {/* Pass username to Sidebar */}
      </div>

      {/* Main Content Area */}
      <div className="ml-[200px] w-290 overflow-y-auto h-screen">
        <PageHeader searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <div className="ml-[80px]">
          {filteredProjects.length === 0 ? (
            <div>
              <p className="mt-[30px] font-bold">No projects yet. Create a project to get started.</p>
              <img src="/uploads/Artboard 1 copy 4.png" alt="Welcome Illustration" className="w-90 h-90 mt-15 ml-70" />
            </div>
          ) : (
            <p className="mt-[30px] font-bold">All Projects</p>
          )}

          <div className="grid grid-cols-4 gap-5 mt-[20px]">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={index}
                name={project.name}
                logo={project.projectImage}
                onClick={() => handleCardClick(project)}
              />
            ))}
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
          <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <p>Loading Projects</p>
          <div className="text-black text-lg font-semibold">{loadingProgress}%</div>
        </div>
      )}
    </div>
  );
}

export default Projects;
