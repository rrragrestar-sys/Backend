import { Router } from "express";
import {
  getAllDoctors,
  getDoctorById,
  loginDoctor,
  updateDoctorProfile
} from "../controllers/doctor.controller.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.middleware.js";
import { loginSchema, updateProfileSchema, validateRequest } from "../validations/doctor.validation.js";

const router = Router();

router.post("/login", validateRequest(loginSchema), loginDoctor);
router.get("/", authMiddleware, getAllDoctors);
router.get("/:id", authMiddleware, getDoctorById);
router.put("/:id", authMiddleware, roleMiddleware(["DOCTOR", "ADMIN"]), validateRequest(updateProfileSchema), updateDoctorProfile);

export default router;