const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// Register User
router.post("/register", async (req, res) => {

    try {
        const { username, email, password, confirmPassword } = req.body;

        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        if (username.length < 1) {
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

        // Generate verification code
        const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();

        // Create new user with verification code
        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password: password,
            verificationCode: verificationCode,
            isVerified: false
        });

        const savedUser = await newUser.save();

        // Send verification email
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: savedUser.email,
            subject: "Email Verification Code",
            text: `Your email verification code is: ${verificationCode}. Please enter this code to verify your email.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending verification email:", error);
                // We still return success but inform user to check email manually
                return res.status(201).json({ message: "User registered successfully, but failed to send verification email. Please contact support.", user: { id: savedUser._id, username: savedUser.username, email: savedUser.email } });
            } else {
                console.log("Verification email sent:", info.response);
                return res.status(201).json({ message: "User registered successfully. Verification email sent.", user: { id: savedUser._id, username: savedUser.username, email: savedUser.email } });
            }
        });

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
        const { identifier, password } = req.body;

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in environment variables.");
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (!identifier || !password) {
            return res.status(400).json({ message: "Identifier and password are required" });
        }

        const user = await User.findOne({ 
            $or: [
                { email: identifier.toLowerCase() }, 
                { username: identifier }
            ] 
        });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        }).status(200).json({
            message: "Logged in successfully",
            user: { id: user._id, username: user.username, email: user.email },
            token
        });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Logout User
router.post("/logout", (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logged out successfully" });
});

// Protected Route Example
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


// Middleware to check if user's email is verified
const emailVerifiedMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: "Email not verified" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Forgot Password - send reset code
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset code and expiration (1 hour)
        const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase();
        const resetExpires = Date.now() + 3600000; // 1 hour

        user.resetPasswordCode = resetCode;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // Send reset code email
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: user.email,
            subject: "Password Reset Code",
            text: `Your password reset code is: ${resetCode}. It expires in 1 hour.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending password reset email:", error);
                return res.status(500).json({ message: "Failed to send password reset email" });
            } else {
                console.log("Password reset email sent:", info.response);
                return res.status(200).json({ message: "Password reset code sent" });
            }
        });

    } catch (error) {
        console.error("Forgot Password Error:", error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Verify Reset Code
router.post("/verify-reset-code", async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: "Email and code are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.resetPasswordCode || !user.resetPasswordExpires) {
            return res.status(400).json({ message: "No reset request found" });
        }

        if (user.resetPasswordCode !== code.toUpperCase()) {
            return res.status(400).json({ message: "Invalid reset code" });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Reset code expired" });
        }

        return res.status(200).json({ message: "Reset code verified" });

    } catch (error) {
        console.error("Verify Reset Code Error:", error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: "Email, code, and new password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.resetPasswordCode || !user.resetPasswordExpires) {
            return res.status(400).json({ message: "No reset request found" });
        }

        if (user.resetPasswordCode !== code.toUpperCase()) {
            return res.status(400).json({ message: "Invalid reset code" });
        }

        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Reset code expired" });
        }

        user.password = newPassword;
        user.resetPasswordCode = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        console.error("Reset Password Error:", error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/verify-email", async (req, res) => {
    try {
        const { userId, code } = req.body;

        if (!userId || !code) {
            return res.status(400).json({ message: "User ID and code are required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        if (user.verificationCode !== code.toUpperCase()) {
            return res.status(400).json({ message: "Invalid verification code" });
        }

        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        return res.status(200).json({ message: "Email verified successfully" });

    } catch (error) {
        console.error("Email Verification Error:", error.message);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
