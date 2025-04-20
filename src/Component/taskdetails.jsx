import { useState, useEffect } from "react";
import { updateTask } from "../api/taskService";
import { X, Trash2, Plus } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  const [statusManuallyChanged, setStatusManuallyChanged] = useState(false);

  const [messageModal, setMessageModal] = useState({ visible: false, message: "" });

  // New state for editing subtasks
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");

  const isCancelled = editedTask.status === "Cancelled";

  useEffect(() => {
    let timer;
    if (messageModal.visible) {
      timer = setTimeout(() => {
        setMessageModal({ visible: false, message: "" });
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [messageModal.visible]);

  const showMessage = (msg) => {
    setMessageModal({ visible: true, message: msg });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim() || isCancelled) return;
    const newItem = {
      id: `temp-${Date.now()}`,
      title: newSubtask,
      completed: false,
    };
    const newSubtasks = [...subtasks, newItem];
    setSubtasks(newSubtasks);
    setNewSubtask("");

    if (!statusManuallyChanged && editedTask.status === 'Completed') {
      setEditedTask(prev => ({ ...prev, status: 'Ongoing' }));
    }
  };

  const handleToggleSubtask = (id) => {
    if (isCancelled) return;
    const updatedSubtasks = subtasks.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    setSubtasks(updatedSubtasks);

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

  const handleDeleteSubtask = async (id) => {
    if (isCancelled) return;
    try {
      const token = localStorage.getItem("token");

      const updatedSubtasks = subtasks.filter(item => item.id !== id);

      setSubtasks(updatedSubtasks);

      const backendSubtasks = updatedSubtasks.map(subtask => ({
        _id: subtask._id,
        title: subtask.title,
        completed: subtask.completed
      }));

      await updateTask(token, task._id, {
        subtasks: backendSubtasks
      });

      if (!statusManuallyChanged) {
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
        if (allCompleted) {
          setEditedTask(prev => ({ ...prev, status: 'Completed' }));
        } else {
          setEditedTask(prev => ({ ...prev, status: 'Ongoing' }));
        }
      }

      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error("Error deleting subtask:", error);
      setSubtasks(subtasks);
    }
  };

  const handleSave = async () => {
    if (editedTask.status === 'Overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(editedTask.endDate);

      if (dueDate >= today) {
        showMessage('Cannot set status to Overdue - the due date has not passed yet');
        return;
      }
    }

    if (editedTask.status === 'Completed' && subtasks.length > 0) {
      const allCompleted = subtasks.every(subtask => subtask.completed);
      if (!allCompleted) {
        showMessage('Cannot mark task as Completed - not all subtasks are finished');
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
          _id: subtask._id,
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
          window.dispatchEvent(new Event('taskUpdated'));
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate subtask counts
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(st => st.completed).length;
  const ongoingSubtasks = totalSubtasks - completedSubtasks;

  // Handle drag end for reordering subtasks with sorted rendering
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    // Create sorted subtasks array for rendering
    const sortedSubtasks = [...subtasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });

    // Reorder sortedSubtasks based on drag result
    const reorderedSorted = Array.from(sortedSubtasks);
    const [removed] = reorderedSorted.splice(result.source.index, 1);
    reorderedSorted.splice(result.destination.index, 0, removed);

    // Map reordered sorted subtasks back to original subtasks order
    // Create a map from id to subtask
    const subtaskMap = new Map(subtasks.map(item => [item.id, item]));

    // Build new subtasks array in the order of reorderedSorted
    const reordered = reorderedSorted.map(item => subtaskMap.get(item.id));

    setSubtasks(reordered);

    // Save reordered subtasks immediately
    try {
      const token = localStorage.getItem("token");
      await updateTask(token, task._id, {
        subtasks: reordered.map(subtask => ({
          _id: subtask._id,
          title: subtask.title,
          completed: subtask.completed
        }))
      });
      window.dispatchEvent(new Event('taskUpdated'));
    } catch (error) {
      console.error("Error saving reordered subtasks:", error);
    }
  };

  //DraggableID
  const getDraggableId = (item) => {
    return item.id ? String(item.id) : `temp-${Date.now()}`;
  };

  // New functions for editing subtasks
  const startEdit = (item) => {
    setEditingSubtaskId(item.id);
    setEditingSubtaskTitle(item.title);
  };

  const saveEdit = () => {
    if (!editingSubtaskTitle.trim()) {
      // Do not save empty title
      return;
    }
    const updatedSubtasks = subtasks.map(item =>
      item.id === editingSubtaskId ? { ...item, title: editingSubtaskTitle } : item
    );
    setSubtasks(updatedSubtasks);
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  const cancelEdit = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md h-full bg-[#dabec4] p-6 overflow-y-auto flex flex-col shadow-lg">
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .task-details-modal {
            animation: slideIn 0.3s ease-out;
          }
          .message-modal {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f87171; /* red-400 */
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-weight: 600;
            user-select: none;
          }
          .subtask-summary {
            font-size: 0.875rem;
            color: #4b55663; /* gray-600 */
            margin-top: 0.25rem;
          }
        `}</style>

        {messageModal.visible && (
          <div className="message-modal" role="alert" aria-live="assertive">
            {messageModal.message}
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 bg-[#800020] text-white">
          <X size={24} />
        </button>

        <div className="mb-5">
          <p className="text-sm text-gray-700">Task Details</p>
          <h2 className="text-2xl font-bold text-[#6c0017]">{task.name}</h2>
          <p className="text-sm text-gray-800 mt-1 ">By {task.user?.name || 'Unknown User'} on {task.createdAt}</p>
        </div>

        <div className="mt-1 mb-5 flex justify-start">
          <Link to={`/edittask/${task._id}`}>
            <button
              className="bg-red-400 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Edit Task
            </button>
          </Link>
        </div>

        <div className="mb-2">
          <p className="text-sm text-gray-700">Project</p>
          <h3 className="text-lg font-bold text-[#6c0017]">{task.project?.name || 'No Project'}</h3>
        </div>

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

        <div className="flex-grow mb-6 mt-4">
          <h3 className="text-lg font-bold text-[#6c0017] mb-1">Subtasks</h3>
          <div className="subtask-summary">
            Total: {totalSubtasks} | Ongoing: {ongoingSubtasks} | Completed: {completedSubtasks}
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="subtasks" isDropDisabled={!!isCancelled} isCombineEnabled={false} ignoreContainerClipping={false}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {[...subtasks].sort((a, b) => {
                    if (a.completed && !b.completed) return 1;
                    if (!a.completed && b.completed) return -1;
                    return 0;
                  }).map((item, index) => (
                    <Draggable key={getDraggableId(item)} draggableId={getDraggableId(item)} index={index} isDragDisabled={isCancelled}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={clsx(
                            "flex items-center justify-between bg-white px-3 py-2 rounded shadow-sm",
                            isCancelled && "opacity-50 cursor-not-allowed",
                            snapshot.isDragging && "bg-[#f0e6e8] shadow-lg"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => handleToggleSubtask(item.id)}
                              disabled={isCancelled}
                            />
                            {editingSubtaskId === item.id ? (
                              <>
                                <input
                                  type="text"
                                  className="border rounded px-2 py-1 text-sm"
                                  value={editingSubtaskTitle}
                                  onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      saveEdit();
                                    } else if (e.key === 'Escape') {
                                      cancelEdit();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => saveEdit()}
                                  className="ml-2 text-green-600 hover:text-green-800"
                                  aria-label="Save edit"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => cancelEdit()}
                                  className="ml-1 text-red-600 hover:text-red-800"
                                  aria-label="Cancel edit"
                                >
                                  ✗
                                </button>
                              </>
                            ) : (
                              <span
                                className={clsx("text-sm", item.completed && "line-through text-gray-500")}
                                onDoubleClick={() => startEdit(item)}
                                style={{ cursor: 'pointer' }}
                              >
                                {item.title}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteSubtask(item.id)}
                            className="text-gray-500 hover:text-red-500"
                            disabled={isCancelled}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

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
            disabled={isCancelled}
          />
          <button
            onClick={handleAddSubtask}
            className="bg-[#6c0017] text-white p-2 rounded"
            disabled={isCancelled}
          >
            <Plus size={16} />
          </button>
        </div>

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
