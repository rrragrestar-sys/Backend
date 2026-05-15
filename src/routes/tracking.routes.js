import express from "express";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware.js";
import {
  updateLocation,
  getLiveLocations,
  getLocationHistory
} from "../controllers/tracking.controller.js";

const router = express.Router();

// Publicly logged-in users tracking update
router.post("/update", authMiddleware, updateLocation);

// Admin-only tracking tools
router.get("/admin/live", authMiddleware, adminOnly, getLiveLocations);
router.get("/admin/history/:role/:id", authMiddleware, adminOnly, getLocationHistory);

export default router;
