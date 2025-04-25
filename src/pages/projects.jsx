import { useEffect, useState } from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import { FiSearch } from "react-icons/fi";
import ProjectCard from "../Component/projectcard";
import { getProjects } from "../api/projectService";

const Projects = () => {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [username, setUsername] = useState("Guest");
  const [searchQuery, setSearchQuery] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

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

  const token = localStorage.getItem("token");

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

    fetchProjects();
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

  const handleCardClick = (project) => {
    navigate(`/viewproject/${project._id}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredProjects = projectList.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mobile view (< 768px)
  const [showSearchInput, setShowSearchInput] = React.useState(false);

  if (windowWidth < 768) {
    return (
      <div className="bg-[#EEEFEF] min-h-screen overflow-y-auto h-screen">
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <Sidebar username={username} userProjects={projectList} />
        </div>
        
        {/* Main content with padding for bottom nav */}
        <div className="pb-16">
          <PageHeader searchQuery={searchQuery} onSearchChange={handleSearchChange} hideSearch={true} />
          
          <div className="p-4">
          {filteredProjects.length === 0 ? (
            <>
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-black w-full mb-4"
                  autoFocus
                />
              </div>
              <div className="text-center">
                <p className="mt-4 font-bold text-lg">No projects yet</p>
                <p className="mb-4">Create a project to get started</p>
                <img 
                  src="/uploads/Artboard 1 copy 4.png" 
                  alt="No projects" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="mt-4 font-bold text-lg">All Projects</p>
                <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  className="p-2 rounded bg-gray-300 text-black"
                  aria-label="Toggle Search"
                >
                  <FiSearch size={20} />
                </button>
              </div>
              {showSearchInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-black w-full"
                    autoFocus
                  />
                </div>
              )}
            </>
          )}

<div className="grid grid-cols-1 gap-4 mt-4">
  {filteredProjects.map((project, index) => (
    <div key={index} className="flex justify-center">
      <ProjectCard
        name={project.name}
        logo={project.projectImage}
        onClick={() => handleCardClick(project)}
        compact={true}
      />
    </div>
  ))}
</div>
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
            <div className="w-48 h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-red-500" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="text-sm">Loading Projects</p>
            <div className="text-black text-md font-semibold">{loadingProgress}%</div>
          </div>
        )}
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

        <div className="ml-16 w-full overflow-y-auto">
          <PageHeader searchQuery={searchQuery} onSearchChange={handleSearchChange} />
          
          <div className="p-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center">
                <p className="mt-8 font-bold text-xl">No projects yet</p>
                <p className="mb-6">Create a project to get started</p>
                <img 
                  src="/uploads/Artboard 1 copy 4.png" 
                  alt="No projects" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
            ) : (
              <p className="mt-6 font-bold text-xl">All Projects</p>
            )}

<div className="grid grid-cols-2 gap-4 mt-6">
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
            <div className="w-64 h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-red-500" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="text-sm">Loading Projects</p>
            <div className="text-black text-md font-semibold">{loadingProgress}%</div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view (≥ 1024px)
  return (
    <div className="h-screen bg-[#EEEFEF] flex">
      <div className="fixed h-screen">
        <Sidebar username={username} userProjects={projectList} />
      </div>

<div className="overflow-y-auto bg-[#EEEFEF]" style={{ width: 'calc(100% - 16rem)', marginLeft: '16rem' }}>
        <PageHeader searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        
        <div className="p-6 pl-20">
          {filteredProjects.length === 0 ? (
            <div className="text-center">
              <p className="mt-10 font-bold text-2xl">No projects yet</p>
              <p className="mb-8 text-lg">Create a project to get started</p>
              <img 
                src="/uploads/Artboard 1 copy 4.png" 
                alt="No projects" 
                className="w-80 h-80 mx-auto"
              />
            </div>
          ) : (
            <p className="mt-8 font-bold text-2xl">All Projects</p>
          )}

<div className="grid grid-cols-3 gap-6 mt-8">
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
            <div className="h-full bg-red-500" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <p>Loading Projects</p>
          <div className="text-black text-lg font-semibold">{loadingProgress}%</div>
        </div>
      )}
    </div>
  );
}

export default Projects;