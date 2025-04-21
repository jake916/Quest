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
    _project: null // Store full project object
  });
  const [username, setUsername] = useState("Guest");
  const [projectList, setProjectList] = useState([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

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
          id: taskData.project, // Project ID
          name: taskData._project.name // Project name from the full project object
        }
      });

      if (result.success) {
        toast.success("Task updated successfully!");
        window.dispatchEvent(new Event('taskUpdated'));
        navigate(-1); // Go back to previous page
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

  return (
    <>
      <div className="h-screen bg-[#EEEFEF] flex">
        <div className="fixed h-screen">
          <Sidebar username={username} userProjects={projectList} />
        </div>
        {/* Main section Area */}
        <div className="ml-[200px] w-300 overflow-y-auto p-6">
          <PageHeader title="Edit Task" />

          <form onSubmit={handleSubmit} className="bg--200 w-276 ml-[30px] p-6 rounded-lg shadow-md">
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
                <h3 className="font-semibold text-lg mb-2">Current Project</h3>
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
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-[#6c0017] text-white px-4 py-2 rounded-lg hover:bg-[#8a001f] disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
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
    </>
  );
};

export default EditTask;
