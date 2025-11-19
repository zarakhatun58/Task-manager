import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    assignedTo: String, 
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    status: { type: String, enum: ["Pending", "In Progress", "Done"], default: "Pending" },
    title: String,
    description: String
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
