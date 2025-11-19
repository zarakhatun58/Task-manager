import Project from "../models/projectModel.js";

export const createProject = async (req, res) => {
  const project = await Project.create({
    userId: req.user,
    name: req.body.name,
    teamId: req.body.teamId
  });
  res.json(project);
};

export const getProjects = async (req, res) => {
  const projects = await Project.find({ userId: req.user });
  res.json(projects);
};
