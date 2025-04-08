const express = require("express");
const router = express.Router();
const { createTask, getTasks } = require("../Controllers/taskController");

const authMiddleware = require("../Middle/auth");

router.get("/", authMiddleware, getTasks); // GET endpoint to fetch tasks for a user
// POST endpoint to create a new task
router.post("/", authMiddleware, createTask);



module.exports = router;
