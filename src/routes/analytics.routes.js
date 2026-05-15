import express from "express";
import { getRevenueStats, getUserGrowth, getServiceHeatmap } from "../controllers/analytics.controller.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware, adminOnly);

router.get("/revenue", getRevenueStats);
router.get("/growth", getUserGrowth);
router.get("/heatmap", getServiceHeatmap);

export default router;
