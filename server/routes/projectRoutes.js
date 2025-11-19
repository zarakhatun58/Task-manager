import express from "express";
import auth from "../middlewares/authMiddleware.js";
import {
  createProject,
  getProjects
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", auth, createProject);
router.get("/", auth, getProjects);

export default router;
