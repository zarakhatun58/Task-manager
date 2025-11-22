import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { createTeam, getTeams,updateTeam , deleteTeam} from "../controllers/teamController.js";

const router = express.Router();

router.post("/", auth, createTeam);
router.get("/", auth, getTeams);
router.put("/:id", auth, updateTeam);
router.delete("/:id", auth, deleteTeam);


export default router;
