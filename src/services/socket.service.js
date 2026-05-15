import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "../models/message.model.js";
import { Booking } from "../models/booking.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Nurse } from "../models/nurse.model.js";

class SocketService {
  _io = null;
  _userSocketMap = new Map(); // userId -> socketId


  init(server) {
    this._io = new Server(server, {
      cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"]
      }
    });

    // Authentication Middleware
    this._io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
      
      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        console.error("Socket authentication error:", err.message);
        return next(new Error("Authentication error: Invalid token"));
      }
    });

    this._io.on("connection", (socket) => {
      const userId = socket.user.id;
      this._userSocketMap.set(userId, socket.id);
      
      console.log(`[SOCKET] User connected: ${userId} (Socket: ${socket.id})`);

      socket.on("send_message", async (data) => {
        try {
          const { receiverId, text, attachments, chatType } = data;
          
          if (!receiverId || (!text && (!attachments || attachments.length === 0))) {
            return;
          }

          // Security: Only allow chat if there's a confirmed booking
          const senderRole = socket.user.role;
          if (senderRole === "PATIENT") {
            const hasBooking = await Booking.findOne({
              userId: userId,
              providerId: receiverId,
              status: "CONFIRMED"
            });
            if (!hasBooking) {
              return socket.emit("error", { message: "You can only message doctors with whom you have a confirmed booking." });
            }
          } else if (senderRole === "DOCTOR") {
            const hasBooking = await Booking.findOne({
              userId: receiverId,
              providerId: userId,
              status: "CONFIRMED"
            });
            if (!hasBooking) {
              return socket.emit("error", { message: "You can only message patients who have a confirmed booking with you." });
            }
          }

          // Save to Database
          const newMessage = await Message.create({
            sender: userId,
            receiver: receiverId,
            text,
            attachments: attachments || [],
            chatType: chatType || "DOCTOR_PATIENT"
          });

          // Send to Receiver
          const receiverSocketId = this._userSocketMap.get(receiverId);
          if (receiverSocketId) {
            this._io.to(receiverSocketId).emit("receive_message", newMessage);
            // Notify receiver to stop showing typing indicator
            this._io.to(receiverSocketId).emit("partner_typing", { partnerId: userId, isTyping: false });
          }

          // Confirm to Sender
          socket.emit("message_sent", newMessage);

        } catch (error) {
          console.error("[SOCKET] Error sending message:", error.message);
          socket.emit("error", { message: "Failed to send message" });
        }
      });

      socket.on("typing", (data) => {
        const { receiverId, isTyping } = data;
        const receiverSocketId = this._userSocketMap.get(receiverId);
        if (receiverSocketId) {
          this._io.to(receiverSocketId).emit("partner_typing", { 
            partnerId: userId, 
            isTyping: isTyping 
          });
        }
      });

      socket.on("mark_as_read", async (data) => {
        try {
          const { partnerId } = data;
          await Message.updateMany(
            { sender: partnerId, receiver: userId, isRead: false },
            { $set: { isRead: true } }
          );

          const partnerSocketId = this._userSocketMap.get(partnerId);
          if (partnerSocketId) {
            this._io.to(partnerSocketId).emit("messages_read_by_partner", { readerId: userId });
          }
        } catch (error) {
          console.error("[SOCKET] Error marking read:", error.message);
        }
      });

      socket.on("update_location", async (data) => {
        try {
          const { latitude, longitude, providerType } = data;
          if (!latitude || !longitude) return;

          // Update in Database
          const Model = providerType === "DOCTOR" ? Doctor : Nurse;
          await Model.findByIdAndUpdate(userId, {
            location: { latitude, longitude },
            lastLocationAt: new Date()
          });

          // Broadcast to all connected clients (Live Map)
          this._io.emit("live_location_update", {
            providerId: userId,
            providerType,
            latitude,
            longitude
          });

        } catch (error) {
          console.error("[SOCKET] Location update error:", error.message);
        }
      });

      socket.on("disconnect", () => {
        this._userSocketMap.delete(userId);
        console.log(`[SOCKET] User disconnected: ${userId}`);
      });
    });
  }

  notifyUser(userId, title, body, type, data = {}) {
    if (!this._io) return false;

    const notification = {
      title,
      body,
      type,
      data,
      timestamp: new Date()
    };

    const socketId = this._userSocketMap.get(userId.toString());
    if (socketId) {
      this._io.to(socketId).emit("notification", notification);
      return true;
    }
    return false;
  }

  emitToUser(userId, event, data) {
    if (!this._io) return false;
    
    const socketId = this._userSocketMap.get(userId.toString());
    if (socketId) {
      this._io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  get io() {
    return this._io;
  }
}

export const socketService = new SocketService();
