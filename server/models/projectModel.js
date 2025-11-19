import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    name: String
  },
  { timestamps: true }
);

export default mongoose.model("TaskProject", projectSchema);
