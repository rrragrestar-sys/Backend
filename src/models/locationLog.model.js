import mongoose from "mongoose";

const locationLogSchema = new mongoose.Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "NURSE"],
      required: true,
      index: true
    },
    location: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    versionKey: false
  }
);

// Compound index for efficient historical queries
locationLogSchema.index({ entityId: 1, timestamp: -1 });

export const LocationLog = mongoose.model("LocationLog", locationLogSchema);
