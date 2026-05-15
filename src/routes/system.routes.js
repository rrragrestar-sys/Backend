import express from "express";
import { 
  getBanners, createBanner, deleteBanner,
  getSystemConfig, updateSystemConfig,
  getAnnouncements, createAnnouncement 
} from "../controllers/system.controller.js";
import { authMiddleware, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Admin only for management
router.use(authMiddleware, adminOnly);

router.get("/banners", getBanners);
router.post("/banners", createBanner);
router.delete("/banners/:id", deleteBanner);

router.get("/config/:key", getSystemConfig);
router.post("/config", updateSystemConfig);

router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);

export default router;
