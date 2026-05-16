import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { socketService } from "../services/socket.service.js";

export const getRecentChats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Aggregate to find unique users messaged recently
    const recentMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userId] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $limit: 20 },
    ]);

    // Populate user details
    const populatedChats = await Promise.all(
      recentMessages.map(async (chat) => {
        const user = await User.findById(chat._id).select("name profileImage");
        return {
          user,
          lastMessage: chat.lastMessage,
        };
      })
    );

    res.json({ success: true, data: populatedChats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text, attachments } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
      attachments,
    });

    // Emit via socket
    socketService.emitToUser(receiverId, "new_message", message);

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
