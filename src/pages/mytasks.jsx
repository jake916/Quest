import { useEffect, useState } from "react";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import TaskCard from "../Component/taskcard";
import { jwtDecode } from "jwt-decode";
import { getTasks } from "../api/taskService";

const MyTasks = () => {
    const [filter, setFilter] = useState("All");
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState("Guest");

    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await getTasks(token);
                    console.log("API response in MyTasks:", response);
                    
                    // Handle different response structures
                    let tasksArray = [];
                    if (Array.isArray(response)) {
                        tasksArray = response;
                    } else if (response.tasks && Array.isArray(response.tasks)) {
                        tasksArray = response.tasks;
                    }
                    
                    setTasks(tasksArray);
                } catch (error) {
                    console.error("Error fetching tasks:", error);
                }
            }
        };

        fetchTasks();
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

    // Ensure filteredTasks is always an array before using .map()
    const filteredTasks = Array.isArray(tasks) ? 
        (filter === "All" ? tasks : tasks.filter(task => normalizeStatus(task.status) === normalizeStatus(filter)))
        : [];

    return (
        <div className="h-screen bg-[#EEEFEF] flex">
            <div className="fixed h-screen">
                <Sidebar username={username} />
            </div>

            <div className="ml-[200px] w-290 overflow-y-auto h-screen p-5">
                <PageHeader />

                <div className="flex gap-4 ml-14 mt-5">
                    {['All', 'To Do', 'Ongoing', 'Cancelled', 'Completed', 'Overdue'].map((status) => (
                        <button
                            key={status}
                            className={`px-4 py-2 rounded text-white 
                                ${status === 'All' ? 'bg-gray-500' :
                                    status === 'To Do' ? 'bg-yellow-500' :
                                    status === 'Ongoing' ? 'bg-blue-500' :
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

                <div className="grid grid-cols-3 gap-4 ml-14 mt-5">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskCard key={task._id} task={task} />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10">
                            <p className="text-lg text-gray-500">No tasks found for this filter</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;