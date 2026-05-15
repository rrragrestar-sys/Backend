import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    text: {
      type: String,
      trim: true
    },
    attachments: [
      {
        url: String,
        fileType: String,
        name: String
      }
    ],
    isRead: {
      type: Boolean,
      default: false
    },
    chatType: {
      type: String,
      enum: ["DOCTOR_PATIENT", "SUPPORT"],
      default: "DOCTOR_PATIENT"
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Index for fetching chat history between two users efficiently
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
