import { Router } from "express";
import {
  registerUser,
  verifyEmailOtp,
  loginUser,
  getMyProfile,
  getAllUsers,
} from "../controllers/user.controller.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
} from "../validations/user.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/verify-otp", validate(verifyOtpSchema), verifyEmailOtp);
router.post("/login", validate(loginSchema), loginUser);

router.get("/me", authMiddleware, getMyProfile);

// Admin routes
router.get("/", authMiddleware, adminOnly, getAllUsers);

export default router;