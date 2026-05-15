import { Router } from "express";
import { getTasks, updateTaskStatus } from "../controllers/task.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getTasks);
router.put("/:id", updateTaskStatus);

export default router;
