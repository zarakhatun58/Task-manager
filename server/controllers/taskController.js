import Task from "../models/taskModel.js";
import TaskProject from "../models/projectModel.js";
import Team from "../models/teamModel.js";
import ActivityTask from "../models/activityModel.js";
import reassignForTeam from "../utils/reassign.js";

// Count tasks per member in a team
async function countTasksForTeam(teamId) {
  const projects = await TaskProject.find({ teamId }).select("_id");
  const projectIds = projects.map(p => p._id);
  const tasks = await Task.find({
    projectId: { $in: projectIds },
    status: { $in: ["Pending", "In Progress"] }
  });

  const counts = {};
  for (const t of tasks) {
    const mid = t.assignedTo ? t.assignedTo.toString() : null;
    counts[mid] = (counts[mid] || 0) + 1;
  }
  return counts;
}

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, status } = req.body;

    if (!title || !projectId)
      return res.status(400).json({ message: "title and projectId required" });

    const project = await TaskProject.findById(projectId);
    if (!project) return res.status(400).json({ message: "Project not found" });

    const team = await Team.findById(project.teamId);
    if (!team) return res.status(400).json({ message: "Team for project not found" });

    // Validate assigned member
    let warning = null;
    if (assignedTo) {
      const member = team.members.find(m => String(m._id) === String(assignedTo));
      if (!member) return res.status(400).json({ message: "Assigned member not part of project team" });

      const counts = await countTasksForTeam(team._id);
      const memberCount = counts[assignedTo] || 0;
      if (memberCount >= member.capacity) {
        warning = `${member.name} has ${memberCount} tasks but capacity is ${member.capacity}. Assign anyway?`;
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId,
      assignedTo: assignedTo || null,
      priority: priority || "Medium",
      status: status || "Pending",
    });

    await ActivityTask.create({
      userId: req.user,
      message: `Task "${task.title}" created and assigned to ${assignedTo || "unassigned"}`
    });

    res.status(201).json({ task, warning });
  } catch (err) {
    res.status(500).json({ message: "Error creating task", error: err.toString() });
  }
};

// GET TASKS
export const getTasks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.projectId) filter.projectId = req.query.projectId;
    if (req.query.memberId) filter.assignedTo = req.query.memberId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 });


    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.toString() });
  }
};

// GET SINGLE TASK
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error fetching task", error: err.toString() });
  }
};

// UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    const updates = {};
    const allowed = ["title", "description", "assignedTo", "priority", "status"];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    // Validate assigned member
    if (updates.assignedTo) {
      const task = await Task.findById(req.params.taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });

      const project = await TaskProject.findById(task.projectId);
      if (!project) return res.status(400).json({ message: "Project not found" });

      const team = await Team.findById(project.teamId);
      if (!team) return res.status(400).json({ message: "Team not found" });

      const member = team.members.find(m => String(m._id) === String(updates.assignedTo));
      if (!member) return res.status(400).json({ message: "Assigned member not part of project team" });
    }

    // Update task
    await Task.findByIdAndUpdate(
      req.params.taskId,
      { ...updates, assignedTo: updates.assignedTo || null },
      { new: true }
    );

    // Retrieve updated task with populated assignedTo
    const updatedTask = await Task.findById(req.params.taskId);

    await ActivityTask.create({ userId: req.user, message: `Task "${updatedTask.title}" updated.` });

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err.toString() });
  }
};


// DELETE TASK
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

// AUTO ASSIGN TASK
export const autoAssign = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ message: "projectId required" });

    const project = await TaskProject.findById(projectId);
    if (!project) return res.status(400).json({ message: "Project not found" });

    const team = await Team.findById(project.teamId);
    const counts = await countTasksForTeam(team._id);

    const members = team.members
      .map(m => ({
        id: m._id.toString(),
        name: m.name,
        capacity: m.capacity,
        current: counts[m._id.toString()] || 0
      }))
      .sort((a, b) => a.current - b.current);

    const free = members.find(m => m.current < m.capacity);
    const picked = free || members[0] || null;

    res.json({ picked });
  } catch (err) {
    res.status(500).json({ message: "Error auto-assigning", error: err.toString() });
  }
};

// REASSIGN TASKS
export const reassignTasks = async (req, res) => {
  try {
    const teams = await Team.find({ userId: req.user });
    const results = [];

    for (const team of teams) {
      const moved = await reassignForTeam(team, req.user);
      if (moved.length) results.push({ teamId: team._id, moved });
    }

    const recent = await ActivityTask.find({ userId: req.user }).sort({ createdAt: -1 }).limit(5);
    res.json({ results, recent });
  } catch (err) {
    res.status(500).json({ message: "Error reassigning tasks", error: err.toString() });
  }
};
