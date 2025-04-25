import React, { useEffect, useState } from 'react';
import Sidebar from "../Component/sidebar";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import PageHeader from '../Component/pageheader';
import TaskDetailsModal from '../Component/taskdetails';
import { getTask } from '../api/taskService';

const Notification = () => {
  const [username, setUsername] = useState("Guest");
  const [notifications, setNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [taskError, setTaskError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  useEffect(() => {
    localStorage.setItem('newNotificationCount', '0');
    window.dispatchEvent(new Event('storage'));
  }, []);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 90) {
        clearInterval(interval);
      }
      setLoadingProgress(progress);
    }, 100);

    const storedNotifications = JSON.parse(localStorage.getItem('storedNotifications') || '[]');
    setNotifications(storedNotifications);

    setTimeout(() => {
      setLoadingProgress(100);
      setLoading(false);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const groupByDay = () => {
      const groups = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      notifications.forEach(notif => {
        let notifDate = notif.timestamp ? new Date(notif.timestamp) : null;
        if (!notifDate) {
          if (!groups['Unknown']) groups['Unknown'] = [];
          groups['Unknown'].push(notif);
          return;
        }
        notifDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - notifDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let groupLabel = '';
        if (diffDays === 0) {
          groupLabel = 'Today';
        } else if (diffDays === 1) {
          groupLabel = 'Yesterday';
        } else {
          groupLabel = `${diffDays} days ago`;
        }

        if (!groups[groupLabel]) groups[groupLabel] = [];
        groups[groupLabel].push(notif);
      });

      Object.keys(groups).forEach(group => {
        groups[group].sort((a, b) => {
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime;
        });
      });

      setGroupedNotifications(groups);
    };

    groupByDay();
  }, [notifications]);

  const handleNotificationClick = async (notif) => {
    // Debug log
    console.log('Notification clicked:', notif);

    // If notification is a project creation notification, navigate to project details page
    if (notif.id && notif.id.startsWith('project_created_') && notif.projectId) {
      navigate(`/viewproject/${notif.projectId}`);
      return;
    }

    let taskId = notif.taskId || notif.id;
    if (typeof taskId === 'string') {
      if (taskId.includes('_custom_')) {
        taskId = taskId.split('_custom_')[0];
      }
      if (taskId.endsWith('_overdue')) {
        taskId = taskId.replace('_overdue', '');
      }
    }
    if (taskId) {
      setLoadingTask(true);
      setTaskError(null);
      const token = localStorage.getItem('token');
      const response = await getTask(token, taskId);
      setLoadingTask(false);
      if (response.success) {
        setSelectedTask(response.task);
      } else {
        setTaskError('Failed to load task details');
      }
    }
  };

  const renderGroupedNotifications = () => {
    const groupKeys = Object.keys(groupedNotifications).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      const aDays = parseInt(a) || 0;
      const bDays = parseInt(b) || 0;
      return aDays - bDays;
    });

    return groupKeys.map(group => (
      <div key={group} className="m-7">
        <h2 className="text-lg font-semibold mb-2">{group}</h2>
        <ul className="space-y-3">
          {groupedNotifications[group].map(notif => (
            <li
              key={notif.id}
              className="p-4 border rounded shadow-sm bg-white hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              onClick={() => handleNotificationClick(notif)}
            >
              <span>{notif.message}</span>
              {/* View Project button removed as per user request */}
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
        <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
        </div>
        <p>Loading Notifications</p>
        <div className="text-black text-lg font-semibold">{loadingProgress}%</div>
      </div>
    );
  }

  if (windowWidth < 768) {
    return (
      <div className="bg-[#EEEFEF] min-h-screen flex flex-col">
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <Sidebar username={username} />
        </div>

        <div className="pb-16 px-4 pt-4 overflow-y-auto flex-1">
          <PageHeader title="Notification" />
          <h1 className="text-xl font-bold mb-4">Notifications</h1>

          {taskError && <p className="text-red-600 mb-2">{taskError}</p>}

          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications to display.</p>
          ) : (
            renderGroupedNotifications()
          )}
        </div>

        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdate={() => setSelectedTask(null)}
          />
        )}
      </div>
    );
  }

  if (windowWidth >= 768 && windowWidth < 1024) {
    return (
      <div className="h-screen bg-[#EEEFEF] flex justify-center">
        <div className="fixed h-screen">
          <Sidebar username={username} />
        </div>

        <div className="ml-16 w-[800px] max-w-full overflow-y-auto p-6">
          <PageHeader title="Notification" />
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>

          {taskError && <p className="text-red-600 mb-2">{taskError}</p>}

          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications to display.</p>
          ) : (
            renderGroupedNotifications()
          )}

          {selectedTask && (
            <TaskDetailsModal
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onTaskUpdate={() => setSelectedTask(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#EEEFEF] flex">
      <div className="fixed h-screen">
        <Sidebar username={username} />
      </div>

      <div className="overflow-y-auto ml-8  bg-[#EEEFEF]" style={{ width: 'calc(100% - 16rem)', marginLeft: '16rem' }}>
        <PageHeader title="Notification" />
        <p className="text-md m-8 font-bold flex justify-between items-center">
          Recent Notifications
          <button
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
            onClick={() => {
              localStorage.removeItem('storedNotifications');
              setNotifications([]);
              localStorage.setItem('newNotificationCount', '0');
              window.dispatchEvent(new Event('storage'));
            }}
            title="Clear All Notifications"
          >
            Clear All
          </button>
        </p>

        {taskError && <p className="text-red-600 m-8">{taskError}</p>}

        {notifications.length === 0 ? (
          <p className="text-gray-500 text-md ">No notifications to display.</p>
        ) : (
          renderGroupedNotifications()
        )}

        {selectedTask && (
          <TaskDetailsModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdate={() => setSelectedTask(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Notification;