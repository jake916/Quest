const express = require("express");
const router = express.Router();
const { createTask, getTasks, updateTask, getTask } = require("../Controllers/taskController");

const authMiddleware = require("../Middle/auth");

router.get("/", authMiddleware, getTasks); // GET endpoint to fetch tasks for a user
router.post("/", authMiddleware, createTask); // POST endpoint to create a new task
router.get("/:id", authMiddleware, getTask); // GET endpoint to fetch a single task by ID
router.patch("/:id", authMiddleware, updateTask); // PATCH endpoint to update a task

module.exports = router;
