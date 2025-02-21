import React from "react";
import { FiHome, FiCheckSquare, FiFolder, FiMessageCircle, FiSettings, FiPlus } from "react-icons/fi";
import { FaArrowCircleRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = () => {
    return (
        <div className="w-64 bg-[#72001D] text-white flex flex-col justify-between p-4 overflow-hidden">
            {/* Profile Section */}
            <div>
                <div className="flex items-center space-x-3">
                    <img
                        src="src/assets/Avatar.png"
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <h2 className="font-semibold text-sm">Jake Ayodeji</h2>
                </div>

                {/* MAIN Section */}
                <div className="mt-6">
                    <p className="text-xs text-gray-300 uppercase">Main</p>
                    <ul className="mt-2 space-y-2">
                        <Link to="/dashboard">
                            <li className={`flex items-center space-x-2 ${location.pathname === '/dashboard' ? 'bg-white' : 'text-white'} px-3 py-2 rounded-lg`}>



                                <FiHome className="text-lg" />
                                <span className="text-sm font-medium">Dashboard</span>
                            </li>
                        </Link>
                        <Link to="/mytasks">
                            <li className={`flex items-center space-x-2 ${location.pathname === '/mytasks' ? 'bg-white' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                                <FiCheckSquare className="text-lg" />
                                <span className="text-sm">My Tasks</span>
                            </li>
                        </Link>

                        <Link to="/projects">
                            <li className={`flex items-center space-x-2 ${location.pathname === '/projects' ? 'bg-white' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                                <FiFolder className="text-lg" />
                                <span className="text-sm">Projects</span>
                            </li>
                        </Link>

                        <Link to="/messages">
                            <li className={`flex items-center space-x-2 ${location.pathname === '/messages' ? 'bg-white' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                                <FiMessageCircle className="text-lg" />
                                <span className="text-sm">Message</span>
                            </li>
                        </Link>

                        <Link to="/settings">
                            <li className={`flex items-center space-x-2 ${location.pathname === '/settings' ? 'bg-white' : 'text-white'} px-3 py-2 rounded-lg cursor-pointer`}>
                                <FiSettings className="text-lg" />
                                <span className="text-sm">Settings</span>
                            </li>
                        </Link>

                    </ul>
                </div>

                {/* PROJECTS Section */}
                <div className="mt-6">
                    <p className="text-xs text-gray-300 uppercase flex justify-between">
                        Projects <FiPlus className="cursor-pointer text-sm" />
                    </p>
                    <ul className="mt-2 space-y-2">
                        <li className="flex items-center space-x-2 px-3 py-2 hover:bg-white/20 rounded-lg cursor-pointer">
                            <span className="w-4 h-4 bg-yellow-500 rounded-full"></span>
                            <span className="text-sm">Sleekpay App</span>
                        </li>
                        <li className="flex items-center space-x-2 px-3 py-2 hover:bg-white/20 rounded-lg cursor-pointer">
                            <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                            <span className="text-sm">PayPal App</span>
                        </li>
                        <li className="flex items-center space-x-2 px-3 py-2 hover:bg-white/20 rounded-lg cursor-pointer">
                            <span className="w-4 h-4 bg-purple-500 rounded-full"></span>
                            <span className="text-sm">Dribble Posts</span>
                        </li>
                        <li className="flex items-center space-x-2 px-3 py-2 hover:bg-white/20 rounded-lg cursor-pointer">
                            <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                            <span className="text-sm">YouTube</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mb-40 p-4 rounded-lg text-center">
                <Link to="/">
                    <button className="mt-3 bg-[#FF004D] text-white px-4 py-2 rounded-lg flex items-center justify-center w-full">
                        <FaArrowCircleRight className="mr-2 text-sm" />
                        Logout
                    </button>
                </Link>
            </div>
        </div >
    )
}

export default Sidebar;
