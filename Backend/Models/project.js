const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    projectImage: { type: String, required: false }, // Store Cloudinary image URL
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference User
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
