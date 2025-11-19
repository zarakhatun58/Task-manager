import Team from "../models/teamModel.js";

export const createTeam = async (req, res) => {
  const team = await Team.create({
    userId: req.user,
    name: req.body.name,
    members: req.body.members
  });
  res.json(team);
};

export const getTeams = async (req, res) => {
  const teams = await Team.find({ userId: req.user });
  res.json(teams);
};
