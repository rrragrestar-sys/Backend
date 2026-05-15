import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { Booking } from "../models/booking.model.js";
import { socketService } from "../services/socket.service.js";

/**
 * Get chat history between current user and a partner
 * GET /api/chat/history/:partnerId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params; 
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId }
      ]
    })
      .sort({ createdAt: -1 }) // Get most recent first for pagination
      .skip((page - 1) * limit)
      .limit(Number.parseInt(limit));

    res.status(200).json({
      success: true,
      data: [...messages].reverse() // Return in chronological order (oldest to newest)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get list of recent chats with last message and unread count
 * GET /api/chat/recent
 */
export const getRecentChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const recentMessages = await Message.aggregate([
      // 1. Find all messages involving the user
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      // 2. Sort by newest first
      {
        $sort: { createdAt: -1 }
      },
      // 3. Group by partner ID
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      // 4. Lookup partner details from all possible collections
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "patientInfo"
        }
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo"
        }
      },
      {
        $lookup: {
          from: "nurses",
          localField: "_id",
          foreignField: "_id",
          as: "nurseInfo"
        }
      },
      // 5. Select the primary info found
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          unreadCount: 1,
          partner: {
            $ifNull: [
              { $arrayElemAt: ["$patientInfo", 0] },
              { $arrayElemAt: ["$doctorInfo", 0] },
              { $arrayElemAt: ["$nurseInfo", 0] }
            ]
          }
        }
      },
      // Filter for Doctors only if the requester is a PATIENT and requested "recent conversations with doctors"
      {
        $match: {
          $expr: {
            $cond: [
              { $eq: [req.user.role, "PATIENT"] },
              { $ne: [{ $size: { $ifNull: ["$doctorInfo", []] } }, 0] },
              true // Do not filter if requester is not a patient
            ]
          }
        }
      },
      // 6. Project and normalize fields
      {
        $project: {
          _id: 1,
          lastMessage: {
            text: "$lastMessage.text",
            createdAt: "$lastMessage.createdAt",
            sender: "$lastMessage.sender",
            attachments: "$lastMessage.attachments"
          },
          unreadCount: 1,
          partnerInfo: {
            _id: "$_id",
            name: "$partner.name",
            role: { $ifNull: ["$partner.role", "DOCTOR"] },
            avatar: { $ifNull: ["$partner.profilePic", "$partner.profileImage"] },
            specialization: "$partner.specialization",
            isOnline: "$partner.isOnline"
          }
        }
      },
      // 7. Sort final list by last message time
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: recentMessages
    });
  } catch (error) {
    console.error("Error in getRecentChats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get list of people the user can chat with (based on bookings)
 * GET /api/chat/partners
 */
export const getChatPartners = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const role = req.user.role;

    let partners = [];

    if (role === "PATIENT") {
      // Find all doctors this patient has confirmed bookings with
      const bookings = await Booking.aggregate([
        { $match: { userId: userId, status: "CONFIRMED", providerType: "DOCTOR" } },
        {
          $group: {
            _id: "$providerId",
            providerType: { $first: "$providerType" }
          }
        },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctorInfo"
          }
        },
        {
          $lookup: {
            from: "nurses",
            localField: "_id",
            foreignField: "_id",
            as: "nurseInfo"
          }
        },
        {
          $project: {
            _id: 1,
            info: {
              $ifNull: [
                { $arrayElemAt: ["$doctorInfo", 0] },
                { $arrayElemAt: ["$nurseInfo", 0] }
              ]
            }
          }
        },
        {
          $project: {
            _id: 1,
            name: "$info.name",
            role: { $ifNull: ["$info.role", "DOCTOR"] },
            avatar: { $ifNull: ["$info.profilePic", "$info.profileImage"] },
            specialization: "$info.specialization",
            isOnline: "$info.isOnline"
          }
        }
      ]);
      partners = bookings;
    } else if (role === "DOCTOR") {
      // Find all patients who have booked this doctor
      const bookings = await Booking.aggregate([
        { $match: { providerId: userId, status: "CONFIRMED" } },
        {
          $group: {
            _id: "$userId"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo"
          }
        },
        {
          $project: {
            _id: 1,
            info: { $arrayElemAt: ["$userInfo", 0] }
          }
        },
        {
          $project: {
            _id: 1,
            name: "$info.name",
            role: "$info.role",
            avatar: "$info.profilePic",
            isOnline: "$info.isOnline"
          }
        }
      ]);
      partners = bookings;
    }

    res.status(200).json({
      success: true,
      data: partners
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mark all messages from a partner as read
 * PATCH /api/chat/read/:partnerId
 */
export const markChatAsRead = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;

    const result = await Message.updateMany(
      { sender: partnerId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Notify partner that messages have been read
    socketService.emitToUser(partnerId, "messages_read_by_partner", { readerId: userId });

    res.status(200).json({
      success: true,
      message: "Chat marked as read",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send a new message
 * POST /api/chat/send
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, attachments, chatType } = req.body;
    const senderId = req.user.id;

    if (!receiverId || (!text && (!attachments || attachments.length === 0))) {
      return res.status(400).json({ success: false, message: "Missing receiverId or message content" });
    }

    // Security: Only allow chat if there's a confirmed booking
    if (req.user.role === "PATIENT") {
      const hasBooking = await Booking.findOne({
        userId: senderId,
        providerId: receiverId,
        status: "CONFIRMED"
      });

      if (!hasBooking) {
        return res.status(403).json({
          success: false,
          message: "You can only message doctors with whom you have a confirmed booking."
        });
      }
    } else if (req.user.role === "DOCTOR") {
      const hasBooking = await Booking.findOne({
        userId: receiverId, // Correctly check for patient who booked
        providerId: senderId,
        status: "CONFIRMED"
      });

      if (!hasBooking) {
        return res.status(403).json({
          success: false,
          message: "You can only message patients who have a confirmed booking with you."
        });
      }
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: text,
      attachments: attachments || [],
      chatType: chatType || "DOCTOR_PATIENT",
      isRead: false
    });

    // Real-time notification to receiver
    socketService.emitToUser(receiverId, "receive_message", newMessage);
    // Pulse typing status (off) for the receiver
    socketService.emitToUser(receiverId, "partner_typing", { partnerId: senderId, isTyping: false });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


