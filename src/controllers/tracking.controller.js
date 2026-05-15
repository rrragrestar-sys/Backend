import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Nurse } from "../models/nurse.model.js";
import { LocationLog } from "../models/locationLog.model.js";
import mongoose from "mongoose";

/**
 * Update current location and log to history
 * POST /api/tracking/update
 */
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { id, role } = req.user;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: "latitude and longitude are required" });
    }

    const updateFields = {
      location: { latitude, longitude },
      lastLocationAt: new Date()
    };

    let updatedAccount;

    // Update the live location in the user's specific model
    if (role === "PATIENT") {
      updatedAccount = await User.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    } else if (role === "DOCTOR") {
      updatedAccount = await Doctor.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    } else if (role === "NURSE") {
      updatedAccount = await Nurse.findByIdAndUpdate(id, { $set: updateFields }, { new: true });
    }

    if (!updatedAccount) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    // Log the movement for "all-time" tracking
    await LocationLog.create({
      entityId: id,
      entityType: role,
      location: { latitude, longitude }
    });

    res.status(200).json({
      success: true,
      message: "Location updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get current live locations for all online entities
 * GET /api/tracking/admin/live
 */
export const getLiveLocations = async (req, res) => {
  try {
    const users = await User.find({ location: { $exists: true }, lastLocationAt: { $exists: true } }, "name role location lastLocationAt profilePic");
    const doctors = await Doctor.find({ location: { $exists: true }, lastLocationAt: { $exists: true } }, "name role location lastLocationAt profileImage specialization");
    const nurses = await Nurse.find({ location: { $exists: true }, lastLocationAt: { $exists: true } }, "name role location lastLocationAt");

    const allLocations = [
        ...users.map(u => { const o = u.toObject(); return { ...o, avatar: o.profilePic }; }),
        ...doctors.map(d => { const o = d.toObject(); return { ...o, avatar: o.profileImage }; }),
        ...nurses.map(n => n.toObject())
    ];

    res.status(200).json({
      success: true,
      data: allLocations.sort((a, b) => b.lastLocationAt - a.lastLocationAt)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get historical path for a specific entity
 * GET /api/tracking/admin/history/:role/:id
 */
export const getLocationHistory = async (req, res) => {
  try {
    const { role, id } = req.params;
    const { from, to, limit = 100 } = req.query;

    const query = {
      entityId: new mongoose.Types.ObjectId(id),
      entityType: role.toUpperCase()
    };

    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const history = await LocationLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
