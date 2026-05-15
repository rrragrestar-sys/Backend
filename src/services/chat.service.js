import { Message } from "../models/message.model.js";
import { socketService } from "./socket.service.js";

class ChatService {
  async getHistory(userId, partnerId) {
    return await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });
  }

  async sendMessage(senderId, receiverId, text) {
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    // Also emit via socket if online
    socketService.emitToUser(receiverId, "receive_message", message);

    return message;
  }
}

export const chatService = new ChatService();
