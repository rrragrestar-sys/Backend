import { Doctor } from "../models/doctor.model.js";

class DoctorService {
  async listDoctors() {
    return await Doctor.find({ isDeleted: { $ne: 1 } });
  }

  async getDoctorProfile(id) {
    const doctor = await Doctor.findOne({ _id: id, isDeleted: { $ne: 1 } });
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    return doctor;
  }

  async login(username, password) {
    const doctor = await Doctor.findOne({ username }).select("+password");
    if (!doctor) {
      throw new Error("Invalid username or password");
    }

    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid username or password");
    }

    return doctor;
  }

  async updateProfile(id, updateData) {
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    return doctor;
  }
}

export const doctorService = new DoctorService();
