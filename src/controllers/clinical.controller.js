import { Prescription } from "../models/prescription.model.js";
import { VisitReport } from "../models/visitReport.model.js";
import { Booking } from "../models/booking.model.js";
import { generatePrescriptionPDF, generateVisitReportPDF } from "../utils/pdfGenerator.js";

export const createPrescription = async (req, res) => {
  try {
    const { bookingId, medications, advice, nextFollowUp } = req.body;
    const doctorId = req.user.id;

    const booking = await Booking.findById(bookingId).populate("userId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const prescription = await Prescription.create({
      bookingId,
      patientId: booking.userId._id,
      doctorId,
      medications,
      advice,
      nextFollowUp
    });

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctorId", "name specialization")
      .populate("patientId", "name dob gender");

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    const pdfData = await generatePrescriptionPDF({
      doctorName: prescription.doctorId.name,
      specialization: prescription.doctorId.specialization,
      patientName: prescription.patientId.name,
      patientAge: prescription.patientId.dob ? new Date().getFullYear() - new Date(prescription.patientId.dob).getFullYear() : "N/A",
      patientGender: prescription.patientId.gender,
      medications: prescription.medications,
      advice: prescription.advice
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=prescription-${req.params.id}.pdf`);
    res.send(pdfData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createVisitReport = async (req, res) => {
  try {
    const { bookingId, vitals, chiefComplaints, diagnosis, observations } = req.body;
    const providerId = req.user.id;
    const providerType = req.user.role;

    const booking = await Booking.findById(bookingId).populate("userId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const report = await VisitReport.create({
      bookingId,
      patientId: booking.userId._id,
      providerId,
      providerType,
      vitals,
      chiefComplaints,
      diagnosis,
      observations
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVisitReportPDF = async (req, res) => {
  try {
    const report = await VisitReport.findById(req.params.id)
      .populate("patientId", "name");

    if (!report) return res.status(404).json({ message: "Report not found" });

    const pdfData = await generateVisitReportPDF({
      patientName: report.patientId.name,
      vitals: report.vitals,
      chiefComplaints: report.chiefComplaints,
      diagnosis: report.diagnosis,
      observations: report.observations
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=visit-report-${req.params.id}.pdf`);
    res.send(pdfData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
