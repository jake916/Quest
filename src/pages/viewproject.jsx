import React, { useEffect, useState, useCallback } from 'react';
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
  const [token, setToken] = useState(null);
  const [filter, setFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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

  const filteredTasks = Array.isArray(tasks) ?
    (filter === "All" ? tasks : tasks.filter(task => normalizeStatus(task.status) === normalizeStatus(filter)))
    : [];

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

  return (
    <div className="h-screen bg-[#EEEFEF] flex">
      <div className="fixed h-screen">
        <Sidebar username={username} />  {/* Pass username to Sidebar */}
      </div>

      {/* Main Content Area */}
      <div className="ml-[200px] w-290 overflow-y-auto h-screen p-5">
        <PageHeader projectId={project?._id} />
        <div className="mt-[30px] ml-[75px]">
          {loadingProject ? (
            <p>Loading project details...</p>
          ) : project ? (
            <>
              <h2 className="font-bold text-xl mb-4">Name of Project: {project.name}</h2>
              <p className="mb-8"> Project Description: {project.description}</p>


              <div className="flex gap-4 mb-4 ">
                {['All', 'To Do', 'Ongoing', 'Cancelled', 'Completed', 'Overdue'].map((status) => (
                  <button
                    key={status}
                    className={`px-4 py-2 rounded text-white 
                      ${status === 'All' ? 'bg-[#800020]' :
                        status === 'To Do' ? 'bg-blue-500' :
                          status === 'Ongoing' ? 'bg-yellow-500' :
                            status === 'Cancelled' ? 'bg-red-500' :
                              status === 'Completed' ? 'bg-green-500' :
                                status === 'Overdue' ? 'bg-black' :
                                  'bg-gray-300'}
                      ${filter === status ? ' ring-2 ring-offset-2 ring-gray-800' : ''}`}
                    onClick={() => setFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <div className='flex '>
                <h2 className="font-bold text-xl mt-4 mb-4">Task List</h2>
                <button
                  onClick={handleAddTaskClick}
                  className="mb-6 px-4 py-2 bg-grey ml-200 text-[#7E0020] rounded hover:bg-[#5a0017]"
                >
                  Add Task
                </button>
              </div>
              
              {loadingTasks ? (
                <p>Loading tasks...</p>
              ) : filteredTasks && filteredTasks.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {filteredTasks.slice(0, 9).map(task => (
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
