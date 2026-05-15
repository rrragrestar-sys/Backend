import { doctorService } from "../services/doctor.service.js";
import jwt from "jsonwebtoken";

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.listDoctors();
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorProfile(req.params.id);
    res.json({ success: true, doctor });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { username, password } = req.body;
    const doctor = await doctorService.login(username, password);
    
    const token = jwt.sign(
      { id: doctor._id, role: doctor.role, username: doctor.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        username: doctor.username,
        name: doctor.name,
        role: doctor.role,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await doctorService.updateProfile(req.params.id, req.body);
    res.json({ success: true, message: "Profile updated successfully", doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
