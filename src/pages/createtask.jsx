import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import { getProjects } from "../api/projectService";
import { createTask } from "../api/taskService";
const CreateTask = () => {
  const navigate = useNavigate();
    const [username, setUsername] = useState("Guest");
    const [projectList, setProjectList] = useState([]);
    const token = localStorage.getItem("token");
    const [taskData, setTaskData] = useState({
        name: "",
        description: "",
        project: "",
        status: "",
        priority: "",
        startDate: "",
        endDate: "",
    });
    const [loading, setLoading] = useState(false); // State for loading

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData({ ...taskData, [name]: value });
    };

    const handleFileChange = (e) => {
        setTaskData({ ...taskData, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { success, message } = await createTask(token, taskData);
            if (success) {
                setTaskData({
                    name: "",
                    description: "",
                    project: "",
                    status: "",
                    priority: "",
                    startDate: "",
                    endDate: "",
                });
                toast.success(message || "Task created successfully!");
                navigate("/mytasks");
            } else {
                toast.error(message || "Failed to create task");
            }
        } catch (error) {
            toast.error(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const location = useLocation();
    useEffect(() => {
        if (location.state && location.state.preselectedProject) {
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
        const token = localStorage.getItem("token");
        const fetchProjects = async () => {
            try {
                const data = await getProjects(token);
                setProjectList(data.projects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        fetchProjects();
    }, []);

    return (
        <>
            <ToastContainer />
            <div className="h-screen bg-[#EEEFEF] flex">
            <div className="fixed h-screen">
                <Sidebar username={username} userProjects={projectList} />
            </div>
            <div className="ml-[200px] w-full overflow-y-auto p-6">
                <PageHeader title="Create Task" />
                <form className=" bg--200 w-276 ml-[30px] p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold text-red-900">Task Details</h2>
                    <p className="text-gray-600 mb-4">Provide details for your task</p>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block font-semibold">Name of Task</label>
                            <input type="text" name="name" value={taskData.name} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="block font-semibold">Description</label>
                            <textarea name="description" value={taskData.description} onChange={handleChange} className="w-full p-2 border rounded mt-1"></textarea>
                        </div>
                        <div>
                            <label className="block font-semibold">Add Task to a Project</label>
                            <select name="project" value={taskData.project} onChange={handleChange} className="w-full p-2 border rounded mt-1">
                                <option value="">Select a Project</option>
                                {projectList.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-4">
                        <div>
                            <label className="block font-semibold">Status</label>
                            <select name="status" value={taskData.status} onChange={handleChange} className="w-full p-2 border rounded mt-1">
                                <option value="">Select Status</option>
                                <option value="To Do">TO-DO</option>
                                <option value="Ongoing">Ongoing</option>
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold">Priority</label>
                            <select name="priority" value={taskData.priority} onChange={handleChange} className="w-full p-2 border rounded mt-1">
                                <option value="">Select Priority</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-4">
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
                    <div className="mt-6">
                        <button type="submit" className="bg-red-900 text-white w-full py-3 rounded">Create Task</button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
};

export default CreateTask;
