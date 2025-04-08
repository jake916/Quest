import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiHome, FiCheckSquare, FiFolder, FiSettings, FiPlus } from "react-icons/fi";
import { FaArrowCircleRight } from "react-icons/fa";
import { getProjects } from "../api/projectService";

const Sidebar = ({ username, userProjects }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [projectList, setProjectList] = useState([]); // State for projects

    const handleLogout = () => {
        localStorage.removeItem("token"); // Clear token from local storage
        navigate("/"); // Redirect to login page
    };

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
        <div className="w-64 bg-[#72001D] text-white flex flex-col justify-between p-4 overflow-hidden h-screen">
            {/* Profile Section */}
            <div>
                <div className="flex items-center space-x-3">
                    <img
                        src="src/assets/Avatar.png"
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <h2 className="font-semibold text-sm">{username}</h2>
                </div>

                {/* MAIN Section */}
                <div className="mt-6">
                    <p className="text-xs text-gray-300 uppercase">Main</p>
                    <ul className="mt-2 space-y-2">
                        <Link to="/dashboard">
                            <li className={`flex items-center space-x-2 ${location.pathname === '/dashboard' ? 'bg-white text-black' : 'text-white'} px-3 py-2 rounded-lg`}>
                                <FiHome className="text-lg" />
                                <span className="text-sm font-medium">Dashboard</span>
                            </li>
                        </Link>

                        <Link to="/projects">
                            <li className={`flex items-center space-x-2 ${['/projects', '/createproject'].includes(location.pathname) ? 'bg-white text-black' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                                <FiFolder className="text-lg" />
                                <span className="text-sm">Projects</span>
                            </li>
                        </Link>

                        <Link to="/mytasks">
                            <li className={`flex items-center space-x-2 ${['/mytasks', '/createtask'].includes(location.pathname) ? 'bg-white text-black' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                                <FiCheckSquare className="text-lg" />
                                <span className="text-sm ">My Tasks</span>
                            </li>
                        </Link>

                        <Link to="/settings">
                            <li className={`flex items-center space-x-2 ${location.pathname === '/settings' ? 'bg-white text-black' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                                <FiSettings className="text-lg" />
                                <span className="text-sm">Settings</span>
                            </li>
                        </Link>
                    </ul>
                </div>

                {/* PROJECTS Section */}
                <div className="mt-6 " > {/* Set max height for scrolling */}
                    <p className="text-xs text-gray-300 uppercase flex justify-between">
                        Projects
                    </p>
                    <div className="w-full max-h-50 overflow-y-auto hide-scrollbar">
                        {projectList.length > 0 ? (
                            projectList.map((project, index) => (
                                <div
                                    key={index}
                                    className="p-1  rounded-lg flex items-center justify-between inline-block"
                                >
                                    <div className="flex items-center gap-2">
                                        <img src={project.projectImage} alt={project.name} className="w-8 h-8 rounded-full" /> {/* Display project image */}
                                        <div>
                                            <p className="font-semibold text-white">{project.name}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-white mt-20">No projects available.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 rounded-lg text-center" style={{ position: 'absolute', bottom: '20px', left: '0', right: '0' }}>
                <button
                    onClick={handleLogout}
                    className="mt-3 bg-[#FF004D] text-white px-4 py-2 rounded-lg flex items-center justify-center w-full"
                >
                    <FaArrowCircleRight className="mr-2 text-sm" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
