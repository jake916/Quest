import React, { useEffect, useState } from 'react';
import { getTasks } from '../api/taskService';

const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

const NotificationManager = () => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') {
      console.warn('Notification API not supported in this browser.');
      return;
    }

    if (isIOS()) {
      console.warn('Notifications are disabled on iOS devices due to limited support.');
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission()
        .then(permission => {
          setPermission(permission);
        })
        .catch(error => {
          console.error('Notification permission request failed:', error);
        });
    }
  }, []);

  useEffect(() => {
    if (permission !== 'granted') return;
    if (isIOS()) return;

    const checkDueTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await getTasks(token);
        if (!response.success) return;

        const tasks = response.data || [];

        const now = new Date();

        const shownDefaultNotifications = JSON.parse(localStorage.getItem('shownDefaultNotifications') || '[]');
        const shownCustomNotifications = JSON.parse(localStorage.getItem('shownCustomNotifications') || '[]');
        const shownOverdueNotifications = JSON.parse(localStorage.getItem('shownOverdueNotifications') || '[]');
        const storedNotifications = JSON.parse(localStorage.getItem('storedNotifications') || '[]');

        let newNotificationCount = parseInt(localStorage.getItem('newNotificationCount') || '0');

        tasks.forEach(task => {
          if (!task.endDate) return;

          const dueDate = new Date(task.endDate);

          // Custom reminders
          if (Array.isArray(task.customReminders) && task.customReminders.length > 0) {
            task.customReminders.forEach(hoursBefore => {
              const reminderId = `${task._id}_custom_${hoursBefore}`;
              const reminderTime = new Date(dueDate.getTime() - hoursBefore * 60 * 60 * 1000);
              const timeDiff = now.getTime() - reminderTime.getTime();
              if (timeDiff >= 0 && timeDiff < 5 * 60 * 1000 && !shownCustomNotifications.includes(reminderId)) {
                try {
                  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.getRegistration().then(registration => {
                      if (registration) {
                        registration.showNotification('Task Reminder', {
                          body: `Task "${task.name}" is due in ${hoursBefore} hour(s).`,
                          icon: '/favicon.ico'
                        });
                      } else {
                        new Notification('Task Reminder', {
                          body: `Task "${task.name}" is due in ${hoursBefore} hour(s).`,
                          icon: '/favicon.ico'
                        });
                      }
                    });
                  } else {
                    new Notification('Task Reminder', {
                      body: `Task "${task.name}" is due in ${hoursBefore} hour(s).`,
                      icon: '/favicon.ico'
                    });
                  }
                } catch (error) {
                  console.error('Notification error:', error);
                }
                shownCustomNotifications.push(reminderId);
                localStorage.setItem('shownCustomNotifications', JSON.stringify(shownCustomNotifications));
                storedNotifications.push({ id: reminderId, message: `Task "${task.name}" is due in ${hoursBefore} hour(s).`, timestamp: Date.now(), type: "task" });
                localStorage.setItem('storedNotifications', JSON.stringify(storedNotifications));
                newNotificationCount++;
              }
            });
          } else {
            // Default reminder for tasks due tomorrow
            const midnightDueDate = new Date(dueDate);
            midnightDueDate.setHours(0, 0, 0, 0);
            const midnightNow = new Date(now);
            midnightNow.setHours(0, 0, 0, 0);
            const diffTime = midnightDueDate.getTime() - midnightNow.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays === 1) {
              if (!shownDefaultNotifications.includes(task._id)) {
                try {
                  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.getRegistration().then(registration => {
                      if (registration) {
                        registration.showNotification('Task Reminder', {
                          body: `Task "${task.name}" is due tomorrow.`,
                          icon: '/favicon.ico'
                        });
                      } else {
                        new Notification('Task Reminder', {
                          body: `Task "${task.name}" is due tomorrow.`,
                          icon: '/favicon.ico'
                        });
                      }
                    });
                  } else {
                    new Notification('Task Reminder', {
                      body: `Task "${task.name}" is due tomorrow.`,
                      icon: '/favicon.ico'
                    });
                  }
                } catch (error) {
                  console.error('Notification error:', error);
                }
                shownDefaultNotifications.push(task._id);
                localStorage.setItem('shownDefaultNotifications', JSON.stringify(shownDefaultNotifications));
                storedNotifications.push({ id: task._id, message: `Task "${task.name}" is due tomorrow.`, timestamp: Date.now(), type: "task" });
                localStorage.setItem('storedNotifications', JSON.stringify(storedNotifications));
                newNotificationCount++;
              }
            }
          }

          // Overdue task notification
          const isOverdue = dueDate < now;
          const isNotCompleted = task.status?.toLowerCase() !== 'completed';
          const isNotCancelled = task.status?.toLowerCase() !== 'cancelled';
          if (isOverdue && isNotCompleted && isNotCancelled) {
            if (!shownOverdueNotifications.includes(task._id)) {
              try {
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.getRegistration().then(registration => {
                    if (registration) {
                      registration.showNotification('Task Overdue', {
                        body: `Task "${task.name}" is overdue.`,
                        icon: '/favicon.ico'
                      });
                    } else {
                      new Notification('Task Overdue', {
                        body: `Task "${task.name}" is overdue.`,
                        icon: '/favicon.ico'
                      });
                    }
                  });
                } else {
                  new Notification('Task Overdue', {
                    body: `Task "${task.name}" is overdue.`,
                    icon: '/favicon.ico'
                  });
                }
              } catch (error) {
                console.error('Notification error:', error);
              }
              shownOverdueNotifications.push(task._id);
              localStorage.setItem('shownOverdueNotifications', JSON.stringify(shownOverdueNotifications));
              storedNotifications.push({ id: `${task._id}_overdue`, message: `Task "${task.name}" is overdue.`, timestamp: Date.now(), type: "task" });
              localStorage.setItem('storedNotifications', JSON.stringify(storedNotifications));
              newNotificationCount++;
            }
          }
        });

        if (newNotificationCount > 0) {
          localStorage.setItem('newNotificationCount', newNotificationCount.toString());
        }
      } catch (error) {
        console.error('Error checking due tasks for notifications:', error);
      }
    };

    checkDueTasks();

    const intervalId = setInterval(checkDueTasks, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [permission]);

  return null;
};

export default NotificationManager;
