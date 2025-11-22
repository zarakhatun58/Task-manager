import express from "express";
import auth from "../middlewares/authMiddleware.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", auth, createProject);
router.get("/", auth, getProjects);
router.put("/:id", auth, updateProject);
router.delete("/:id", auth, deleteProject);

export default router;
