const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./Routes/auth");
const cors = require('cors');
const userRoutes = require("./Routes/user");
const projectRoutes = require("./Routes/project")
const taskRoutes = require("./Routes/task")


require('dotenv').config();


const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'https://quest-3ica.onrender.com'], // or '*' if you want to allow all, but not recommended with credentials
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));



// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.options('*', cors({
    origin: ['http://localhost:5173', 'https://quest-3ica.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.get('/test-cors', (req, res) => {
    res.json({ message: 'CORS is working!' });
}); // Test CORS endpoint

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes); // Use task routes



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5012;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
