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
