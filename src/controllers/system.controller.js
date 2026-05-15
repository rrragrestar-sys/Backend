import { Banner, SystemConfig, Announcement } from "../models/system.model.js";

/* ================================
   BANNER MANAGEMENT
================================ */
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   SYSTEM CONFIG
================================ */
export const getSystemConfig = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ key: req.params.key });
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSystemConfig = async (req, res) => {
  try {
    const { key, value } = req.body;
    const config = await SystemConfig.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ANNOUNCEMENTS
================================ */
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ 
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
