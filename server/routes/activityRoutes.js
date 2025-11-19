import express from "express";
import auth from "../middlewares/authMiddleware.js";
import { getActivities } from "../controllers/activityController.js";

const router = express.Router();

router.get("/", auth, getActivities);

export default router;
