const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    project: { 
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
      name: { type: String }
    },
    status: { 
      type: String, 
      enum: ["To Do", "Ongoing", "Completed", "Cancelled", "Overdue"], 
      default: "To Do" 
    },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    startDate: { type: Date },
    endDate: { type: Date },
    user: { 
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true }
    },
    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false }
      }
    ]

  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model("Task", TaskSchema);
