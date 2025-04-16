import { useState } from "react";
import { updateTask } from "../api/taskService";
import { X, Trash2, Plus } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";

const TaskDetailsModal = ({ task, onClose, onTaskUpdate }) => {
  const [subtasks, setSubtasks] = useState(
    task.subtasks?.map(subtask => ({
      id: subtask._id || `temp-${Date.now()}`,
      _id: subtask._id,
      title: subtask.title,
      completed: subtask.completed || false
    })) || []
  );
  const [newSubtask, setNewSubtask] = useState("");
  const [editedTask, setEditedTask] = useState({
    status: task.status,
    priority: task.priority,
    endDate: task.endDate
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const newItem = {
      id: `temp-${Date.now()}`, // Prefix temp IDs to avoid conflicts
      title: newSubtask,
      completed: false,
    };
    const newSubtasks = [...subtasks, newItem];
    setSubtasks(newSubtasks);
    setNewSubtask("");

    // If task was completed and new subtask added, change to Ongoing
    if (!statusManuallyChanged && editedTask.status === 'Completed') {
      setEditedTask(prev => ({ ...prev, status: 'Ongoing' }));
    }
  };

  const handleToggleSubtask = (id) => {
    const updatedSubtasks = subtasks.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    setSubtasks(updatedSubtasks);

    // Only auto-update status if user hasn't manually changed it
    if (!statusManuallyChanged) {
      const allCompleted = updatedSubtasks.every(subtask => subtask.completed);
      const hasSubtasks = updatedSubtasks.length > 0;

      if (allCompleted && hasSubtasks) {
        setEditedTask(prev => ({ ...prev, status: 'Completed' }));
      } else if (hasSubtasks) {
        setEditedTask(prev => ({ ...prev, status: 'Ongoing' }));
      }
    }
  };

  const [statusManuallyChanged, setStatusManuallyChanged] = useState(false);

  const handleDeleteSubtask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      // Find the subtask to delete to get its _id if it exists
      const subtaskToDelete = subtasks.find(item => item.id === id);

      // Filter out the subtask to delete
      const updatedSubtasks = subtasks.filter(item => item.id !== id);

      // Update local state immediately for responsive UI
      setSubtasks(updatedSubtasks);

      // Prepare subtasks for backend - only include _id for existing subtasks
      const backendSubtasks = updatedSubtasks.map(subtask => ({
        _id: subtask._id, // Only include _id for existing subtasks
        title: subtask.title,
        completed: subtask.completed
      }));

      // Send update to backend
      await updateTask(token, task._id, {
        subtasks: backendSubtasks
      });

      // Refresh task list
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error("Error deleting subtask:", error);
      // Revert UI if API call fails
      setSubtasks(subtasks);
    }
  };

  const handleSave = async () => {
    // Validate overdue status
    if (editedTask.status === 'Overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(editedTask.endDate);

      if (dueDate >= today) {
        alert('Cannot set status to Overdue - the due date has not passed yet');
        return;
      }
    }

    // Validate completed status
    if (editedTask.status === 'Completed' && subtasks.length > 0) {
      const allCompleted = subtasks.every(subtask => subtask.completed);
      if (!allCompleted) {
        alert('Cannot mark task as Completed - not all subtasks are finished');
        return;
      }
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const result = await updateTask(token, task._id, {
        status: editedTask.status,
        priority: editedTask.priority,
        endDate: editedTask.endDate,
        subtasks: subtasks.map(subtask => ({
          _id: subtask._id, // Only include _id for existing subtasks
          title: subtask.title,
          completed: subtask.completed
        }))
      });

      if (result.success) {
        if (typeof onTaskUpdate === 'function') {
          onTaskUpdate({ ...task, ...editedTask });
        }
        if (typeof onClose === 'function') {
          onClose();
          // Trigger a soft refresh of the task list
          window.dispatchEvent(new Event('taskUpdated'));
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md h-full bg-[#dabec4] p-6 overflow-y-auto flex flex-col">
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .task-details-modal {
            animation: slideIn 0.3s ease-out;
          }
        `}</style>

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 bg-[#800020] text-white">
          <X size={24} />
        </button>

        {/* Task Title & Meta */}
        <div className="mb-5">
          <p className="text-sm text-gray-700">Task Details</p>
          <h2 className="text-2xl font-bold text-[#6c0017]">{task.name}</h2>
          <p className="text-sm text-gray-800 mt-1 ">By {task.user?.name || 'Unknown User'} on {task.createdAt}</p>
        </div>

        {/* Edit Button */}
        <div className="mt-1 mb-5 flex justify-start">
          <Link to={`/edittask/${task._id}`}>
            <button
              className="bg-red-400 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Edit Task
            </button>
          </Link>
        </div>

        {/* Project Info */}
        <div className="mb-2">
          <p className="text-sm text-gray-700">Project</p>
          <h3 className="text-lg font-bold text-[#6c0017]">{task.project?.name || 'No Project'}</h3>
        </div>

        {/* Status, Date, Priority */}
        <div className="grid grid-cols-2 gap-4 mb-1">
          <div>
            <label className="block text-sm font-semibold">Status</label>
            <select
              className="w-full border p-2 rounded"
              value={editedTask.status}
              onChange={(e) => {
                setEditedTask({ ...editedTask, status: e.target.value });
                setStatusManuallyChanged(true);
              }}
            >
              <option>To Do</option>
              <option>Ongoing</option>
              <option>Cancelled</option>
              <option>Completed</option>
              <option>Overdue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Due Date</label>
            <input
              type="date"
              onClick={(e) => e.target.showPicker()}
              min={new Date().toISOString().split('T')[0]}
              value={editedTask.endDate && !isNaN(new Date(editedTask.endDate))
                ? new Date(new Date(editedTask.endDate).getTime() - (new Date(editedTask.endDate).getTimezoneOffset() * 60000)).toISOString().split('T')[0]
                : ''}
              onChange={(e) => setEditedTask({ ...editedTask, endDate: e.target.value })}
              className="w-full border p-2 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Priority</label>
            <select
              className="w-full border p-2 rounded"
              value={editedTask.priority}
              onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>





        {/* Subtasks */}
        <div className="flex-grow mb-6 mt-4">
          <h3 className="text-lg font-bold text-[#6c0017] mb-3">Subtasks</h3>
          <div className="space-y-3">
            {[...subtasks].sort((a, b) => {
              // Move completed tasks to the bottom
              if (a.completed && !b.completed) return 1;
              if (!a.completed && b.completed) return -1;
              return 0;
            }).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white px-3 py-2 rounded shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleSubtask(item.id)}
                  />
                  <span className={clsx("text-sm", item.completed && "line-through text-gray-500")}>
                    {item.title}
                  </span>
                </div>
                <button onClick={() => handleDeleteSubtask(item.id)} className="text-gray-500 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Subtask */}
        <div className="bg-[#ead5da] rounded flex items-center px-3 py-2">
          <input
            type="text"
            placeholder="Please Write Checklist name here"
            className="w-full bg-transparent outline-none text-sm"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddSubtask();
              }
            }}
          />
          <button
            onClick={handleAddSubtask}
            className="bg-[#6c0017] text-white p-2 rounded"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#6c0017] text-white px-4 py-2 rounded-lg hover:bg-[#8a001f] disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>


      </div>
    </div>
  );
};

export default TaskDetailsModal;
