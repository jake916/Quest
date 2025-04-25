import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTask, updateTask } from "../api/taskService";
import { getProjects } from "../api/projectService";
import PageHeader from "../Component/pageheader";
import Sidebar from "../Component/sidebar";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const EditTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    name: "",
    description: "",
    project: "",
    _project: null
  });
  const [username, setUsername] = useState("Guest");
  const [projectList, setProjectList] = useState([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Load projects first
        const projectsRes = await getProjects(token);
        let projects = projectsRes.projects;
        setLoadingProgress(50);
        
        // Then load task
        const taskRes = await getTask(token, taskId);
        setLoadingProgress(100);
        
        // Normalize project IDs for comparison
        const normalizeId = (id) => String(id).trim().toLowerCase();
        
        // Ensure we have a clean project ID string for comparison
        const currentProjectId = taskRes.task.project?._id?.toString();
        
        // Find the matching project in the list
        const currentProject = currentProjectId 
          ? projects.find(p => p._id.toString() === currentProjectId)
          : null;

        // If project exists but not in list, add it
        const updatedProjects = currentProjectId && !currentProject
          ? [...projects, taskRes.task.project]
          : projects;

        setProjectList(updatedProjects);

        setTaskData({
          name: taskRes.task.name,
          description: taskRes.task.description,
          project: currentProjectId || "",
          _project: currentProject || taskRes.task.project || null
        });

      } catch (error) {
        toast.error("Failed to load task details");
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem("token");
      const result = await updateTask(token, taskId, {
        name: taskData.name,
        description: taskData.description,
        project: {
          id: taskData.project,
          name: taskData._project.name
        }
      });

      if (result.success) {
        toast.success("Task updated successfully!");
        window.dispatchEvent(new Event('taskUpdated'));
        navigate(-1);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to update task");
      console.error("Error updating task:", error);
    } finally {
      setIsSaving(false);
    }
  };

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

  // Mobile view (< 768px)
  if (windowWidth < 768) {
    return (
      <div className="bg-[#EEEFEF] min-h-screen">
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-10">
          <Sidebar username={username} userProjects={projectList} />
        </div>
        
        {/* Main content with padding for bottom nav */}
      <div className=" pb-16">
          <PageHeader title="Edit Task" />
          
          <form onSubmit={handleSubmit} className="bg-white mt-9 p-4 mx-4 rounded-lg shadow-md">
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-sm">Task Name</label>
              <input
                type="text"
                value={taskData.name}
                onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2 text-sm">Description</label>
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                className="w-full p-2 border rounded text-sm"
                rows="3"
              />
            </div>

            <div className="mb-4">
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-sm mb-1">Current Project</h3>
                <div className="text-gray-700 text-sm">
                  {taskData._project ? (
                    <p className="font-medium">{taskData._project.name}</p>
                  ) : (
                    <p className="text-gray-500">No project assigned</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-sm">Assign to New Project</label>
                <select
                  value={taskData.project || ""}
                  onChange={(e) => {
                    const selectedProject = projectList.find(p => p._id === e.target.value);
                    setTaskData(prev => ({
                      ...prev,
                      project: e.target.value,
                      _project: selectedProject || null
                    }));
                  }}
                  className="w-full p-2 border rounded bg-white text-sm"
                >
                  <option value="">-- Select a project --</option>
                  {projectList.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#6c0017] text-white px-3 py-1 rounded text-sm hover:bg-[#8a001f] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
            <div className="w-48 h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-red-500" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="text-sm">Loading Task</p>
            <div className="text-black text-sm font-semibold">{loadingProgress}%</div>
          </div>
        )}
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

        <div className=" mr-5 ml-16 w-full overflow-y-auto p-4">
          <PageHeader title="Edit Task" />
          
          <form onSubmit={handleSubmit} className="bg-white mt-8 p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <div className="mb-4">
              <label className="block font-semibold mb-2">Task Name</label>
              <input
                type="text"
                value={taskData.name}
                onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2">Description</label>
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows="4"
              />
            </div>

            <div className="mb-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Current Project</h3>
                <div className="text-gray-700">
                  {taskData._project ? (
                    <p className="font-medium">{taskData._project.name}</p>
                  ) : (
                    <p className="text-gray-500">No project assigned</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold">Assign to New Project</label>
                <select
                  value={taskData.project || ""}
                  onChange={(e) => {
                    const selectedProject = projectList.find(p => p._id === e.target.value);
                    setTaskData(prev => ({
                      ...prev,
                      project: e.target.value,
                      _project: selectedProject || null
                    }));
                  }}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option value="">-- Select a project --</option>
                  {projectList.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#6c0017] text-white px-4 py-2 rounded hover:bg-[#8a001f] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
            <div className="w-56 h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-red-500" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="text-sm">Loading Task</p>
            <div className="text-black text-sm font-semibold">{loadingProgress}%</div>
          </div>
        )}
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
        <PageHeader title="Edit Task" />
        
        <form onSubmit={handleSubmit} className="bg-white w-full max-w-3xl mx-auto p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <label className="block font-semibold text-lg mb-3">Task Name</label>
            <input
              type="text"
              value={taskData.name}
              onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold text-lg mb-3">Description</label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="5"
            />
          </div>

          <div className="mb-8">
            <div className="mb-6 p-5 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Current Project</h3>
              <div className="text-gray-700">
                {taskData._project ? (
                  <p className="font-medium text-lg">{taskData._project.name}</p>
                ) : (
                  <p className="text-gray-500">No project assigned</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block font-semibold text-lg">Assign to New Project</label>
              <select
                value={taskData.project || ""}
                onChange={(e) => {
                  const selectedProject = projectList.find(p => p._id === e.target.value);
                  setTaskData(prev => ({
                    ...prev,
                    project: e.target.value,
                    _project: selectedProject || null
                  }));
                }}
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a project --</option>
                {projectList.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-5 py-2.5 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#6c0017] text-white px-5 py-2.5 rounded-lg hover:bg-[#8a001f] disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
          <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <p>Loading Task Details</p>
          <div className="text-black text-lg font-semibold">{loadingProgress}%</div>
        </div>
      )}
    </div>
  );
};

export default EditTask;