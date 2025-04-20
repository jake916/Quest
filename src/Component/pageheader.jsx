import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const PageHeader = ({ projectId }) => {
  const location = useLocation();
  let headerContent;

  // Check if path matches edit task pattern
  const isEditTask = location.pathname.startsWith('/edittask/');
  const isEditProject = location.pathname === '/editproject' || location.pathname.startsWith('/editproject/');
  const isViewProject = location.pathname.startsWith('/viewproject/');

  switch (true) {
    case location.pathname === '/dashboard':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-20">Dashboard</p>
          <div className="flex items-center gap-1">
            <Link to="/createproject">
              <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                <FaPlus className="mr-2" />
                New Project
              </button>
            </Link>
          </div>
        </div>
      break;
    case location.pathname === '/mytasks':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-12">My Tasks</p>
          <div className="flex items-center gap-1">
            <Link to="/createtask">
              <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                <FaPlus className="mr-2" />
                New Task
              </button>
            </Link>
          </div>
        </div>
      break;
    case location.pathname === '/createtask':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-12">Create a Task</p>
        </div>
      break;
    case location.pathname === '/projects':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-17">My Projects</p>
          <div className="flex items-center gap-1">
            <Link to="/createproject">
              <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
                <FaPlus className="mr-2" />
                New Project
              </button>
            </Link>
          </div>
        </div>
      break;
    case location.pathname === '/createproject':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-12">Create a Project</p>
        </div>
      break;
    case location.pathname === '/settings':
      headerContent = <h1>Settings</h1>;
      break;
    case isEditTask:
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-12">Edit Task</p>
        </div>
      break;
    case isEditProject:
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-12">Edit Project</p>
        </div>
      break;
    case isViewProject:
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120">
          <p className="text-[20px] font-bold text-[#72001D] pl-12">Project Details</p>
          <Link to={`/editproject/${projectId}`}>
            <button className="bg-[#72001D] text-white px-4 py-2 rounded-lg flex items-center w-40">
              <FaPlus className="mr-2" />
              Edit Project
            </button>
          </Link>
        </div>
      break;
    default:
      headerContent = <h1>Welcome to the Application</h1>;
  }

  return (
    <header>
      {headerContent}
    </header>
  );
};

export default PageHeader;