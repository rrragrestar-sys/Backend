import { ProviderVerification } from "../models/providerVerification.model.js";
import { Doctor } from "../models/doctor.model.js";
import { Nurse } from "../models/nurse.model.js";
import { storageService } from "../services/storage.service.js";

/* ================================
   SUBMIT VERIFICATION (PROVIDER)
================================ */

export const submitVerification = async (req, res) => {
  try {
    const { providerType } = req.user; // Assumes providerType is in token
    const providerId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Verification document is required" });
    }

    // Upload to S3
    const documentUrl = await storageService.uploadFile(req.file, "verifications");

    // Create verification record
    const verification = await ProviderVerification.create({
      providerType,
      providerId,
      documentUrl,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Verification documents submitted successfully",
      verification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   GET PENDING VERIFICATIONS (ADMIN)
================================ */

export const getPendingVerifications = async (req, res) => {
  try {
    const verifications = await ProviderVerification.find({ status: "PENDING" })
      .populate("providerId");

    res.json({
      success: true,
      count: verifications.length,
      verifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   UPDATE VERIFICATION STATUS (ADMIN)
================================ */

export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const adminId = req.user.id;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use APPROVED or REJECTED." });
    }

    const verification = await ProviderVerification.findById(id);
    if (!verification) {
      return res.status(404).json({ message: "Verification record not found" });
    }

    verification.status = status;
    verification.adminId = adminId;
    verification.remarks = remarks;
    await verification.save();

    // Update Provider Model
    const statusMap = { APPROVED: 1, REJECTED: 2 };
    const Model = verification.providerType === "DOCTOR" ? Doctor : Nurse;

    await Model.findByIdAndUpdate(verification.providerId, {
      verificationStatus: statusMap[status],
    });

    res.json({
      success: true,
      message: `Verification ${status.toLowerCase()} successfully`,
      verification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
