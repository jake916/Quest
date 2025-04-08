import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const PageHeader = () => {
  const location = useLocation();
  let headerContent;

  switch (location.pathname) {
    case '/dashboard':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120 ">
          {/* Dashboard Title */}
          {/* <img src="src/assets/logo.png" alt="Logo" className="w-19 absolute pb-1 bottom-136 left-70" /> */}
          <p className=" text-[20px] font-bold text-[#72001D] pl-20 ">Dashboard</p>

          {/* Search and New Task Button */}
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
    case '/mytasks':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120 ">
          {/* Dashboard Title */}
          <p className=" text-[20px] font-bold text-[#72001D] pl-12 ">My Tasks</p>

          {/* Search and New Task Button */}
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
    case '/createtask':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120 ">
          {/* Dashboard Title */}
          <p className=" text-[20px] font- text-[#72001D] pl-12 ">Create a Task</p>

        </div>
      break;
    case '/projects':
      headerContent =
        <div className="flex justify-between items-center p-4 border-b gap-120 ">
          {/* Dashboard Title */}
          <p className=" text-[20px] font-bold text-[#72001D] pl-17 ">My Projects</p>

          {/* Search and New Project Button */}
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

      case '/createproject':
        headerContent =
          <div className="flex justify-between items-center p-4 border-b gap-120 ">
            {/* Dashboard Title */}
            <p className=" text-[20px] font- text-[#72001D] pl-12 ">Create a Project</p>
          </div>
      break;
      
    case '/settings':
      headerContent = <h1>Settings</h1>;
      break;
    case '/messages':
      headerContent = <h1>Messages</h1>;
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
