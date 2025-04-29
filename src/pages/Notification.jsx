import React, { useEffect, useState } from 'react';
import Sidebar from "../Component/sidebar";
import PageHeader from '../Component/pageheader';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUsername(decodedUser?.username || "Guest");
      } catch (error) {
        console.error("Invalid token:", error);
        setUsername("Guest");
      }
    }
  }, []);


  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load notifications
  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem('storedNotifications') || '[]');
    setNotifications(storedNotifications);
    // Clear notification count when page is viewed
    localStorage.setItem('newNotificationCount', '0');
  }, []);

  const handleNotificationClick = (notif) => {
    if (notif.type === 'task' && notif.taskId) {
      navigate(`/tasks/${notif.taskId}`);
    } else if (notif.type === 'project' && notif.projectId) {
      navigate(`/projects/${notif.projectId}`);
    }
  };

  // Mobile view (< 768px)
  if (windowWidth < 768) {
    return (
      <div className="bg-[#EEEFEF] min-h-screen">
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <Sidebar />
        </div>
        
        {/* Main content with padding for bottom nav */}
        <div className="pb-16 px-4 pt-4">
          <PageHeader title="Notifications" />
          
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">No notifications to display</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((notif, index) => (
                <li 
                  key={index} 
                  className="p-3 border rounded shadow-sm bg-white hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => handleNotificationClick(notif)}
                >
                  {notif.message || notif.body || notif.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Tablet view (768px - 1024px)
  if (windowWidth >= 768 && windowWidth < 1024) {
    return (
      <div className="h-screen bg-[#EEEFEF] flex">
        <div className="fixed h-screen">
          <Sidebar />
        </div>

        <div className="ml-16 w-full overflow-y-auto p-6">
          <PageHeader title="Notifications" />
          
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-gray-500">No notifications to display</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notif, index) => (
                <li 
                  key={index} 
                  className="p-4 border rounded shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleNotificationClick(notif)}
                >
                  {notif.message || notif.body || notif.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // Desktop view (≥ 1024px)
  return (
    <div className="h-screen bg-[#EEEFEF] flex">
      <div className="fixed h-screen">
        <Sidebar username={username} />
      </div>

      <div className="ml-70 w-full overflow-y-auto p-8">
        <PageHeader  title="Notifications" />
        
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 text-lg">No notifications to display</p>
          </div>
        ) : (
          <ul className="space-y-4 max-w-3xl mx-auto">
            {notifications.map((notif, index) => (
              <li 
                key={index} 
                className="p-5 border rounded-lg shadow-sm bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="text-lg font-medium">
                      {notif.message || notif.body || notif.title}
                    </p>
                    {notif.timestamp && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(notif.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;