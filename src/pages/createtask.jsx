import { useEffect, useState } from "react";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { jwtDecode } from "jwt-decode";
import { getProjects } from "../api/projectService";

const CreateTask = () => {
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
    const [error, setError] = useState(""); // State for error messages
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
        setError(""); // Reset error state
        if (!taskData.name || !taskData.description || !taskData.project || !taskData.status || !taskData.priority || !taskData.startDate || !taskData.endDate) {
            setError("Please fill out all required fields.");
            return;
        }
        setLoading(true); // Set loading state to true
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:5000/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(taskData),
            });
            if (response.ok) {
                const data = await response.json();
                // Reset the form fields after successful task creation
                setTaskData({
                    name: "",
                    description: "",
                    project: "",
                    status: "",
                    priority: "",
                    startDate: "",
                    endDate: "",
                });
                alert("Task created successfully!"); // Success message
            } else {
                const errorData = await response.json();
                console.error("Error creating task:", errorData.message);
                alert("Failed to create task: " + errorData.message); // Display error message to user
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Network error: " + error.message); // Display network error message
        } finally {
            setLoading(false); // Reset loading state
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
        <div className="h-screen bg-[#EEEFEF] flex">
            <div className="fixed h-screen">
                <Sidebar username={username} userProjects={projectList} />
            </div>
            <div className="ml-[200px] w-full overflow-y-auto p-6">
                <PageHeader title="Create Task" />
                <form className=" bg--200 w-276 ml-[30px] p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold text-red-900">Task Details</h2>
                    <p className="text-gray-600 mb-4">Provide details for your task</p>
                    {error && <p className="text-red-600">{error}</p>} {/* Display error message */}
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
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Overdue">Overdue</option>
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
                            <input type="date" name="startDate" value={taskData.startDate} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                        </div>
                        <div>
                            <label className="block font-semibold">End Date</label>
                            <input type="date" name="endDate" value={taskData.endDate} onChange={handleChange} className="w-full p-2 border rounded mt-1" />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button type="submit" className="bg-red-900 text-white w-full py-3 rounded">Create Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;
