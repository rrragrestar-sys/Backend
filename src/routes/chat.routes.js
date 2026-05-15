import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getChatHistory,
  getRecentChats,
  markChatAsRead,
  sendMessage,
  getChatPartners
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/history/:partnerId", getChatHistory);
router.get("/recent", getRecentChats);
router.get("/partners", getChatPartners);
router.patch("/read/:partnerId", markChatAsRead);
router.post("/send", sendMessage);

export default router;
