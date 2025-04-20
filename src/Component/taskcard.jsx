import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { deleteTask } from "../api/taskService";

const TaskCard = ({ task, onClick, onTaskDeleted, token }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            const response = await deleteTask(token, task._id);
            if (response.success) {
                setShowConfirm(false);
                if (onTaskDeleted) {
                    onTaskDeleted(task._id);
                }
            } else {
                alert("Failed to delete task: " + response.message);
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Failed to delete task. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirm(false);
    };

    return (
        <>
            <div
                className="relative bg-[#EAD7E3] p-4 rounded-lg shadow-lg cursor-pointer hover:bg-[#E0C9D9] transition-colors"
                onClick={onClick}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        setShowConfirm(true);
                    }}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800 focus:outline-none"
                    aria-label="Delete Task"
                >
                    {/* Trash icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
                    </svg>
                </button>
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

            {showConfirm && (
                <ConfirmModal
                    message="Are you sure you want to delete this task?"
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    loading={deleting}
                />
            )}
        </>
    );
};

export default TaskCard;
