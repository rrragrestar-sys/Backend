import mongoose from "mongoose";

/* ================================
   BANNER SCHEMA
================================ */
const bannerSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  imageUrl: { type: String, required: true },
  link: { type: String },
  target: { type: String, enum: ["USER", "DOCTOR", "NURSE", "ALL"], default: "ALL" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

/* ================================
   SYSTEM CONFIG SCHEMA
================================ */
const systemConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., "PRICING", "GLOBAL_SETTINGS"
  value: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

/* ================================
   ANNOUNCEMENT SCHEMA
================================ */
const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  target: { type: String, enum: ["USER", "DOCTOR", "NURSE", "ALL"], default: "ALL" },
  active: { type: Boolean, default: true },
  expiresAt: { type: Date }
}, { timestamps: true });

export const Banner = mongoose.model("Banner", bannerSchema);
export const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export const Announcement = mongoose.model("Announcement", announcementSchema);
