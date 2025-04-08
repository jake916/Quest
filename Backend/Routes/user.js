const express = require("express");
const router = express.Router();
const User = require("../Models/User");
const verifyToken = require("../Middle/auth");

// Get Logged-in User
router.get("/me", verifyToken, async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });

        // Fetch only the logged-in user using req.user.id
        const user = await User.findById(req.user.id).select("username email");

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Server error while fetching user" });
    }
});

module.exports = router;
