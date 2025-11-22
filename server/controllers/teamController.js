import Team from "../models/teamModel.js";

export const createTeam = async (req, res) => {
  try {
    const { name, members } = req.body;
 console.log("REQ.USER =", req.user);   
    console.log("BODY =", req.body);
    if (!name)
      return res.status(400).json({ message: "Team name is required" });

    const team = await Team.create({
      userId: req.user,
      name,
      members
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

export const updateTeam = async (req, res) => {
  try {
    const { name, members } = req.body;

    const team = await Team.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      { name, members },
      { new: true }
    );

    if (!team)
      return res.status(404).json({ message: "Team not found" });

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findOneAndDelete({
      _id: req.params.id,
      userId: req.user
    });

    if (!team)
      return res.status(404).json({ message: "Team not found" });

    res.json({ message: "Team deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

