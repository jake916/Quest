import { useEffect, useState } from "react";
import { getTasks } from "../api/taskService";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getProjects } from "../api/projectService";

// Dashboard Component
const Dashboard = () => {
    const [username, setUsername] = useState("Guest");
    const [projectList, setProjectList] = useState([]);
    const [projectsMap, setProjectsMap] = useState({});  // Map to store project data by ID
    const [projectTaskCounts, setProjectTaskCounts] = useState({}); // Map to store task counts per project
    const [totalTasks, setTotalTasks] = useState(0);
    const [latestTasks, setLatestTasks] = useState([]);
    const [ongoingTasks, setOngoingTasks] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    const [todoTasks, setTodoTasks] = useState(0);

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

    const fetchTasks = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await getTasks(token);
            console.log("Raw task response:", JSON.stringify(response, null, 2));
            
            let tasks = [];
            
            // Handle different possible API response structures
            if (Array.isArray(response)) {
                tasks = response;
            } else if (response.data && Array.isArray(response.data)) {
                tasks = response.data;
            } else if (response.tasks && Array.isArray(response.tasks)) {
                tasks = response.tasks;
            }
            
            // Sort tasks by creation date (newest first) and take only 5
            const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLatestTasks(sortedTasks.slice(0, 5));
            
            // Count tasks per project
            const taskCounts = {};
            tasks.forEach(task => {
                const projectId = task.project?.id || task.project || task.project_id;
                if (projectId) {
                    taskCounts[projectId] = (taskCounts[projectId] || 0) + 1;
                }
            });
            setProjectTaskCounts(taskCounts);
            
            // Handle task counters from API response
            setTotalTasks(response.totalTasks || tasks.length);
            setOngoingTasks(response.ongoingTasks || 
                tasks.filter(task => task.status?.toLowerCase() === 'ongoing').length);
            setCompletedTasks(response.completedTasks || 
                tasks.filter(task => task.status?.toLowerCase() === 'completed').length);
            setOverdueTasks(response.overdueTasks || 
                tasks.filter(task => {
                    if (!task.endDate) return false;
                    
                    const endDate = new Date(task.endDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Compare dates without time
                    
                    const isOverdue = endDate < today;
                    const isNotCompleted = task.status?.toLowerCase() !== 'completed';
                    const isNotCancelled = task.status?.toLowerCase() !== 'cancelled';
                    
                    return isOverdue && isNotCompleted && isNotCancelled;
                }).length);
            
            setTodoTasks(response.todoTasks || 
                tasks.filter(task => task.status?.toLowerCase() === 'to do').length);
        } catch (error) {
            console.error("Error fetching tasks:", error.message);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        const fetchProjects = async () => {
            try {
                const data = await getProjects(token);
                console.log("Projects API response:", JSON.stringify(data, null, 2));
                const sortedProjects = data.projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                console.log("Project images:", sortedProjects.map(p => ({
                    name: p.name,
                    image: p.projectImage,
                    type: typeof p.projectImage
                })));
                
                // Store 4 most recent projects for sidebar
                setProjectList(sortedProjects.slice(0, 4));
                
                // Create a map of all projects for quick lookup by project ID
                const projectMap = {};
                data.projects.forEach(project => {
                    projectMap[project._id] = project;
                });
                setProjectsMap(projectMap);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };

        // First fetch projects, then fetch tasks
        fetchProjects().then(() => fetchTasks());

        // Add event listener for task updates
        const handleTaskUpdated = () => {
            console.log('Task updated event received - refreshing dashboard tasks');
            fetchTasks();
        };

        window.addEventListener('taskUpdated', handleTaskUpdated);
        
        // Clean up event listener
        return () => {
            window.removeEventListener('taskUpdated', handleTaskUpdated);
        };
    }, []);

    // Function to determine the project field name in task object
    const getProjectId = (task) => {
        // Check nested project.id first (matches API response structure)
        if (task.project?.id) return task.project.id;
        // Then check other common patterns
        if (task.projectId) return task.projectId;
        if (task.project && typeof task.project === 'string') return task.project;
        if (task.project?._id) return task.project._id;
        if (task.project_id) return task.project_id;
        console.warn("No project ID found in task:", task);
        return null;
    };

    // Function to get project image URL
    const getProjectImage = (task) => {
        const projectId = getProjectId(task);
        if (!projectId) return null;
        
        const project = projectsMap[projectId];
        if (!project) return null;
        
        // Handle different project image formats
        if (project.projectImage) {
            if (typeof project.projectImage === 'string') {
                // If it's already a URL/path, return it
                return project.projectImage;
            } else if (project.projectImage.url) {
                // If it's an object with url property
                return project.projectImage.url;
            }
        }
        return null;
    };

    return (
        <div className="h-screen bg-[#EEEFEF] w-337">
            {/* Sidebar */}
            <div className="fixed h-screen">
                <Sidebar username={username} userProjects={projectList} />
            </div>

            {/* Main Content Area */}
            <div className="ml-[200px] w-290 overflow-y-auto h-screen">
                <PageHeader />
                <div className="p-6 min-h-screen pl-20 ">
                    {/* Top Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-200 ">
                        {/* Welcome Card */}
                        <div className="bg-[#D8BEC6] p-6 rounded-2xl col-span-1 md:col-span-2 flex flex-col justify-between w-130 h-80">
                            <h2 className="text-lg font-semibold text-black">Welcome To Quest</h2>
                            <div className="text-[40px] font-bold text-black">Hello {username}</div>
                            <img src="src/assets/ififif.png" alt="Welcome Illustration" className="w-60 h-60 mt-7 ml-50" />
                        </div>

                        {/* Projects Section */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl w-130 ">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-black">Projects</h3>
                            </div>
                            <div className="mt-4 space-y-3">
                                {projectList.length > 0 ? projectList.map((project, index) => (
                                    <div key={index} className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={project.projectImage} alt={project.name} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-black">{project.name}</p>
                                                <p className="text-sm text-black">
                                                    {projectTaskCounts[project._id] || 0} {(projectTaskCounts[project._id] || 0) === 1 ? 'Task' : 'Tasks'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-lg text-black">→</span>
                                    </div>
                                )) : (
                                    <div>
                                        <p className="text-black">No projects available.</p>
                                        <img src="src\assets\Artboard 1 copy 4.png" alt="Welcome Illustration" className="w-50 h-50 mt-4 ml-50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Task Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6 w-264">
                        {[
                            { title: "Total Tasks", count: totalTasks },
                            { title: "To Do", count: todoTasks },
                            { title: "Ongoing", count: ongoingTasks },
                            { title: "Completed", count: completedTasks },
                            { title: "Overdue", count: overdueTasks },
                        ].map((item, index) => (
                            <div key={index} className="bg-[#D8BEC6] p-4 rounded-2xl text-left">
                                <p className="text-sm text-black">{item.title}</p>
                                <p className="text-2xl font-bold text-black">
                                    {item.count !== undefined ? item.count : "Loading..."}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* My Tasks Section */}
                    <div className="bg-[#D8BEC6] p-6 rounded-2xl mt-6 w-264">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-black">My Tasks</h3>
                            <Link to="/mytasks">
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg">All Tasks</button>
                            </Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {(latestTasks || []).length > 0 ? latestTasks.map((task, index) => {
                                const projectId = getProjectId(task);
                                console.log("Task project ID:", projectId, "for task:", task.name);
                                const projectImg = getProjectImage(task);
                                console.log("Project image URL:", projectImg);
                                const project = projectId ? projectsMap[projectId] : null;
                                console.log("Found project:", project?.name);
                                
                                return (
                                    <div key={index} className="bg-[#E0ADBD] p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {projectImg ? (
                                                <img 
                                                    src={projectImg.includes('cloudinary') ? 
                                                        projectImg.replace('/upload/', '/upload/w_100,h_100,c_fill/') : 
                                                        projectImg} 
                                                    alt={project?.name || "Project"} 
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "/assets/placeholder.png";
                                                    }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                    <span className="text-xs text-gray-600">No img</span>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-black">{task.name}</p>
                                                {project && (
                                                    <p className="text-xs text-gray-700">{project.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-lg text-black">→</span>
                                    </div>
                                );
                            }) : (
                                <p className="text-black">No tasks available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;