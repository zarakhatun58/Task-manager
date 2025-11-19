import Task from "../models/taskModel.js";
import Activity from "../models/activityModel.js";

export default async function reassignForTeam(team, userId) {
  const projects = (await import("../models/projectModel.js")).default;
  // find projects for team
  const teamProjects = await projects.find({ teamId: team._id }).select("_id");
  const projectIds = teamProjects.map((p) => p._id);

  const tasks = await Task.find({
    projectId: { $in: projectIds },
    status: { $in: ["Pending", "In Progress"] }
  }).sort({ createdAt: 1 }); // oldest first

  // count current tasks per member
  const counts = {};
  for (const m of team.members) counts[m._id.toString()] = 0;
  for (const t of tasks) {
    if (t.assignedMemberId && counts.hasOwnProperty(String(t.assignedMemberId))) {
      counts[String(t.assignedMemberId)]++;
    }
  }

  // free slots
  const freeSlots = {};
  for (const m of team.members) freeSlots[m._id.toString()] = Math.max(0, m.capacity - (counts[m._id.toString()] || 0));

  const moved = [];

  for (const m of team.members) {
    const mid = m._id.toString();
    const over = (counts[mid] || 0) - m.capacity;
    if (over > 0) {
      // selectable movable tasks
      const movable = tasks.filter(t => String(t.assignedMemberId) === mid && t.priority !== "High");
      let toMove = Math.min(over, movable.length);
      for (let i = 0; i < movable.length && toMove > 0; i++) {
        // find recipient
        const recipient = team.members.find(r => freeSlots[r._id.toString()] > 0 && r._id.toString() !== mid);
        if (!recipient) break;
        const task = movable[i];
        const prevName = task.assignedMemberName || 'Unassigned';

        // update task
        task.assignedMemberId = recipient._id.toString();
        task.assignedMemberName = recipient.name;
        await task.save();

        // log
        const msg = `${new Date().toLocaleString()} — Task "${task.title}" reassigned from ${prevName} to ${recipient.name}.`;
        await Activity.create({ userId, message: msg });

        counts[mid]--;
        freeSlots[recipient._id.toString()]--;
        moved.push({ taskId: task._id, title: task.title, from: prevName, to: recipient.name });
        toMove--;
      }
    }
  }

  return moved;
}
