import { useEffect, useState } from "react";
import { getTasks } from "../api/taskService";
import Sidebar from "../Component/sidebar";
import PageHeader from "../Component/pageheader";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getProjects } from "../api/projectService";
import TaskDetailsModal from "../Component/taskdetails";
import ProjectImageOrLetter from "../Component/ProjectImageOrLetter";

const Dashboard = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("Guest");
    const [projectList, setProjectList] = useState([]);
    const [projectsMap, setProjectsMap] = useState({});
    const [projectTaskCounts, setProjectTaskCounts] = useState({});
    const [totalProjects, setTotalProjects] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [latestTasks, setLatestTasks] = useState([]);
    const [ongoingTasks, setOngoingTasks] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);
    const [cancelledTasks, setCancelledTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    const [todoTasks, setTodoTasks] = useState(0);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
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

    const fetchTasks = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await getTasks(token);
            let tasks = [];
            if (Array.isArray(response)) {
                tasks = response;
            } else if (response.data && Array.isArray(response.data)) {
                tasks = response.data;
            } else if (response.tasks && Array.isArray(response.tasks)) {
                tasks = response.tasks;
            }

            // Read recently accessed tasks map from localStorage
            const recentlyAccessedRaw = localStorage.getItem('recentlyAccessedTasks');
            let recentlyAccessed = {};
            if (recentlyAccessedRaw) {
                try {
                    recentlyAccessed = JSON.parse(recentlyAccessedRaw);
                } catch (e) {
                    recentlyAccessed = {};
                }
            }

            // Sort tasks by last accessed time, fallback to createdAt
            const sortedTasks = tasks.sort((a, b) => {
                const aAccess = recentlyAccessed[a._id] || 0;
                const bAccess = recentlyAccessed[b._id] || 0;
                if (aAccess === bAccess) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return bAccess - aAccess;
            });

            setLatestTasks(sortedTasks.slice(0, 5));

            const taskCounts = {};
            tasks.forEach(task => {
                const projectId = task.project?.id || task.project || task.project_id;
                if (projectId) {
                    taskCounts[projectId] = (taskCounts[projectId] || 0) + 1;
                }
            });
            setProjectTaskCounts(taskCounts);
            setTotalTasks(response.totalTasks || tasks.length);
            setOngoingTasks(response.ongoingTasks ||
                tasks.filter(task => task.status?.toLowerCase() === 'ongoing').length);
            setCompletedTasks(response.completedTasks ||
                tasks.filter(task => task.status?.toLowerCase() === 'completed').length);
            setCancelledTasks(response.cancelledTasks ||
                tasks.filter(task => task.status?.toLowerCase() === 'cancelled').length);
            setOverdueTasks(response.overdueTasks ||
                tasks.filter(task => {
                    if (!task.endDate) return false;
                    const endDate = new Date(task.endDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = endDate < today;
                    const isNotCompleted = task.status?.toLowerCase() !== 'completed';
                    const isNotCancelled = task.status?.toLowerCase() !== 'cancelled';
                    return isOverdue && isNotCompleted && isNotCancelled;
                }).length);
            setTodoTasks(response.todoTasks ||
                tasks.filter(task => task.status?.toLowerCase() === 'to do').length);
            setLoadingProgress(100);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching tasks:", error.message);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded && decoded.username) {
                    setUsername(decoded.username);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        }
        const fetchProjects = async () => {
            try {
                const data = await getProjects(token);
                const sortedProjects = data.projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setProjectList(sortedProjects.slice(0, 4));
                setTotalProjects(data.projects.length);
                const projectMap = {};
                data.projects.forEach(project => {
                    projectMap[project._id] = project;
                });
                setProjectsMap(projectMap);
                setLoadingProgress(50);
            } catch (error) {
                console.error("Error fetching projects:", error);
            }
        };
        fetchProjects().then(() => fetchTasks());
        const handleTaskUpdated = () => {
            fetchTasks();
        };
        window.addEventListener('taskUpdated', handleTaskUpdated);
        return () => {
            window.removeEventListener('taskUpdated', handleTaskUpdated);
        };
    }, []);

    const getProjectId = (task) => {
        if (task.project?.id) return task.project.id;
        if (task.projectId) return task.projectId;
        if (task.project && typeof task.project === 'string') return task.project;
        if (task.project?._id) return task.project._id;
        if (task.project_id) return task.project_id;
        return null;
    };

    const getProjectImage = (task) => {
        const projectId = getProjectId(task);
        if (!projectId) return null;
        const project = projectsMap[projectId];
        if (!project) return null;
        if (project.projectImage) {
            if (typeof project.projectImage === 'string') {
                return project.projectImage;
            } else if (project.projectImage.url) {
                return project.projectImage.url;
            }
        }
        return null;
    };

    // Mobile view (< 768px)
    if (windowWidth < 768) {
        return (
            <div className="bg-[#EEEFEF] min-h-screen w-full overflow-y-auto h-screen">
                <div className="fixed bottom-0 left-0 right-0 z-10">
                    <Sidebar username={username} userProjects={projectList} />
                </div>
                <div className="pb-16"> {/* Padding to account for fixed bottom navigation */}
                    <PageHeader />
                    <div className="p-2">
                        {/* Welcome Card */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl mb-4">
                            <h2 className="text-lg font-semibold text-black">Welcome To Quest</h2>
                            <div className="text-2xl font-bold text-black">Hello {username}</div>
                            <div className="flex justify-center mt-2">
                                <img src="/uploads/ififif.png" alt="Welcome Illustration" className="w-40 h-40" />
                            </div>
                        </div>

                        {/* Recent Projects */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-bold text-black">Recent Projects</h3>
                                <Link to="/projects">
                                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">All Projects</button>
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {projectList.length > 0 ? projectList.map((project, index) => (
                                    <div key={index} className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between"
                                        onClick={() => navigate(`/viewproject/${project._id}`)}>
                                        <div className="flex items-center gap-2">
                                            <ProjectImageOrLetter projectName={project.name} projectImage={project.projectImage} size={24} />
                                            <div>
                                                <p className="font-semibold text-black text-sm">{project.name}</p>
                                                <p className="text-xs text-black">
                                                    {projectTaskCounts[project._id] || 0} {(projectTaskCounts[project._id] || 0) === 1 ? 'Task' : 'Tasks'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-md text-black">→</span>
                                    </div>
                                )) : (
                                    <div className="text-center">
                                        <p className="text-black text-sm">No projects available.</p>
                                        <img src="/uploads/Artboard 1 copy 4.png" alt="No projects" className="w-32 h-32 mx-auto mt-2" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid - 2 columns on mobile */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {[
                                { title: "Projects", count: totalProjects },
                                { title: "Tasks", count: totalTasks },
                                { title: "To Do", count: todoTasks },
                                { title: "Ongoing", count: ongoingTasks },
                                { title: "Completed", count: completedTasks },
                                { title: "Cancelled", count: cancelledTasks },
                                { title: "Overdue", count: overdueTasks },
                            ].map((item, index) => (
                                <div key={index} className="bg-[#D8BEC6] p-3 rounded-2xl">
                                    <p className="text-xs text-black">{item.title}</p>
                                    <p className="text-xl font-bold text-black">
                                        {item.count !== undefined ? item.count : "..."}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Tasks */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-bold text-black">Recent Tasks</h3>
                                <Link to="/mytasks">
                                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">All Tasks</button>
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {(latestTasks || []).length > 0 ? latestTasks.map((task, index) => {
                                    const projectId = getProjectId(task);
                                    const project = projectId ? projectsMap[projectId] : null;
                                    return (
                                    <div
                                        key={index}
                                        className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between"
                                        onClick={() => {
                                            const recentlyAccessedRaw = localStorage.getItem('recentlyAccessedTasks');
                                            let recentlyAccessed = {};
                                            if (recentlyAccessedRaw) {
                                                try {
                                                    recentlyAccessed = JSON.parse(recentlyAccessedRaw);
                                                } catch (e) {
                                                    recentlyAccessed = {};
                                                }
                                            }
                                            recentlyAccessed[task._id] = Date.now();
                                            localStorage.setItem('recentlyAccessedTasks', JSON.stringify(recentlyAccessed));
                                            setSelectedTask(task);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="text-sm font-bold text-black">{task.name}</p>
                                                {project && (
                                                    <p className="text-xs text-gray-700">{project.name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-md text-black">→</span>
                                    </div>
                                    );
                                }) : (
                                    <p className="text-black text-sm">No tasks available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {selectedTask && (
                    <TaskDetailsModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onTaskUpdate={() => setSelectedTask(null)}
                    />
                )}

                {loading && (
                    <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
                        <div className="w-48 h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                        <p className="text-sm">Loading Dashboard</p>
                        <div className="text-black text-md font-semibold">{loadingProgress}%</div>
                    </div>
                )}
            </div>
        );
    }

    // Tablet portrait view (768px - 1024px)
    if (windowWidth >= 768 && windowWidth < 1024) {
        return (
            <div className="h-screen bg-[#EEEFEF] flex">
                <div className="fixed h-screen">
                    <Sidebar username={username} userProjects={projectList} />
                </div>
                <div className="ml-16 w-full overflow-y-auto">
                    <PageHeader />
                    <div className="p-4 min-h-screen">
                        {/* Top Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                            {/* Welcome Card */}
                            <div className="bg-[#D8BEC6] p-4 rounded-2xl col-span-2">
                                <h2 className="text-lg font-semibold text-black">Welcome To Quest</h2>
                                <div className="text-3xl font-bold text-black">Hello {username}</div>
                                <div className="flex justify-end">
                                    <img src="/uploads/ififif.png" alt="Welcome Illustration" className="w-48 h-48" />
                                </div>
                            </div>

                            {/* Recent Projects */}
                            <div className="bg-[#D8BEC6] p-4 rounded-2xl">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-md font-bold text-black">Recent Projects</h3>
                                    <Link to="/projects">
                                        <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">All Projects</button>
                                    </Link>
                                </div>
                                <div className="space-y-2">
                                    {projectList.length > 0 ? projectList.map((project, index) => (
                                        <div key={index} className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between"
                                            onClick={() => navigate(`/viewproject/${project._id}`)}>
                                            <div className="flex items-center gap-2">
                                                <ProjectImageOrLetter projectName={project.name} projectImage={project.projectImage} size={24} />
                                                <div>
                                                    <p className="font-semibold text-black text-sm">{project.name}</p>
                                                    <p className="text-xs text-black">
                                                        {projectTaskCounts[project._id] || 0} {(projectTaskCounts[project._id] || 0) === 1 ? 'Task' : 'Tasks'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-md text-black">→</span>
                                        </div>
                                    )) : (
                                        <div className="text-center">
                                            <p className="text-black text-sm">No projects available.</p>
                                            <img src="/uploads/Artboard 1 copy 4.png" alt="No projects" className="w-32 h-32 mx-auto mt-2" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid - 4 columns on tablet */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[
                                { title: "Projects", count: totalProjects },
                                { title: "Tasks", count: totalTasks },
                                { title: "To Do", count: todoTasks },
                                { title: "Ongoing", count: ongoingTasks },
                                { title: "Completed", count: completedTasks },
                                { title: "Cancelled", count: cancelledTasks },
                                { title: "Overdue", count: overdueTasks },
                            ].map((item, index) => (
                                <div key={index} className="bg-[#D8BEC6] p-3 rounded-2xl">
                                    <p className="text-xs text-black">{item.title}</p>
                                    <p className="text-xl font-bold text-black">
                                        {item.count !== undefined ? item.count : "..."}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Tasks */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-md font-bold text-black">Recent Tasks</h3>
                                <Link to="/mytasks">
                                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">All Tasks</button>
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {(latestTasks || []).length > 0 ? latestTasks.map((task, index) => {
                                    const projectId = getProjectId(task);
                                    const project = projectId ? projectsMap[projectId] : null;
                                    return (
                                        <div
                                            key={index}
                                            className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between"
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-sm font-bold text-black">{task.name}</p>
                                                    {project && (
                                                        <p className="text-xs text-gray-700">{project.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-md text-black">→</span>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-black text-sm">No tasks available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {selectedTask && (
                    <TaskDetailsModal
                        task={selectedTask}
                        onClose={() => setSelectedTask(null)}
                        onTaskUpdate={() => setSelectedTask(null)}
                    />
                )}

                {loading && (
                    <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
                        <div className="w-64 h-3 bg-gray-300 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                        <p className="text-sm">Loading Dashboard</p>
                        <div className="text-black text-md font-semibold">{loadingProgress}%</div>
                    </div>
                )}
            </div>
        );
    }

    // Laptop/Desktop view (≥ 1024px)
    return (
        <div className="h-screen  flex">
            <div className="fixed h-screen">
                <Sidebar username={username} userProjects={projectList} />
            </div>
            {/* Main Content Area */}
            <div className="overflow-y-auto bg-[#EEEFEF]" style={{ width: 'calc(100% - 16rem)', marginLeft: '16rem' }}>
                <PageHeader />
                <div className="p-6 min-h-screen">
                    {/* Top Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Welcome Card */}
                        <div className="bg-[#D8BEC6] p-6 rounded-2xl col-span-2 flex flex-col justify-between h-80">
                            <h2 className="text-lg font-semibold text-black">Welcome To Quest</h2>
                            <div className="text-[40px] font-bold text-black">Hello {username}</div>
                            <img src="/uploads/ififif.png" alt="Welcome Illustration" className="w-60 h-60 self-end" />
                        </div>

                        {/* Recent Projects */}
                        <div className="bg-[#D8BEC6] p-4 rounded-2xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-black">Recent Projects</h3>
                                <Link to="/projects">
                                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg">All Projects</button>
                                </Link>
                            </div>
                            <div className="mt-4 space-y-3">
                                {projectList.length > 0 ? projectList.map((project, index) => (
                                    <div key={index} className="bg-[#E0ADBD] p-2 rounded-lg flex items-center justify-between cursor-pointer"
                                        onClick={() => navigate(`/viewproject/${project._id}`)}>
                                        <div className="flex items-center gap-2">
                                            <ProjectImageOrLetter projectName={project.name} projectImage={project.projectImage} size={30} />
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
                                        <img src="/uploads/Artboard 1 copy 4.png" alt="No projects" className="w-40 h-40 mx-auto mt-2" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - 7 columns on desktop */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
                    {[
                        { title: "Total Projects", count: totalProjects },
                        { title: "Total Tasks", count: totalTasks },
                        { title: "To Do", count: todoTasks },
                        { title: "Ongoing", count: ongoingTasks },
                        { title: "Completed", count: completedTasks },
                        { title: "Cancelled", count: cancelledTasks },
                        { title: "Overdue", count: overdueTasks },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="bg-[#D8BEC6] p-4 rounded-2xl text-left cursor-pointer hover:bg-[#c9aeb7]"
                            onClick={() => {
                                // Only navigate with filter for task statuses, not total projects/tasks
                                const filterableStatuses = ["to do", "ongoing", "completed", "cancelled", "overdue"];
                                const filter = item.title.toLowerCase();
                                if (filterableStatuses.includes(filter)) {
                                    navigate(`/mytasks?filter=${filter}`);
                                }
                            }}
                        >
                            <p className="text-sm text-black">{item.title}</p>
                            <p className="text-2xl font-bold text-black">
                                {item.count !== undefined ? item.count : "Loading..."}
                            </p>
                        </div>
                    ))}
                    </div>

                    {/* Recent Tasks */}
                    <div className="bg-[#D8BEC6] p-6 rounded-2xl mt-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-black">Recent Tasks</h3>
                            <Link to="/mytasks">
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg">All Tasks</button>
                            </Link>
                        </div>
                        <div className="mt-4 space-y-3">
                            {(latestTasks || []).length > 0 ? latestTasks.map((task, index) => {
                                const projectId = getProjectId(task);
                                const project = projectId ? projectsMap[projectId] : null;
                                return (
                                    <div
                                        key={index}
                                        className="bg-[#E0ADBD] p-3 rounded-lg flex items-center justify-between cursor-pointer"
                                        onClick={() => {
                                            const recentlyAccessedRaw = localStorage.getItem('recentlyAccessedTasks');
                                            let recentlyAccessed = {};
                                            if (recentlyAccessedRaw) {
                                                try {
                                                    recentlyAccessed = JSON.parse(recentlyAccessedRaw);
                                                } catch (e) {
                                                    recentlyAccessed = {};
                                                }
                                            }
                                            recentlyAccessed[task._id] = Date.now();
                                            localStorage.setItem('recentlyAccessedTasks', JSON.stringify(recentlyAccessed));
                                            setSelectedTask(task);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
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

            {selectedTask && (
                <TaskDetailsModal
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onTaskUpdate={() => setSelectedTask(null)}
                />
            )}

            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-30 flex flex-col items-center justify-center z-50">
                    <div className="w-64 h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
                    </div>
                    <p>Loading Dashboard</p>
                    <div className="text-black text-lg font-semibold">{loadingProgress}%</div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;