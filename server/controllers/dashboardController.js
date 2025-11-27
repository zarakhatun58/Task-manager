import TaskProject from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import Team from "../models/teamModel.js";
import ActivityTask from "../models/activityModel.js";

export const getDashboard = async (req, res) => {
  try {
    // Get all projects of user
    const projects = await TaskProject.find({ userId: req.user }).lean();
    const projectIds = projects.map(p => p._id.toString());

    // Get all tasks belonging to these projects
    const tasks = await Task.find({ projectId: { $in: projectIds } }).lean();

    // Get all teams of user
    const teams = await Team.find({ userId: req.user }).lean();

    const teamsWithCounts = teams.map(team => {
      const updatedMembers = team.members.map(member => {
        const taskCount = tasks.filter(t => String(t.assignedTo) === String(member._id)).length;
        return {
          ...member,
          currentTasks: taskCount
        };
      });

      return {
        ...team,
        members: updatedMembers
      };
    });

    const recentReassignments = await ActivityTask.find({
      userId: req.user,
      message: /reassigned/
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      projects,
      tasks,
      teams: teamsWithCounts,
      activityLogs: recentReassignments
    });

  } catch (err) {
    res.status(500).json({
      message: "Error fetching dashboard",
      error: err.toString()
    });
  }
};
