import { Router } from "express";
import { 
  getRecentChats, 
  getChatHistory, 
  sendMessage 
} from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/recent", getRecentChats);
router.get("/history/:partnerId", getChatHistory);
router.post("/send", sendMessage);

export default router;
