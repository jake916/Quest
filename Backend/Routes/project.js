const express = require("express");
const router = express.Router();
const upload = require("../Middle/upload");
const authMiddleware = require("../Middle/auth");
const { createProject, getProjects, getProjectById, deleteProject, updateProject } = require("../Controllers/projectController");

// Project creation route (Protected)
router.post("/createproject", authMiddleware, upload.single("projectImage"), createProject);

// Update project route (Protected)
router.put("/updateproject/:id", authMiddleware, upload.single("projectImage"), updateProject);

// Get all projects for user
router.get("/", authMiddleware, getProjects);

// Get project by ID
router.get("/:id", authMiddleware, getProjectById);

// Delete project by ID
router.delete("/:id", authMiddleware, deleteProject);

module.exports = router;
