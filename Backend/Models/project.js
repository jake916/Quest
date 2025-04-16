const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    projectImage: { type: String, required: false }, // Cloudinary URL storage
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference User
}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
