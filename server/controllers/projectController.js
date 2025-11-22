import TaskProject from "../models/projectModel.js";

export const createProject = async (req, res) => {
  try {
    const { name, teamId, description } = req.body;
    if (!name || !teamId) {
      return res.status(400).json({ message: "Name and teamId are required" });
    }

    const project = await TaskProject.create({
      userId: req.user,
      name,
      teamId,
      description: description || "",
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET ALL PROJECTS
export const getProjects = async (req, res) => {
  try {
    const projects = await TaskProject.find({ userId: req.user });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// UPDATE PROJECT
export const updateProject = async (req, res) => {
  try {
    const { name, teamId, description } = req.body;
    const project = await TaskProject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { name, teamId, description },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE PROJECT
export const deleteProject = async (req, res) => {
  try {
    const project = await TaskProject.findOneAndDelete({
      _id: req.params.id,
      userId: req.user,
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
