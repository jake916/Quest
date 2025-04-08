const express = require("express");
const router = express.Router();
const upload = require("../Middle/upload");
const authMiddleware = require("../Middle/auth");
const { createProject, getProjects } = require("../Controllers/projectController");


// Debugging output

// Project creation route (Protected)
router.post("/createproject", authMiddleware, upload.single("projectImage"), createProject);

router.get("/", authMiddleware, getProjects);



module.exports = router;
