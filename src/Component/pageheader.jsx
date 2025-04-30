import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";
import { FaPlus, FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";

const PageHeader = ({ projectId, searchQuery, onSearchChange, hideSearch, title, bodyText }) => {
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  let headerContent;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isEditTask = location.pathname.startsWith('/edittask/');
  const isEditProject = location.pathname === '/editproject' || location.pathname.startsWith('/editproject/');
  const isViewProject = location.pathname.startsWith('/viewproject/');

  // If title prop is provided, use it as header content
  if (title) {
    headerContent = (
      <div className={`p-4 ${windowWidth < 768 ? 'text-left' : ''}`}>
        <p className={`text-lg font-bold text-[#72001D] ${windowWidth < 768 ? '' : 'text-xl'}`}>
          {title}
        </p>
        {bodyText && (
          <p className="text-sm text-gray-600 mt-1">
            {bodyText}
          </p>
        )}
      </div>
    );
  } else if (windowWidth < 768) {
    switch (true) {
      case location.pathname === '/dashboard':
        headerContent = <p className="text-lg font-bold text-black p-4 text-center">Dashboard</p>;
        break;
      case location.pathname === '/mytasks':
        headerContent = (
          <div className="flex justify-between items-center p-4">
            <p className="text-lg font-bold text-[#72001D]">My Tasks</p>
            <Link to="/createtask">
              <button className="bg-[#72001D] text-white px-3 py-1 rounded-lg flex items-center text-sm">
                <FaPlus className="mr-1" />
                New Task
              </button>
            </Link>
          </div>
        );
        break;
      case location.pathname === '/createtask':
        headerContent = <p className="text-lg font-bold text-[#72001D] p-4 text-left">Create Task</p>;
        break;
      case location.pathname === '/projects':
        headerContent = (
          <div className="flex justify-between items-center p-4">
            <p className="text-lg font-bold text-[#72001D]">My Projects</p>
            <Link to="/createproject">
              <button className="bg-[#72001D] text-white px-3 py-1 rounded-lg flex items-center text-sm">
                <FaPlus className="mr-1" />
                Create Project
              </button>
            </Link>
          </div>
        );
        break;
      case location.pathname === '/notifications':
        headerContent = <p className="text-lg font-bold text-[#72001D] p-4 text-left">Notifications</p>;
        break;
      case location.pathname === '/createproject':
        headerContent = <p className="text-lg font-bold text-[#72001D] p-4 text-left">Create Project</p>;
        break;
      case location.pathname === '/settings':
        headerContent = <p className="text-lg font-bold text-[#72001D] p-4 text-left">Settings</p>;
        break;
      case isEditTask:
        headerContent = <p className="text-lg font-bold text-[#72001D] p-4 text-left">Edit Task</p>;
        break;
      case isEditProject:
        headerContent = <p className="text-lg font-bold text-[#72001D] p-4 text-left">Edit Project</p>;
        break;
      case isViewProject:
        headerContent = (
          <div className="flex justify-between items-center p-4">
            <p className="text-lg font-bold text-[#72001D]">Project Details</p>
            <Link to="/createproject">
              <button className="bg-[#72001D] text-white px-3 py-1 rounded-lg flex items-center text-sm">
                <FaPlus className="mr-1" />
                Create Project
              </button>
            </Link>
          </div>
        );
        break;
      default:
        headerContent = <p className="text-lg font-bold text-[#72001D] p-4 text-left">Welcome</p>;
    }
  } else if (windowWidth >= 768 && windowWidth < 1024) {
    switch (true) {
      case location.pathname === '/dashboard':
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-xl font-bold text-[#72001D]">Dashboard</p>
            <Link to="/createproject">
              <button className="bg-[#72001D] text-white px-3 py-1 rounded-lg flex items-center">
                <FaPlus className="mr-1" />
                <span>Project</span>
              </button>
            </Link>
          </div>
        );
        break;
      case location.pathname === '/mytasks':
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-xl font-bold text-[#72001D]">My Tasks</p>
            {!hideSearch && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-black w-40 pl-6"
                  />
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange({ target: { value: '' } })}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 px-1"
                      aria-label="Clear search"
                    >
                      &#x2715;
                    </button>
                  )}
                </div>
                <Link to="/createtask">
                  <button className="bg-[#72001D] text-white px-3 py-1 rounded-lg flex items-center">
                    <FaPlus className="mr-1" />
                    <span>Task</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        );
        break;
      case location.pathname === '/projects':
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-xl font-bold text-[#72001D]">My Projects</p>
            {!hideSearch && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-black w-40 pl-6"
                  />
                  <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange({ target: { value: '' } })}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 px-1"
                      aria-label="Clear search"
                    >
                      &#x2715;
                    </button>
                  )}
                </div>
                <Link to="/createproject">
                  <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                    <FaPlus className="mr-2" />
                    New Project
                  </button>
                </Link>
              </div>
            )}
          </div>
        );
        break;
      case location.pathname === '/notifications':
        headerContent = (
          <div className="flex justify-between items-center   p-4 border-b">
            <p className="text-md font-bold text-[#72001D]">Notifications</p>
          </div>
        );
        break;
      case isViewProject:
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-xl font-bold text-[#72001D]">Project Details</p>
            <Link to={`/editproject/${projectId}`}>
              <button className="bg-[#72001D] text-white px-3 py-1 rounded-lg flex items-center w-40">
                <FaPlus className="mr-1" />
                <span>Edit</span>
              </button>
            </Link>
          </div>
        );
        break;
      default:
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-xl font-bold text-[#72001D]">
              {location.pathname === '/createtask' && 'Create a Task'}
              {location.pathname === '/createproject' && 'Create a Project'}
              {location.pathname === '/settings' && 'Settings'}
              {isEditTask && 'Edit Task'}
              {isEditProject && 'Edit Project'}
            </p>
          </div>
        );
    }
  } else {
    switch (true) {
      case location.pathname === '/dashboard':
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-2xl font-bold text-[#72001D] pl-12">Dashboard</p>
            <div className="flex items-center gap-4">
              <Link to="/createproject">
                <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                  <FaPlus className="mr-2" />
                  New Project
                </button>
              </Link>
            </div>
          </div>
        );
        break;
      case location.pathname === '/mytasks':
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-2xl font-bold text-[#72001D] pl-12">My Tasks</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={onSearchChange}
                  className="border border-gray-300 rounded-md px-3 py-1 text-black w-60 pl-8"
                />
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Link to="/createtask">
                <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                  <FaPlus className="mr-2" />
                  New Task
                </button>
              </Link>
            </div>
          </div>
        );
        break;
      case location.pathname === '/projects':
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-2xl font-bold text-[#72001D] pl-12">My Projects</p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={onSearchChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-black w-60 pl-8"
                />
                <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Link to="/createproject">
                <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                  <FaPlus className="mr-2" />
                  New Project
                </button>
              </Link>
            </div>
          </div>
        );
        break;
      case isViewProject:
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-2xl font-bold text-[#72001D] pl-12">Project Details</p>
            <Link to={`/editproject/${projectId}`}>
              <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                <FaPlus className="mr-2" />
                Edit Project
              </button>
            </Link>
          </div>
        );
        break;
      default:
        headerContent = (
          <div className="flex justify-between items-center p-4 border-b">
            <p className="text-2xl font-bold text-[#72001D] pl-12">
              {location.pathname === '/createtask' && 'Create a Task'}
              {location.pathname === '/createproject' && 'Create a Project'}
              {location.pathname === '/settings' && 'Settings'}
              {isEditTask && 'Edit Task'}
              {isEditProject && 'Edit Project'}
            </p>
          </div>
        );
    }
  }

  return (
    <header className="w-full">
      {headerContent}
    </header>
  );
};

export default PageHeader;
