import { useEffect, useState } from "react";
import React from 'react';
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import ProjectCard from "../Component/projectcard";
import { getProjects } from "../api/projectService";

const Projects = () => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("Guest");

  const token = localStorage.getItem("token"); // Get user token

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects(token);
    

    setProjectList(data.projects);


      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects(); // Call the function to fetch projects
  }, [token]);

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

  return (
    <div className="h-screen bg-[#EEEFEF]">
      {/* Sidebar */}
      <div className="fixed h-screen">
        <Sidebar username={username} userProjects={projectList} />  {/* Pass username to Sidebar */}
      </div>

      {/* Main Content Area */}
      <div className="ml-[200px] w-290 overflow-y-auto h-screen">
        <PageHeader />
        <div className="ml-[80px]">
          {projectList.length === 0 ? (
            <div>
              <p className="mt-[30px] font-bold">No projects yet. Create a project to get started.</p>
            <img src="/uploads/Artboard 1 copy 4.png" alt="Welcome Illustration" className="w-90 h-90 mt-15 ml-70" />
            </div>
          ) : (
            <p className="mt-[30px] font-bold">All Projects</p>
          )}

          <div className="grid grid-cols-4 gap-5 mt-[20px]">
            {projectList.map((project, index) => (
              <ProjectCard key={index} name={project.name} logo={project.projectImage} />

            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;
