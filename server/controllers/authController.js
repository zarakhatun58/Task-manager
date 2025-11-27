import TaskUser from "../models/taskUserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await TaskUser.findOne({ email });
  if (exists) return res.json({ message: "Email already used" });

  const hash = await bcrypt.hash(password, 10);

  const user = await TaskUser.create({ name, email, password: hash });

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token, user });
};


export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await TaskUser.findOne({ email });
  if (!user) return res.json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user });
};
