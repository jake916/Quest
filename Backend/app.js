const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./Routes/auth");
const userRoutes = require("./Routes/user");
const projectRoutes = require("./Routes/project");
const taskRoutes = require("./Routes/task");

dotenv.config();

const app = express();

// ✅ CORS Setup
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://quest-frontend-ib4i.onrender.com'], // frontend URLs only
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Serve frontend (React build)
app.use(express.static(path.join(__dirname, 'frontend', 'dist'))); // or 'client/dist' depending on your folder structure
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html')); // adjust to correct React build folder
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5012;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
