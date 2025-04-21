const path = require('path');
const fs = require('fs');
const Project = require("../Models/project");
const User = require("../Models/User"); // Import the User model
const cloudinary = require("../Config/cloudinary"); // Import Cloudinary config

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
            // Upload file to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "project_images"
            });
            projectImageUrl = result.secure_url;
        }

        const newProject = new Project({
            name,
            description,
            projectImage: projectImageUrl,
            user: req.user.id,
        });
        

        await newProject.save();
        res.status(201).json({  success: true, message: "Project created successfully", project: newProject });
        

    } catch (error) {
        console.error("Error creating project:", error.message); // Log the error message for debugging
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.id;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        if (project.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this project" });
        }

        const { name, description, removeLogo } = req.body;

        if (removeLogo === 'true' || removeLogo === true) {
            if (project.projectImage) {
                // Note: Skipping deletion from Cloudinary due to lack of public_id
                project.projectImage = null;
            }
        }

        if (req.file) {
            // Upload file to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "project_images"
            });
            project.projectImage = result.secure_url;
        }

        if (name) project.name = name;
        if (description) project.description = description;

        await project.save();

        res.status(200).json({ success: true, message: "Project updated successfully", project });
    } catch (error) {
        console.error("Error updating project:", error.message);
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

// Updated deleteProject controller function using findByIdAndDelete
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }
        // Check if req.user.id matches project.user to authorize deletion
        if (project.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to delete this project" });
        }
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error("Error deleting project:", error.stack || error.message || error);
        res.status(500).json({ message: "Server error during project deletion", error: error.message || error });
    }
};

module.exports = { createProject, getProjects, getProjectById, deleteProject, updateProject };
