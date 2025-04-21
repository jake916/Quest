import { useEffect, useState, useRef } from "react";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import TaskCard from "../Component/taskcard";
import TaskDetailsModal from "../Component/taskdetails";
import { jwtDecode } from "jwt-decode";
import { getTasks } from "../api/taskService";

const MyTasks = () => {
    const [filter, setFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");
    const [sortOption, setSortOption] = useState("None");
    const [searchQuery, setSearchQuery] = useState("");
    const [tasks, setTasks] = useState([]);
    const [username, setUsername] = useState("Guest");
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);

    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);

    const [sortOpen, setSortOpen] = useState(false);

    const filtersRef = useRef(null);
    const sortRef = useRef(null);

    const fetchTasks = async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            const response = await getTasks(token);
            
            if (!response.success) {
              setError(response.message);
              setTasks([]);
              return;
            }
      
            const tasksArray = Array.isArray(response.data) ? response.data : [];
           
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
    };

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

    useEffect(() => {
        fetchTasks();
        
        const handleTaskUpdated = () => {
            fetchTasks();
        };

        window.addEventListener('taskUpdated', handleTaskUpdated);
        
        return () => {
            window.removeEventListener('taskUpdated', handleTaskUpdated);
        };
    }, [token]);
    
    useEffect(() => {
        let interval = null;
        if (loading && loadingProgress < 100) {
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
        } else if (!loading) {
            setLoadingProgress(100);
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [loading, loadingProgress]);

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

    const handleTaskDeleted = (deletedTaskId) => {
        fetchTasks();
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
                <Sidebar username={username} />
            </div>

            <div className="ml-[200px] w-290 overflow-y-auto h-screen p-5">
                <PageHeader searchQuery={searchQuery} onSearchChange={(e) => setSearchQuery(e.target.value)} />

                <div className="flex gap-4 ml-14 mt-5">
                    <div className="relative" ref={filtersRef}>
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
                    </div>

                    <div className="relative" ref={sortRef}>
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
                    ) : sortedTasks.length > 0 ? (
                        sortedTasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onClick={() => setSelectedTask(task)}
                                token={token}
                                onTaskDeleted={handleTaskDeleted}
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
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
                    <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                    </div>
                    <p>Loading Your Tasks</p>
                    <div className="text-black text-lg font-semibold">{loadingProgress}%</div>
                </div>
            )}
        </div>
    );
};

export default MyTasks;
