import Task from "../models/taskModel.js";
import Project from "../models/projectModel.js";
import Team from "../models/teamModel.js";
import ActivityTask from "../models/activityModel.js";
import reassignForTeam from "../utils/reassign.js";


async function countTasksForTeam(teamId) {
  const projects = await (await import("../models/projectModel.js")).default.find({ teamId }).select("_id");
  const projectIds = projects.map(p => p._id);
  const tasks = await Task.find({ projectId: { $in: projectIds }, status: { $in: ["Pending", "In Progress"] } });

  const counts = {};
  for (const t of tasks) {
    const mid = t.assignedMemberId || "UNASSIGNED";
    counts[mid] = (counts[mid] || 0) + 1;
  }
  return counts;
}


export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedMemberId, priority, status } = req.body;

    if (!title || !projectId) return res.status(400).json({ message: "title and projectId required" });

    const project = await Project.findById(projectId).populate("teamId");
    if (!project) return res.status(400).json({ message: "Project not found" });

    const team = await Team.findById(project.teamId);
    if (!team) return res.status(400).json({ message: "Team for project not found" });

    // if assignedMemberId provided, ensure exists in team
    let assignedName = "Unassigned";
    let warning = null;
    if (assignedMemberId && assignedMemberId !== "UNASSIGNED") {
      const member = team.members.find(m => String(m._id) === String(assignedMemberId));
      if (!member) return res.status(400).json({ message: "Assigned member not part of project team" });

      // count current tasks
      const counts = await countTasksForTeam(team._id);
      const memberCount = counts[assignedMemberId] || 0;
      if (memberCount >= member.capacity) {
        warning = `${member.name} has ${memberCount} tasks but capacity is ${member.capacity}. Assign anyway?`;
      }
      assignedName = member.name;
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedMemberId: assignedMemberId || "UNASSIGNED",
      assignedMemberName: assignedName,
      priority: priority || "Medium",
      status: status || "Pending"
    });

    // log creation
    await ActivityTask.create({ userId: req.user, message: `Task "${task.title}" created and assigned to ${task.assignedMemberName}` });

    res.status(201).json({ task, warning });
  } catch (err) {
    res.status(500).json({ message: "Error creating task", error: err.toString() });
  }
};

export const getTasks = async (req, res) => {
  try {
    // supports filters: ?projectId=&memberId=&status=&priority=
    const filter = {};
    if (req.query.projectId) filter.projectId = req.query.projectId;
    if (req.query.memberId) filter.assignedMemberId = req.query.memberId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.toString() });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error fetching task", error: err.toString() });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updates = {};
    const allowed = ["title", "description", "assignedMemberId", "priority", "status"];
    for (const p of allowed) if (req.body[p] !== undefined) updates[p] = req.body[p];

    if (updates.assignedMemberId) {
      // validate assignment belongs to project team
      const task = await Task.findById(req.params.taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      const project = await Project.findById(task.projectId);
      const team = await Team.findById(project.teamId);
      if (updates.assignedMemberId !== "UNASSIGNED") {
        const member = team.members.find(m => String(m._id) === String(updates.assignedMemberId));
        if (!member) return res.status(400).json({ message: "Assigned member not part of project team" });
        updates.assignedMemberName = member.name;
      } else {
        updates.assignedMemberName = "Unassigned";
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.taskId, updates, { new: true });
    await ActivityTask.create({ userId: req.user, message: `Task "${updated.title}" updated.` });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err.toString() });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const removed = await Task.findByIdAndDelete(req.params.taskId);
    if (!removed) return res.status(404).json({ message: "Task not found" });
    await ActivityTask.create({ userId: req.user, message: `Task "${removed.title}" deleted.` });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task", error: err.toString() });
  }
};


export const autoAssign = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: "projectId required" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(400).json({ message: "Project not found" });

    const team = await Team.findById(project.teamId);
    const counts = await countTasksForTeam(team._id);

    // sort members by currentTasks asc
    const members = team.members.map(m => ({
      id: m._id.toString(),
      name: m.name,
      capacity: m.capacity,
      current: counts[m._id.toString()] || 0
    })).sort((a,b) => a.current - b.current);

    // prefer member with free capacity
    const free = members.find(m => m.current < m.capacity);
    const picked = free || members[0] || null;

    res.json({ picked });
  } catch (err) {
    res.status(500).json({ message: "Error auto-assigning", error: err.toString() });
  }
};


export const reassignTasks = async (req, res) => {
  try {
    const teams = await Team.find({ userId: req.user });
    const results = [];

    for (const team of teams) {
      const moved = await reassignForTeam(team, req.user);
      if (moved.length) results.push({ teamId: team._id, moved });
    }

    // return last 5 activity logs for this user
    const recent = await ActivityTask.find({ userId: req.user }).sort({ createdAt: -1 }).limit(5);
    res.json({ results, recent });
  } catch (err) {
    res.status(500).json({ message: "Error reassigning tasks", error: err.toString() });
  }
};
