const mongoose = require("mongoose");
const Task = require("../Models/task");
const User = require("../Models/User");
const Project = require("../Models/project");

// Controller function to fetch tasks for a user
const getTasks = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const userId = req.user.id;
        
        // Create a query that works with both old and new schema
        const userQuery = { 
            $or: [
                { "user.id": userId }, // New schema format
                { user: userId }        // Old schema format
            ]
        };
        
        const totalTasks = await Task.countDocuments(userQuery);
        
        const ongoingTasks = await Task.countDocuments({ 
            ...userQuery, 
            status: "Ongoing"  // Fixed the duplicate value
        });
        
        const completedTasks = await Task.countDocuments({ 
            ...userQuery, 
            status: "Completed" 
        });
        
        const overdueTasks = await Task.countDocuments({ 
            ...userQuery, 
            endDate: { $lt: new Date() } 
        });
        
        const tasks = await Task.find(userQuery).sort({ createdAt: -1 });

        res.status(200).json({ totalTasks, ongoingTasks, completedTasks, overdueTasks, tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
};

// Controller function to create a new task
const createTask = async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['name', 'description', 'project', 'status', 'priority', 'startDate', 'endDate'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length) {
            return res.status(400).json({ 
                message: `Missing fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate dates
        if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
            return res.status(400).json({ 
                message: "End date must be after start date" 
            });
        }

        // Validate user
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Check user and project exist
        const [user, project] = await Promise.all([
            User.findById(req.user.id),
            Project.findById(req.body.project)
        ]);

        if (!user) return res.status(404).json({ message: "User not found" });
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Create task
        const newTask = new Task({
            name: req.body.name,
            description: req.body.description,
            project: {
                id: project._id,
                name: project.name
            },
            status: req.body.status,
            priority: req.body.priority,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
        user: {
            id: user._id,
            name: user.name || user.username || 'Unknown' // Fallback for name
        },
        customReminders: req.body.customReminders || []
        });

        await newTask.save();
        return res.status(201).json({ 
            message: "Task created successfully",
            task: newTask
        });

    } catch (error) {
        console.error("Task creation error:", error);
        return res.status(500).json({ 
            message: "Error creating task",
            error: error.message 
        });
    }
};

// Controller function to update a task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body || {};

        // Validate required fields
        if (!id) {
            return res.status(400).json({ message: "Task ID is required" });
        }

        // Validate user
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Find and update the task
        const updatedTask = await Task.findOneAndUpdate(
            { 
                _id: id,
                'user.id': req.user.id // Ensure user owns the task
            },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        return res.status(200).json({ 
            message: "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {
        console.error("Task update error:", error);
        return res.status(500).json({ 
            message: "Error updating task",
            error: error.message 
        });
    }
};

const getTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid task ID" });
        }

        const task = await Task.findOne({
            _id: id,
            $or: [
                { "user.id": req.user.id }, // New schema
                { user: req.user.id }       // Old schema
            ]
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        return res.status(200).json({ task });
    } catch (error) {
        console.error("Error fetching task:", error);
        return res.status(500).json({ 
            message: "Error fetching task",
            error: error.message 
        });
    }
};

// Controller function to delete a task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const deletedTask = await Task.findOneAndDelete({
            _id: id,
            'user.id': req.user.id // Ensure user owns the task
        });

        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        return res.status(200).json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error("Task deletion error:", error);
        return res.status(500).json({
            message: "Error deleting task",
            error: error.message
        });
    }
};

// Controller function to fetch tasks by project ID
const getTasksByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const userId = req.user.id;

        const tasks = await Task.find({
            $and: [
                { 'project.id': projectId },
                { $or: [
                    { "user.id": userId },
                    { user: userId }
                ]}
            ]
        }).sort({ createdAt: -1 });


        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Error fetching tasks by project ID:", error);
        res.status(500).json({ message: "Error fetching tasks by project ID", error: error.message });
    }
};

module.exports = { createTask, getTasks, updateTask, getTask, deleteTask, getTasksByProjectId };
