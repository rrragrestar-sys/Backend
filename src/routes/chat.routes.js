import { Router } from "express";
import { getRecentChats } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/recent", authMiddleware, getRecentChats);

export default router;
