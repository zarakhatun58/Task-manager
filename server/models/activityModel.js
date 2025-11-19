import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "TaskUser" }, // who triggered action (optional)
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityTask", activitySchema);
