import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Pending", "In Progress", "Done"], default: "Pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
