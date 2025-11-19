import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  capacity: Number
});

const teamSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    members: [teamMemberSchema]
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
