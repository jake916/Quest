const Task = require("../Models/task");
const User = require("../Models/User");
const Project = require("../Models/project"); // Import the Project model

// Controller function to fetch tasks for a user
const getTasks = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const userId = req.user.id; // Assuming user ID is set in req.user from authentication middleware
        const totalTasks = await Task.countDocuments({ user: userId });
        const ongoingTasks = await Task.countDocuments({ 
            user: userId, 
            status: { $in: ["Ongoing", "Ongoing"] }  // Count both variations
        });
        const completedTasks = await Task.countDocuments({ user: userId, status: "Completed" });
        const overdueTasks = await Task.countDocuments({ user: userId, endDate: { $lt: new Date() } });
        const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 }); // Fetch all tasks


        res.status(200).json({ totalTasks, ongoingTasks, completedTasks, overdueTasks, tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
};

// Controller function to create a new task
const createTask = async (req, res) => {
    try {
        const { name, description, project, status, priority, startDate, endDate } = req.body;
        const projectDetails = await Project.findById(project); // Fetch project details

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const userId = req.user.id; // Assuming user ID is set in req.user from authentication middleware

        const newTask = new Task({
            projectImage: projectDetails.projectImage, // Include project image in the task
            name,
            description,
            project,
            status,
            priority,
            startDate,
            endDate,
            user: userId, // Set the user field to the logged-in user
        });

        await newTask.save();
        console.log("New Task Created:", newTask); // Log the created task for debugging
        res.status(201).json({ message: "Task created successfully", task: newTask });

    } catch (error) {
        res.status(500).json({ message: "Error creating task", error: error.message });
    }
};

module.exports = { createTask, getTasks };
