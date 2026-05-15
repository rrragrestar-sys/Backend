import { Router } from "express";
import { submitVerification, getPendingVerifications, updateVerificationStatus } from "../controllers/verification.controller.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/submit", authMiddleware, uploadSingle("document"), submitVerification);

// Admin routes
router.get("/pending", authMiddleware, adminOnly, getPendingVerifications);
router.patch("/status/:id", authMiddleware, adminOnly, updateVerificationStatus);

export default router;
