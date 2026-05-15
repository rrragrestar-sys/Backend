import { trackingService } from "../services/tracking.service.js";

export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await trackingService.updateLocation(req.user.id, latitude, longitude);
    res.json({ success: true, message: "Location updated", location: user.location });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLiveDoctors = async (req, res) => {
  try {
    const { Doctor } = await import("../models/doctor.model.js");
    const liveDoctors = await Doctor.find({
      isOnline: 1,
      "location.latitude": { $exists: true, $ne: null },
      "location.longitude": { $exists: true, $ne: null }
    }).select("name email phone specialization profileImage location lastLocationAt isOnline clinicName clinicAddress");
    
    res.json({ success: true, count: liveDoctors.length, data: liveDoctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
