import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import { getProjects } from "../api/projectService";
import { createTask } from "../api/taskService";

const CreateTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("Guest");
  const [projectList, setProjectList] = useState([]);
  const token = localStorage.getItem("token");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    project: "",
    status: "",
    priority: "",
    startDate: "",
    endDate: "",
    customReminders: [], // new field for custom reminder hours
  });
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

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

  // Progress simulation
  const simulateProgress = (startFrom = 0) => {
    setLoadingProgress(startFrom);

    const incrementProgress = () => {
      setLoadingProgress(prev => {
        let increment;
        if (prev < 30) increment = Math.random() * 10;
        else if (prev < 60) increment = Math.random() * 5;
        else if (prev < 85) increment = Math.random() * 3;
        else increment = Math.random() * 0.5;

        return Math.min(prev + increment, 90);
      });
    };

    const intervalId = setInterval(incrementProgress, 300);
    return intervalId;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleCustomRemindersChange = (e) => {
    const value = parseInt(e.target.value);
    let newReminders = [...taskData.customReminders];
    if (e.target.checked) {
      if (!newReminders.includes(value)) {
        newReminders.push(value);
      }
    } else {
      newReminders = newReminders.filter(item => item !== value);
    }
    setTaskData({ ...taskData, customReminders: newReminders });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const progressInterval = simulateProgress();

      try {
        const { success, message, task } = await createTask(token, taskData);
        setLoadingProgress(100);
        clearInterval(progressInterval);

        if (success) {
          setTaskData({
            name: "",
            description: "",
            project: "",
            status: "",
            priority: "",
            startDate: "",
            endDate: "",
            customReminders: [],
          });
          toast.success(message || "Task created successfully!");

          // Show browser notification and add to storedNotifications
          if (Notification.permission === 'granted') {
            const projectName = projectList.find(p => p._id === taskData.project)?.name || 'Unknown Project';
            const message = `Great news! Your '${taskData.name}' is now set up in the '${projectName}' project. Assign some subtasks and let's work together to get this done! 🔥`;
            new Notification('Task Created', {
              body: message,
              icon: '/favicon.ico'
            });

            // Add notification to storedNotifications with unique id and timestamp
            const storedNotifications = JSON.parse(localStorage.getItem('storedNotifications') || '[]');
            const newNotification = {
              id: `task_created_${Date.now()}`,
              type: "task",
              message,
              timestamp: Date.now(),
              taskId: task?._id || null,
              projectId: taskData.project
            };
            storedNotifications.push(newNotification);
            localStorage.setItem('storedNotifications', JSON.stringify(storedNotifications));

            // Increment newNotificationCount in localStorage
            let newNotificationCount = parseInt(localStorage.getItem('newNotificationCount') || '0');
            newNotificationCount++;
            localStorage.setItem('newNotificationCount', newNotificationCount.toString());
          }

          setTimeout(() => {
            navigate("/mytasks");
          }, 500);
        } else {
          toast.error(message || "Failed to create task");
          setLoadingProgress(0);
        }
      } catch (error) {
        toast.error(error.message || "An error occurred");
        clearInterval(progressInterval);
        setLoadingProgress(0);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
  };

  useEffect(() => {
    if (location.state?.preselectedProject) {
      setTaskData(prev => ({
        ...prev,
        project: location.state.preselectedProject._id || ""
      }));
    }
  }, [location.state]);

  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUsername(decodedUser?.username || "Guest");
      } catch (error) {
        console.error("Invalid token:", error);
        setUsername("Guest");
      }
    }
  }, [token]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const progressInterval = simulateProgress();

        const data = await getProjects(token);
        setLoadingProgress(100);
        clearInterval(progressInterval);

        setProjectList(data.projects);

        setTimeout(() => {
          setLoadingProjects(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setLoadingProgress(0);
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Mobile view (< 768px)
  if (windowWidth < 768) {
    return (
      <div className="bg-[#EEEFEF] min-h-screen">
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <Sidebar username={username} userProjects={projectList} />
        </div>

        {/* Main content with padding for bottom nav */}
        <div className="pb-16">
          <PageHeader title="Create Task" />

          {loadingProjects ? (
            <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
              <div className="w-48 h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm">Loading ({Math.round(loadingProgress)}%)</p>
            </div>
          ) : (
            <form className="bg-white mx-4 p-4 rounded-lg shadow-md" onSubmit={handleSubmit}>
              <h2 className="text-lg font-semibold text-red-900">Task Details</h2>
              <p className="text-xs text-gray-600 mb-3">Provide details for your task</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold">Name of Task</label>
                  <input
                    type="text"
                    name="name"
                    value={taskData.name}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border rounded mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold">Description</label>
                  <textarea
                    name="description"
                    value={taskData.description}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border rounded mt-1"
                    rows="3"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold">Add to Project</label>
                  <select
                    name="project"
                    value={taskData.project}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border rounded mt-1"
                  >
                    <option value="">Select Project</option>
                    {projectList.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold">Status</label>
                    <select
                      name="status"
                      value={taskData.status}
                      onChange={handleChange}
                      className="w-full p-2 text-sm border rounded mt-1"
                    >
                      <option value="">Select Status</option>
                      <option value="To Do">TO-DO</option>
                      <option value="Ongoing">Ongoing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold">Priority</label>
                    <select
                      name="priority"
                      value={taskData.priority}
                      onChange={handleChange}
                      className="w-full p-2 text-sm border rounded mt-1"
                    >
                      <option value="">Select Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      onClick={(e) => e.target.showPicker()}
                      min={new Date().toISOString().split('T')[0]}
                      value={taskData.startDate}
                      onChange={handleChange}
                      className="w-full p-2 text-sm border rounded mt-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      onClick={(e) => e.target.showPicker()}
                      min={taskData.startDate || new Date().toISOString().split('T')[0]}
                      value={taskData.endDate}
                      onChange={handleChange}
                      className="w-full p-2 text-sm border rounded mt-1 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Custom Reminder Multi-select */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-1">Custom Reminder (hours before due date)</label>
                  <div className="flex flex-wrap gap-4">
                    {[3, 6, 9, 12].map(hour => (
                      <label key={hour} className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={hour}
                          checked={taskData.customReminders.includes(hour)}
                          onChange={handleCustomRemindersChange}
                          className="form-checkbox"
                        />
                        <span>{hour} hours</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select one or more reminder times. Optional field.</p>
                </div>
              </div>

              <div className="mt-4">
                {loading ? (
                  <button disabled className="bg-red-800 text-white w-full py-2 rounded relative text-sm">
                    <div className="absolute inset-0 flex items-center justify-center">
                      Creating ({Math.round(loadingProgress)}%)
                    </div>
                    <div
                      className="h-full bg-red-600 absolute top-0 left-0 transition-all duration-300"
                      style={{ width: `${loadingProgress}%`, opacity: '0.5' }}
                    ></div>
                  </button>
                ) : (
                  <button type="submit" className="bg-red-900 text-white w-full py-2 rounded text-sm">
                    Create Task
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <ToastContainer />
      </div>
    );
  }

  // Tablet view (768px - 1024px)
  if (windowWidth >= 768 && windowWidth < 1024) {
    return (
      <div className="h-screen bg-[#EEEFEF] flex">
        <div className="fixed h-screen">
          <Sidebar username={username} userProjects={projectList} />
        </div>

        <div className="ml-16 w-full overflow-y-auto p-4">
          <PageHeader title="Create Task" />

          {loadingProjects ? (
            <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
              <div className="w-56 h-3 bg-gray-300 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm">Loading ({Math.round(loadingProgress)}%)</p>
            </div>
          ) : (
            <form className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto" onSubmit={handleSubmit}>
              <h2 className="text-xl font-semibold text-red-900">Task Details</h2>
              <p className="text-gray-600 mb-4">Provide details for your task</p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block font-semibold">Name of Task</label>
                  <input
                    type="text"
                    name="name"
                    value={taskData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mt-1"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Description</label>
                  <textarea
                    name="description"
                    value={taskData.description}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mt-1"
                    rows="4"
                  ></textarea>
                </div>

                <div>
                  <label className="block font-semibold">Add to Project</label>
                  <select
                    name="project"
                    value={taskData.project}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mt-1"
                  >
                    <option value="">Select Project</option>
                    {projectList.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold">Status</label>
                    <select
                      name="status"
                      value={taskData.status}
                      onChange={handleChange}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="">Select Status</option>
                      <option value="To Do">TO-DO</option>
                      <option value="Ongoing">Ongoing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold">Priority</label>
                    <select
                      name="priority"
                      value={taskData.priority}
                      onChange={handleChange}
                      className="w-full p-2 border rounded mt-1"
                    >
                      <option value="">Select Priority</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      onClick={(e) => e.target.showPicker()}
                      min={new Date().toISOString().split('T')[0]}
                      value={taskData.startDate}
                      onChange={handleChange}
                      className="w-full p-2 border rounded mt-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      onClick={(e) => e.target.showPicker()}
                      min={taskData.startDate || new Date().toISOString().split('T')[0]}
                      value={taskData.endDate}
                      onChange={handleChange}
                      className="w-full p-2 border rounded mt-1 cursor-pointer"
                    />
                  </div>
                </div>
                {/* Custom Reminder Multi-select */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-1">Custom Reminder (hours before due date)</label>
                  <div className="flex flex-wrap gap-4">
                    {[3, 6, 9, 12].map(hour => (
                      <label key={hour} className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={hour}
                          checked={taskData.customReminders.includes(hour)}
                          onChange={handleCustomRemindersChange}
                          className="form-checkbox"
                        />
                        <span>{hour} hours</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select one or more reminder times. Optional field.</p>
                </div>
              </div>


              <div className="mt-6">
                {loading ? (
                  <button disabled className="bg-red-800 text-white w-full py-3 rounded relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      Creating Task ({Math.round(loadingProgress)}%)
                    </div>
                    <div
                      className="h-full bg-red-600 absolute top-0 left-0 transition-all duration-300"
                      style={{ width: `${loadingProgress}%`, opacity: '0.5' }}
                    ></div>
                  </button>
                ) : (
                  <button type="submit" className="bg-red-900 text-white w-full py-3 rounded">
                    Create Task
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        <ToastContainer />
      </div>
    );
  }

  // Desktop view (≥ 1024px)
  return (
    <div className="h-screen bg-[#EEEFEF] flex">
      <div className="fixed h-screen">
        <Sidebar username={username} userProjects={projectList} />
      </div>

      <div className="overflow-y-auto bg-[#EEEFEF]" style={{ width: 'calc(100% - 16rem)', marginLeft: '16rem' }}>
        <PageHeader title="Create Task" />

        {loadingProjects ? (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-50">
            <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p>Loading ({Math.round(loadingProgress)}%)</p>
          </div>
        ) : (
          <form className="bg-white w-full max-w-3xl mx-auto p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-semibold text-red-900">Task Details</h2>
            <p className="text-gray-600 mb-6">Provide details for your task</p>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-lg font-semibold">Name of Task</label>
                <input
                  type="text"
                  name="name"
                  value={taskData.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold">Description</label>
                <textarea
                  name="description"
                  value={taskData.description}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300"
                  rows="5"
                ></textarea>
              </div>

              <div>
                <label className="block text-lg font-semibold">Add to Project</label>
                <select
                  name="project"
                  value={taskData.project}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300"
                >
                  <option value="">Select Project</option>
                  {projectList.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold">Status</label>
                  <select
                    name="status"
                    value={taskData.status}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300"
                  >
                    <option value="">Select Status</option>
                    <option value="To Do">TO-DO</option>
                    <option value="Ongoing">Ongoing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold">Priority</label>
                  <select
                    name="priority"
                    value={taskData.priority}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300"
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    onClick={(e) => e.target.showPicker()}
                    min={new Date().toISOString().split('T')[0]}
                    value={taskData.startDate}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    onClick={(e) => e.target.showPicker()}
                    min={taskData.startDate || new Date().toISOString().split('T')[0]}
                    value={taskData.endDate}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-300 cursor-pointer"
                  />
                </div>
              </div>
              {/* Custom Reminder Multi-select */}
              <div className="mt-4">
                  <label className="block text-sm font-semibold mb-1">Custom Reminder (hours before due date)</label>
                  <div className="flex flex-wrap gap-4">
                    {[3, 6, 9, 12].map(hour => (
                      <label key={hour} className="inline-flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={hour}
                          checked={taskData.customReminders.includes(hour)}
                          onChange={handleCustomRemindersChange}
                          className="form-checkbox"
                        />
                        <span>{hour} hours</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select one or more reminder times. Optional field.</p>
                </div>
            </div>

            <div className="mt-8">
              {loading ? (
                <button disabled className="bg-red-800 text-white w-full py-3 rounded-lg relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    Creating Task ({Math.round(loadingProgress)}%)
                  </div>
                  <div
                    className="h-full bg-red-600 absolute top-0 left-0 transition-all duration-300"
                    style={{ width: `${loadingProgress}%`, opacity: '0.5' }}
                  ></div>
                </button>
              ) : (
                <button type="submit" className="bg-red-900 text-white w-full py-3 rounded-lg hover:bg-red-800">
                  Create Task
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default CreateTask;