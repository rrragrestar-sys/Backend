import mongoose from "mongoose";

const visitReportSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "providerType"
    },
    providerType: {
      type: String,
      required: true,
      enum: ["DOCTOR", "NURSE"]
    },
    vitals: {
      temperature: String,
      bloodPressure: String,
      pulseRate: String,
      spO2: String,
      weight: String
    },
    chiefComplaints: {
      type: String,
      trim: true
    },
    diagnosis: {
      type: String,
      trim: true
    },
    observations: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

export const VisitReport = mongoose.model("VisitReport", visitReportSchema);
