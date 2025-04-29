import React, { useEffect, useState } from 'react';
import Sidebar from "../Component/sidebar";
import PageHeader from '../Component/pageheader';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem('storedNotifications') || '[]');
    setNotifications(storedNotifications);
  }, []);

  return (
    <div className="bg-[#EEEFEF] min-h-screen flex flex-col">
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <Sidebar />
      </div>

      <div className="ml-75 w-full overflow-y-auto p-6">
        <PageHeader title="Notifications" />
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications to display.</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notif, index) => (
              <li key={index} className="p-4 border rounded shadow-sm bg-white hover:bg-gray-50 cursor-pointer">
                <span>{notif.message || notif.body || notif.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notification;
