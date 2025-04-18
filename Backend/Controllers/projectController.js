const path = require('path');
const fs = require('fs');
const Project = require("../Models/project");
const User = require("../Models/User"); // Import the User model

const createProject = async (req, res) => {
    
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    try {
        const { name, description } = req.body;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        let projectImageUrl = null; // No default image
        
        if (req.file) {
            // Handle file upload properly
            if (!fs.existsSync(path.join(__dirname, '../../public/uploads'))) {
                fs.mkdirSync(path.join(__dirname, '../../public/uploads'), { recursive: true });
            }
            const uploadPath = path.join(__dirname, '../../public/uploads', req.file.filename);
            await fs.promises.rename(req.file.path, uploadPath);
            projectImageUrl = `/uploads/${req.file.filename}`;
        }

        const newProject = new Project({
            name,
            description,
            projectImage: projectImageUrl,
            user: req.user.id,
        });
        console.log("Project data to be saved:", newProject); // Log the project data

        await newProject.save();
        res.status(201).json({  success: true, message: "Project created successfully", project: newProject });
        console.log("New project created:", newProject); // Log the created project for debugging

    } catch (error) {
        console.error("Error creating project:", error.message); // Log the error message for debugging
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Fix: Define getProjects function
const getProjects = async (req, res) => {
    try {
const projects = await Project.find({ user: req.user.id }).populate("user", "username email");

        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate("user", "username email");
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        res.status(200).json({ project });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { createProject, getProjects, getProjectById };
