import { Server } from "socket.io";
import jwt from "jsonwebtoken";

class SocketService {
  _io = null;
  _userSocketMap = new Map(); // userId -> socketId

  init(server) {
    this._io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Auth Middleware
    this._io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.token;
      if (!token) return next(new Error("Auth error"));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error("Invalid token"));
      }
    });

    this._io.on("connection", (socket) => {
      const userId = socket.user.id;
      this._userSocketMap.set(userId, socket.id);
      
      // Join a private room for targeted messaging
      socket.join(`user-${userId}`);
      
      // Join live-tracking room if user is a provider or needs updates
      socket.join("live-tracking");

      console.log(`[SOCKET] User connected: ${userId} to room user-${userId}`);

      socket.on("update_location", (data) => {
        // Broadcoast to live-tracking room
        // data: { latitude, longitude, providerType }
        this.broadcastToTracking({
          ...data,
          userId: socket.user.id,
          timestamp: new Date()
        });
      });

      socket.on("disconnect", () => {
        this._userSocketMap.delete(userId);
        console.log(`[SOCKET] User disconnected: ${userId}`);
      });
    });
  }

  emitToUser(userId, event, data) {
    if (!this._io) return false;
    // Emit to the user's private room
    this._io.to(`user-${userId}`).emit(event, data);
    return true;
  }

  broadcastToTracking(data) {
    if (!this._io) return false;
    this._io.to("live-tracking").emit("live_location_update", data);
    return true;
  }

  get io() {
    return this._io;
  }
}

export const socketService = new SocketService();
