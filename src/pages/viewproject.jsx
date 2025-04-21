import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from "../Component/pageheader";
import Sidebar from "../Component/sidebar";
import { jwtDecode } from "jwt-decode";
import { API_URL as TASK_API_URL } from "../api/taskService";
import TaskCard from "../Component/taskcard";
import { getProjectById, deleteProject } from "../api/projectService";
import axios from 'axios';
import TaskDetailsModal from "../Component/taskdetails";
import ConfirmModal from "../Component/ConfirmModal";

const ViewProject = () => {
  const { id } = useParams(); // project ID from URL
  const navigate = useNavigate();
  const [username, setUsername] = useState("Guest");
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [token, setToken] = useState(null);
  const [filter, setFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortOption, setSortOption] = useState("None");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filtersRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      try {
        const decodedUser = jwtDecode(storedToken);
        setUsername(decodedUser?.username || "Guest");
      } catch (error) {
        console.error("Invalid token:", error);
        setUsername("Guest");
      }
    }
  }, []);

  const fetchProject = useCallback(async () => {
    try {
      if (!token) return;
      setLoadingProject(true);
      const data = await getProjectById(token, id);
      setProject(data.project);
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoadingProject(false);
    }
  }, [id, token]);

  const fetchTasks = useCallback(async () => {
    try {
      if (!token) return;
      setLoadingTasks(true);
      const res = await axios.get(`${TASK_API_URL}/project/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [fetchProject, fetchTasks]);

  useEffect(() => {
    let interval = null;
    if ((loadingProject || loadingTasks) && loadingProgress < 100) {
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const nextProgress = prev + 10;
          if (nextProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return nextProgress;
        });
      }, 200);
    } else if (!loadingProject && !loadingTasks) {
      setLoadingProgress(100);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loadingProject, loadingTasks, loadingProgress]);

  const normalizeStatus = (status) => {
    const mapping = {
      "To Do": "to do",
      "Ongoing": "Ongoing",
      "Cancelled": "cancelled",
      "Completed": "completed",
      "Overdue": "overdue"
    };
    return mapping[status] || status.toLowerCase();
  };

  const normalizePriority = (priority) => {
    const mapping = {
      "High": 1,
      "Medium": 2,
      "Low": 3
    };
    return mapping[priority] || 4;
  };

  const filteredTasks = Array.isArray(tasks) ?
    tasks.filter(task => {
      const statusMatch = filter === "All" || normalizeStatus(task.status) === normalizeStatus(filter);
      const priorityMatch = priorityFilter === "All" || normalizePriority(task.priority) === normalizePriority(priorityFilter);
      const searchMatch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && priorityMatch && searchMatch;
    })
    : [];

  const sortedTasks = [...filteredTasks];
  if (sortOption === "Alphabetically") {
    sortedTasks.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === "By Priority") {
    sortedTasks.sort((a, b) => normalizePriority(a.priority) - normalizePriority(b.priority));
  }

  const handleAddTaskClick = () => {
    navigate('/createtask', { state: { preselectedProject: project } });
  };

  // Callback to reload tasks after subtask added and saved
  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDelete(false);
    try {
      if (!token || !project) return;
      const response = await deleteProject(token, project._id);
      if (response && (response.success || response.status === 'success')) {
        navigate('/projects');
      } else {
        alert("Failed to delete project.");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project: " + (error.message || "Unknown error"));
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setFiltersOpen(false);
        setStatusDropdownOpen(false);
        setPriorityDropdownOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="h-screen bg-[#EEEFEF] flex">
      <div className="fixed h-screen">
        <Sidebar username={username} />  {/* Pass username to Sidebar */}
      </div>

      {/* Main Content Area */}
      <div className="ml-[200px] w-290 overflow-y-auto h-screen p-5">
        <PageHeader projectId={project?._id} searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} />
        <div className="mt-[30px] ml-[75px]">
          {(loadingProject || loadingTasks) ? (
            <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
              <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
              </div>
              <p>Loading Project Details</p>
              <div className="text-black text-lg font-semibold">{loadingProgress}%</div>
            </div>
          ) : project !== null ? (
            <>
              <h2 className="font-bold text-xl mb-4">Name of Project: {project.name}</h2>
              <p className="mb-8"> Project Description: {project.description}</p>

              <div className="flex gap-4 mb-4 relative" ref={filtersRef}>
                <button
                  className="px-4 py-2 bg-white text-[#800020] rounded"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  Filters
                </button>

                {filtersOpen && (
                  <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow-lg p-4 w-64 z-10">
                    <div>
                      <button
                        className="w-full text-left px-3 py-2 border-b border-gray-200"
                        onClick={() => {
                          setStatusDropdownOpen(!statusDropdownOpen);
                          setPriorityDropdownOpen(false);
                        }}
                      >
                        Filter by Status: <span className="font-semibold">{filter}</span>
                      </button>
                      {statusDropdownOpen && (
                        <ul className="border border-gray-200 rounded mt-1 max-h-40 overflow-auto">
                          {['All', 'To Do', 'Ongoing', 'Cancelled', 'Completed', 'Overdue'].map((status) => (
                            <li
                              key={status}
                              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                                filter === status ? 'bg-gray-200 font-semibold' : ''
                              }`}
                              onClick={() => {
                                setFilter(status);
                                setStatusDropdownOpen(false);
                                setFiltersOpen(false);
                              }}
                            >
                              {status}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-4">
                      <button
                        className="w-full text-left px-3 py-2 border-b border-gray-200"
                        onClick={() => {
                          setPriorityDropdownOpen(!priorityDropdownOpen);
                          setStatusDropdownOpen(false);
                        }}
                      >
                        Filter by Priority: <span className="font-semibold">{priorityFilter}</span>
                      </button>
                      {priorityDropdownOpen && (
                        <ul className="border border-gray-200 rounded mt-1 max-h-40 overflow-auto">
                          {['All', 'High', 'Medium', 'Low'].map((priority) => (
                            <li
                              key={priority}
                              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                                priorityFilter === priority ? 'bg-gray-200 font-semibold' : ''
                              }`}
                              onClick={() => {
                                setPriorityFilter(priority);
                                setPriorityDropdownOpen(false);
                                setFiltersOpen(false);
                              }}
                            >
                              {priority}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                <div className="relative ml-4" ref={sortRef}>
                  <button
                    className="px-4 py-2 bg-white text-[#800020] rounded"
                    onClick={() => setSortOpen(!sortOpen)}
                  >
                    Sort: {sortOption}
                  </button>
                  {sortOpen && (
                    <ul className="absolute mt-2 bg-white border border-gray-300 rounded shadow-lg p-2 w-48 z-10">
                      {["None", "Alphabetically", "By Priority"].map((option) => (
                        <li
                          key={option}
                          className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                            sortOption === option ? "bg-gray-200 font-semibold" : ""
                          }`}
                          onClick={() => {
                            setSortOption(option);
                            setSortOpen(false);
                          }}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {loadingTasks ? (
                <p>Loading tasks...</p>
              ) : sortedTasks && sortedTasks.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {sortedTasks.slice(0, 9).map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      token={token}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                </div>
              ) : (
                <p>No tasks assigned to this project.</p>
              )}

              <button
                onClick={handleDeleteClick}
                className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Project
              </button>

            </>
          ) : (
            <p>Project not found.</p>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={handleTaskUpdate}  // Pass callback to modal
        />
      )}

      {showConfirmDelete && (
        <ConfirmModal
          message="Are you sure you want to delete this project?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default ViewProject;
