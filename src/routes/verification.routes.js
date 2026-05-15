import express from "express";
import {
  submitVerification,
  getPendingVerifications,
  updateVerificationStatus,
} from "../controllers/verification.controller.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Provider Routes
router.post(
  "/submit",
  authMiddleware,
  upload.single("document"),
  submitVerification
);

// Admin Routes
router.get("/pending", authMiddleware, adminOnly, getPendingVerifications);
router.patch("/status/:id", authMiddleware, adminOnly, updateVerificationStatus);

export default router;
