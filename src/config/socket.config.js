import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user-specific room for private messaging
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Handle live location updates
    socket.on("update_location", (data) => {
      // data: { latitude, longitude, providerType, userId }
      // Broadcast to 'live-tracking' room
      io.to("live-tracking").emit("location_updated", data);
    });

    // Join live-tracking room (for admin/patient apps)
    socket.on("watch_tracking", () => {
      socket.join("live-tracking");
    });

    // Handle private messages
    socket.on("send_message", (data) => {
      // data: { receiverId, senderId, text, timestamp }
      io.to(data.receiverId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
