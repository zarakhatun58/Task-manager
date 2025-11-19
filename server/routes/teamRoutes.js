import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createTeam, getTeams } from "../controllers/teamController.js";

const router = express.Router();

router.post("/", auth, createTeam);
router.get("/", auth, getTeams);

export default router;
