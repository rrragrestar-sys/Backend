import { Router } from "express";
import { updateLocation, getLiveDoctors } from "../controllers/tracking.controller.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateLocationSchema } from "../validations/tracking.validation.js";

const router = Router();

router.post(
  "/update",
  authMiddleware,
  roleMiddleware("PATIENT", "DOCTOR"),
  validate(updateLocationSchema),
  updateLocation
);

// Admin routes
router.get("/admin/live", authMiddleware, adminOnly, getLiveDoctors);

export default router;
