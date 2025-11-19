import ActivityTask from "../models/activityModel.js";

export const getActivities = async (req, res) => {
  try {
    // returns latest 10 logs for user (or all if admin)
    const logs = await ActivityTask.find({ userId: req.user }).sort({ createdAt: -1 }).limit(10);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching activities", error: err.toString() });
  }
};
