import React, { useState, useEffect } from 'react';

const InAppNotification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNewNotification = (event) => {
      const newNotification = event.detail;

      // Save notification to localStorage
      const storedNotifications = JSON.parse(localStorage.getItem('storedNotifications') || '[]');

      // Avoid duplicates by checking notification id or title+body+timestamp
      const isDuplicate = storedNotifications.some(notif => 
        notif.id === newNotification.id ||
        (notif.title === newNotification.title && notif.body === newNotification.body && notif.timestamp === newNotification.timestamp)
      );

      if (!isDuplicate) {
        const updatedNotifications = [...storedNotifications, {
          id: newNotification.id || `${newNotification.title}-${Date.now()}`,
          title: newNotification.title,
          message: newNotification.body,
          timestamp: newNotification.timestamp || Date.now(),
          type: "onesignal"
        }];

        // Optionally limit stored notifications to last 100
        if (updatedNotifications.length > 100) {
          updatedNotifications.shift();
        }

        localStorage.setItem('storedNotifications', JSON.stringify(updatedNotifications));
      }

      // Show in-app notification
      setNotifications((prev) => [...prev, newNotification]);
      setTimeout(() => {
        setNotifications((prev) => prev.slice(1));
      }, 5000); // Remove notification after 5 seconds
    };

    window.addEventListener('OneSignalNotificationDisplayed', handleNewNotification);

    return () => {
      window.removeEventListener('OneSignalNotificationDisplayed', handleNewNotification);
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {notifications.map((notif, index) => (
        <div key={index} style={{
          backgroundColor: '#333',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          minWidth: '250px',
        }}>
          <strong>{notif.title}</strong>
          <p>{notif.body}</p>
        </div>
      ))}
    </div>
  );
};

export default InAppNotification;
