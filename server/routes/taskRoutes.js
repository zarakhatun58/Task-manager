import express from "express";
import auth from "../middlewares/authMiddleware.js";
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  autoAssign,
  reassignTasks
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", auth, createTask);
router.get("/", auth, getTasks);
router.get("/:taskId", auth, getTask);
router.put("/:taskId", auth, updateTask);
router.delete("/:taskId", auth, deleteTask);

router.post("/auto-assign", auth, autoAssign);
router.post("/reassign", auth, reassignTasks);


export default router;
