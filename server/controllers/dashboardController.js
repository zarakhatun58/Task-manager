import Project from "../models/projectModel.js";
import Task from "../models/taskModel.js";
import Team from "../models/teamModel.js";
import ActivityTask from "../models/activityModel.js";

export const getDashboard = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user });
    const projectIds = projects.map(p => p._id);

    const totalProjects = projects.length;
    const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });

    const teams = await Team.find({ userId: req.user });
    const teamSummaries = [];

    for (const team of teams) {
      // tasks for this team's projects
      const teamProjects = projects.filter(p => String(p.teamId) === String(team._id)).map(p => p._id);
      const tasks = await Task.find({ projectId: { $in: teamProjects } });

      const counts = {};
      for (const m of team.members) counts[m._id.toString()] = 0;
      tasks.forEach(t => {
        if (counts.hasOwnProperty(t.assignedMemberId)) counts[t.assignedMemberId] += 1;
      });

      const members = team.members.map(m => ({
        memberId: m._id.toString(),
        name: m.name,
        current: counts[m._id.toString()] || 0,
        capacity: m.capacity,
        overloaded: (counts[m._id.toString()] || 0) > m.capacity
      }));

      teamSummaries.push({ teamId: team._id, name: team.name, members });
    }

    const recentReassignments = await ActivityTask.find({ userId: req.user, message: /reassigned/ }).sort({ createdAt: -1 }).limit(5);

    res.json({ totalProjects, totalTasks, teamSummaries, recentReassignments });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard", error: err.toString() });
  }
};
