const TaskCard = ({ task, onClick }) => {

    if (!task) return null; // Prevents errors if task is undefined

    // Define mappings for status and priority colors
    const statusColors = {
        "To Do": "bg-blue-500",
        "Ongoing": "bg-yellow-500",
        "Completed": "bg-green-500",
        "Cancelled": "bg-red-500",
        "Overdue": "bg-black",
    };

    const priorityColors = {
        "Low": "bg-yellow-500",
        "Medium": "bg-orange-500",
        "High": "bg-red-500",
    };

    return (
        <div 
          className="bg-[#EAD7E3] p-4 rounded-lg shadow-lg cursor-pointer hover:bg-[#E0C9D9] transition-colors"
          onClick={onClick}
        >
            <div className="flex justify-between items-center">
                {/* <img src={task.projectImage} alt="Project Logo" className="w-10 h-10" /> */}
                <div className="flex space-x-2">
                    <span className={`${priorityColors[task.priority] || "bg-blue-500"} text-white px-2 py-1 text-xs rounded`}>
                        {task.priority}
                    </span>
                    <span className={`${statusColors[task.status] || "bg-gray-500"} text-white px-2 py-1 text-xs rounded`}>
                        {task.status}
                    </span>
                </div>
            </div>
            <h3 className="text-lg font-bold">{task.name}</h3>
<p className="text-sm text-gray-600">{task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}</p>

            <p className="text-right text-xs text-gray-500"> Due Date: {task.endDate}</p>

            {/* Hidden div to ensure Tailwind includes these classes */}
            <div className="hidden">
                <span className="bg-blue-500 bg-yellow-500 bg-green-500 bg-red-500 bg-black"></span>
            </div>
        </div>
    );
};

export default TaskCard;
