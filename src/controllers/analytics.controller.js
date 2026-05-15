import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Nurse } from "../models/nurse.model.js";
import { Booking } from "../models/booking.model.js";

/* ================================
   REVENUE STATS
================================ */
export const getRevenueStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { status: "SUCCESS" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          totalRevenue: { $sum: "$totalAmount" },
          platformFees: { $sum: "$platformFee" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   USER GROWTH
================================ */
export const getUserGrowth = async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const doctorStats = await Doctor.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({ 
      success: true, 
      data: { 
        users: userStats, 
        doctors: doctorStats 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   SERVICE HEATMAP
================================ */
export const getServiceHeatmap = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "COMPLETED" })
      .populate("userId", "location")
      .select("userId");

    const heatmapData = bookings
      .filter(b => b.userId && b.userId.location)
      .map(b => ({
        lat: b.userId.location.latitude,
        lng: b.userId.location.longitude
      }));

    res.json({ success: true, data: heatmapData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
