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
