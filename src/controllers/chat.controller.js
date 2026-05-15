import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

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

    res.json({ success: true, chats: populatedChats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
