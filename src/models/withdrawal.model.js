import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "providerType",
      index: true
    },
    providerType: {
      type: String,
      required: true,
      enum: ["DOCTOR", "NURSE"]
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String
    },
    transactionId: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false
  }
);

export const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);
