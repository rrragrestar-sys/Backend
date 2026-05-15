import { Router } from "express";
import { submitVerification } from "../controllers/verification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const router = Router();

router.post("/submit", authMiddleware, uploadSingle("document"), submitVerification);

export default router;
