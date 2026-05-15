import { User } from "../models/user.model.js";
import { socketService } from "./socket.service.js";

class TrackingService {
  async updateLocation(userId, latitude, longitude) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: { latitude, longitude },
        lastLocationAt: new Date(),
      },
      { new: true }
    );

    // Broadcast to live-tracking room via standardized method
    socketService.broadcastToTracking({
      userId,
      latitude,
      longitude,
      timestamp: new Date(),
    });

    return user;
  }
}

export const trackingService = new TrackingService();
