import express from "express";
import auth from "../middlewares/authMiddleware.js";
import {
  createTask,
  getTasks,
  reassignTasks
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", auth, createTask);
router.get("/", auth, getTasks);
router.post("/reassign", auth, reassignTasks);

export default router;
