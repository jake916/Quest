const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const router = express.Router();
router.use(cookieParser());

// Middleware to verify JWT token (Private Route)
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];


    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const tokenValue = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // Log the decoded token for debugging

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// Register User
router.post("/register", async (req, res) => {
    console.log("Registration request received:", req.body); // Log the incoming request   
    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        if (username.length < 6) {
            return res.status(400).json({ message: "Username must be at least 6 characters long" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        const existingUser = await User.findOne({ 
            $or: [{ username }, { email: email.toLowerCase() }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        

        const newUser = new User({ username, email: email.toLowerCase(), password});
        

        const savedUser = await newUser.save();



        return res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration Error:", error.message);

        if (error.code === 11000) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Login User
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in environment variables.");
            return res.status(500).json({ message: "Internal Server Error" });
        }

        const user = await User.findOne({ email: email ? email.toLowerCase() : "" });


        if (!user || !email) {
            return res.status(400).json({ message: "User not found or email is required" });

        }

        
        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        
        res.cookie("token", token, { // Set the JWT token in a cookie
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        }).status(200).json({ message: "Logged in successfully", user: { id: user._id, username: user.username, email: user.email }, token }); // Include token in the response

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Logout User (Clear JWT cookie)
router.post("/logout", (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logged out successfully" });
});

// Protected Route Example (Dashboard)
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Welcome to the dashboard", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
