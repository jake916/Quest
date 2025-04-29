import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiHome, FiCheckSquare, FiFolder, FiSettings, FiBell } from "react-icons/fi";
import { FaArrowCircleRight, FaBars } from "react-icons/fa";
import { getProjects } from "../api/projectService";
import ProjectImageOrLetter from "./ProjectImageOrLetter";
import ConfirmModal from "./ConfirmModal";

const Sidebar = ({ username, userProjects }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projectList, setProjectList] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [newNotificationCount, setNewNotificationCount] = useState(0);

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

  // Load new notification count from localStorage
  useEffect(() => {
    const updateNotificationCount = () => {
      const count = parseInt(localStorage.getItem('newNotificationCount') || '0');
      setNewNotificationCount(count);
    };

    updateNotificationCount();

    // Optionally, listen to storage events to update count in real-time
    window.addEventListener('storage', updateNotificationCount);
    return () => {
      window.removeEventListener('storage', updateNotificationCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const onLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const onConfirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
  };

  const onCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchProjects = async () => {
      try {
        const data = await getProjects(token);
        setProjectList(data.projects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Mobile view (< 768px)
  if (windowWidth < 768) {
    return (
      <>
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white flex justify-around items-center h-16 z-10 border-t border-gray-200">
          <Link to="/dashboard" className={`flex flex-col items-center ${location.pathname === '/dashboard' ? 'text-[#72001D]' : 'text-gray-600'}`}>
            <FiHome className="text-lg" />
            <span className="text-xs">Home</span>
          </Link>

          <Link to="/projects" className={`flex flex-col items-center ${['/projects', '/createproject'].includes(location.pathname) ? 'text-[#72001D]' : 'text-gray-600'}`}>
            <FiFolder className="text-lg" />
            <span className="text-xs">Projects</span>
          </Link>

          <Link to="/mytasks" className={`flex flex-col items-center ${['/mytasks', '/createtask', '/edittask'].includes(location.pathname) ? 'text-[#72001D]' : 'text-gray-600'}`}>
            <FiCheckSquare className="text-lg" />
            <span className="text-xs">Tasks</span>
          </Link>


          <Link to="/settings" className={`flex flex-col items-center ${location.pathname === '/settings' ? 'text-[#72001D]' : 'text-gray-600'}`}>
            <FiSettings className="text-lg" />
            <span className="text-xs">Settings</span>
          </Link>

          <Link to="/notifications" className={`flex flex-col items-center ${location.pathname === '/notifications' ? 'text-[#72001D]' : 'text-gray-600'}`}>
            <FiBell className="text-lg" />
            <span className="text-xs">Notifications</span>
          </Link>
        </div>

        {showLogoutConfirm && (
          <ConfirmModal
            message="Are you sure you want to logout?"
            onConfirm={onConfirmLogout}
            onCancel={onCancelLogout}
          />
        )}
      </>
    );
  }

  // Tablet view (768px - 1024px)
  if (windowWidth >= 768 && windowWidth < 1024) {
    return (
      <>
        <div className="bg-[#72001D] text-white flex flex-col p-4 h-screen fixed left-0 top-0 z-10 w-16">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-6">
            <ProjectImageOrLetter projectName={username} size={40} />
          </div>

          {/* MAIN Section */}
          <div className="flex flex-col items-center space-y-6 flex-grow">
            <Link to="/dashboard">
              {location.pathname === '/dashboard' ? (
                <div className="p-2 rounded-lg bg-white">
                  <FiHome className="text-2xl text-[#72001D]" />
                </div>
              ) : (
                <div className="p-2">
                  <FiHome className="text-2xl text-white" />
                </div>
              )}
            </Link>

            <Link to="/projects">
              {['/projects', '/createproject'].includes(location.pathname) ? (
                <div className="p-2 rounded-lg bg-white">
                  <FiFolder className="text-2xl text-[#72001D]" />
                </div>
              ) : (
                <div className="p-2">
                  <FiFolder className="text-2xl text-white" />
                </div>
              )}
            </Link>

            <Link to="/mytasks">
              {['/mytasks', '/createtask', '/edittask'].includes(location.pathname) ? (
                <div className="p-2 rounded-lg bg-white">
                  <FiCheckSquare className="text-2xl text-[#72001D]" />
                </div>
              ) : (
                <div className="p-2">
                  <FiCheckSquare className="text-2xl text-white" />
                </div>
              )}
            </Link>

            <Link to="/settings">
              {location.pathname === '/settings' ? (
                <div className="p-2 rounded-lg bg-white">
                  <FiSettings className="text-2xl text-[#72001D]" />
                </div>
              ) : (
                <div className="p-2">
                  <FiSettings className="text-2xl text-white" />
                </div>
              )}
            </Link>
          </div>

          {/* Logout Button */}
          <div className="mt-auto flex justify-center">
            <button onClick={onLogoutClick} className="p-2 text-white">
              <FaArrowCircleRight className="text-2xl" />
            </button>
          </div>
        </div>
        
        {/* Main content margin */}
        <div className="ml-16">
          {/* Your main content will go here */}
        </div>

        {showLogoutConfirm && (
          <ConfirmModal
            message="Are you sure you want to logout?"
            onConfirm={onConfirmLogout}
            onCancel={onCancelLogout}
          />
        )}
      </>
    );
  }

  // Desktop/Laptop view (≥ 1024px)
  return (
    <>
      <div className="bg-[#72001D] text-white flex flex-col h-screen fixed left-0 top-0 z-50 w-64 overflow-hidden">
        {/* Profile Section */}
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <ProjectImageOrLetter projectName={username} size={40} />
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
                <li className={`flex items-center space-x-2 ${['/mytasks', '/createtask', '/edittask'].includes(location.pathname) ? 'bg-white text-black' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                  <FiCheckSquare className="text-lg" />
                  <span className="text-sm">My Tasks</span>
                </li>
              </Link>

              <Link to="/settings">
                <li className={`flex items-center space-x-2 ${location.pathname === '/settings' ? 'bg-white text-black' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                  <FiSettings className="text-lg" />
                  <span className="text-sm">Settings</span>
                </li>
              </Link>

              <Link to="/notifications">
                <li className={`flex items-center space-x-2 ${location.pathname === '/notifications' ? 'bg-white text-black' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                  <FiBell className="text-lg" />
                  <span className="text-sm">Notifications</span>
                </li>
              </Link>
            </ul>
          </div>

          {/* PROJECTS Section */}
          <div className="mt-6">
            <p className="text-xs text-gray-300 uppercase flex justify-between">
              Projects
            </p>
            <div className="max-h-48 overflow-y-auto hide-scrollbar pr-2">
              {projectList.length > 0 ? (
                projectList.map((project, index) => (
                  <Link
                    to={`/viewproject/${project._id}`}
                    key={index}
                    className="p-2 rounded-lg flex items-center justify-between cursor-pointer hover:bg-[#8b0023] mb-1"
                  >
                    <div className="flex items-center space-x-3">
                      <ProjectImageOrLetter projectName={project.name} projectImage={project.projectImage} size={30} />
                      <p className="font-semibold text-white text-sm truncate max-w-36">{project.name}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-white mt-2 text-sm">No projects available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 mt-auto">
          <button
            onClick={onLogoutClick}
            className="bg-[#FF004D] text-white px-4 py-2 rounded-lg flex items-center justify-center w-full"
          >
            <FaArrowCircleRight className="mr-2 text-sm" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content margin */}
      <div className="ml-64">
        {/* Your main content will go here */}
      </div>

      {showLogoutConfirm && (
        <ConfirmModal
          message="Are you sure you want to logout?"
          onConfirm={onConfirmLogout}
          onCancel={onCancelLogout}
        />
      )}
    </>
  );
};

export default Sidebar;
