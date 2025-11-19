import Task from "../models/taskModel.js";
import Team from "../models/teamModel.js";
import { logActivity } from "../utils/activityLogger.js";

export const createTask = async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
};

export const getTasks = async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
};

// Auto Reassign Algorithm
export const reassignTasks = async (req, res) => {
  const teams = await Team.find();
  const tasks = await Task.find();

  for (const team of teams) {
    const members = team.members.map((m) => ({
      ...m._doc,
      currentTasks: tasks.filter((t) => t.assignedTo === m.name).length
    }));

    for (const member of members) {
      if (member.currentTasks > member.capacity) {
        const overload = member.currentTasks - member.capacity;

        const movableTasks = tasks
          .filter((t) => t.assignedTo === member.name)
          .filter((t) => t.priority !== "High")
          .slice(0, overload);

        for (const task of movableTasks) {
          const target = members.find((m) => m.currentTasks < m.capacity);
          if (!target) break;

          await Task.findByIdAndUpdate(task._id, { assignedTo: target.name });

          logActivity(
            `Task "${task.title}" reassigned from ${member.name} to ${target.name}.`
          );

          member.currentTasks--;
          target.currentTasks++;
        }
      }
    }
  }

  res.json({ message: "Reassignment complete" });
};
