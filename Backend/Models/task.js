const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true }, // Link to project
    status: { 
      type: String, 
      enum: ["To Do", "Ongoing", "Completed", "Cancelled", "Overdue"], 
      default: "To Do" 
    },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    startDate: { type: Date },
    endDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Auto-set from logged-in user
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model("Task", TaskSchema);
