import Team from "../models/teamModel.js";

export const createTeam = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name)
      return res.status(400).json({ message: "Team name is required" });

    const team = await Team.create({
      userId: req.user,
      name,
      members: members || []
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ userId: req.user });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
