import { Doctor } from "../models/doctor.model.js";

export const submitVerification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a document" });
    }

    const doctorId = req.user.id;
    const documentUrl = req.file.location; // S3 URL

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { 
        $set: { 
          verificationStatus: 0, // Reset to PENDING
          licenseDocument: documentUrl 
        } 
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Verification document submitted successfully",
      documentUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPendingVerifications = async (req, res) => {
  try {
    const { ProviderVerification } = await import("../models/providerVerification.model.js");
    const verifications = await ProviderVerification.find({ status: "PENDING" }).populate("providerId", "name email specialization licenseNo profileImage");
    res.json({ success: true, data: verifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const { ProviderVerification } = await import("../models/providerVerification.model.js");
    
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const verification = await ProviderVerification.findById(id);
    if (!verification) {
      return res.status(404).json({ success: false, message: "Verification record not found" });
    }

    verification.status = status;
    verification.remarks = remarks;
    verification.adminId = req.user.id;
    await verification.save();

    const providerStatus = status === "APPROVED" ? 1 : 2;
    await Doctor.findByIdAndUpdate(verification.providerId, { verificationStatus: providerStatus });

    res.json({ success: true, message: `Provider ${status.toLowerCase()} successfully`, data: verification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
