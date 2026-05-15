import { Router } from "express";
import {
  registerUser,
  verifyEmailOtp,
  loginUser,
  getMyProfile,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
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

export default router;