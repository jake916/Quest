import { useEffect, useState } from "react";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import TaskCard from "../Component/taskcard";
import TaskDetailsModal from "../Component/taskdetails";
import { jwtDecode } from "jwt-decode";
import { getTasks } from "../api/taskService";

const MyTasks = () => {
    const [filter, setFilter] = useState("All");
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState("Guest");
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            setLoading(true);
            setError(null);
            const response = await getTasks(token);
            console.log("API response:", response);
            
            if (!response.success) {
              setError(response.message);
              setTasks([]);
              return;
            }
      
            const tasksArray = Array.isArray(response.data) ? response.data : [];
            console.log("Tasks stats:", response.stats);
      
            const normalizedTasks = tasksArray.map(task => ({
              ...task,
              _id: task._id?.toString() || Date.now().toString(),
              subtasks: task.subtasks || [],
              user: {
                id: task.user?.id?.toString() || '',
                name: task.user?.name || 'Unknown'
              },
              project: {
                id: task.project?.id?.toString() || '',
                name: task.project?.name || 'No Project'
              },
              status: task.status || 'To Do',
              priority: task.priority || 'Medium',
              startDate: task.startDate ? new Date(task.startDate).toLocaleDateString() : 'Not set',
              endDate: task.endDate ? new Date(task.endDate).toLocaleDateString() : 'Not set'
            }));
      
            setTasks(normalizedTasks);
          } catch (error) {
            console.error("Task fetch error:", error);
            setError(error.message || "Failed to load tasks");
            setTasks([]);
          } finally {
            setLoading(false);
          }
        }
    };

    useEffect(() => {
        fetchTasks();
        
        // Add event listener for task updates
        const handleTaskUpdated = () => {
            console.log('Task updated event received - refreshing tasks');
            fetchTasks();
        };

        window.addEventListener('taskUpdated', handleTaskUpdated);
        
        // Clean up event listener
        return () => {
            window.removeEventListener('taskUpdated', handleTaskUpdated);
        };
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
                                ${status === 'All' ? 'bg-[#800020]' :
                                    status === 'To Do' ? 'bg-blue-500' :
                                        status === 'Ongoing' ?  'bg-yellow-500' :
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
                    {loading ? (
                        <div className="col-span-3 text-center py-10">
                            <p className="text-lg text-gray-500">Loading tasks...</p>
                        </div>
                    ) : error ? (
                        <div className="col-span-3 text-center py-10">
                            <p className="text-lg text-red-500">{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-2 px-4 py-2 bg-[#6c0017] text-white rounded"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                            />
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10">
                            <p className="text-lg text-gray-500">No tasks found for this filter</p>
                        </div>
                    )}
                </div>
                {selectedTask && (
                    <TaskDetailsModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default MyTasks;