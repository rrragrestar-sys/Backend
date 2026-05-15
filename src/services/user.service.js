import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { otpService } from "./otp.service.js";
import { sendEmail } from "./email.service.js";

class UserService {
  async register(userData) {
    const { name, email, phone, password, gender, dob } = userData;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      gender,
      dob,
    });

    const otp = otpService.generateOTP();
    await OTP.findOneAndDelete({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail({ email, subject: "Verify Your Email", otp, name });

    return { success: true, message: "User registered. OTP sent to email." };
  }

  async verifyOtp(email, otp) {
    const record = await OTP.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    await User.updateOne({ email }, { isEmailVerified: true });
    await OTP.deleteOne({ _id: record._id });

    return { success: true, message: "Email verified successfully" };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLoginAt = new Date();
    await user.save();

    return { success: true, token };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

export const userService = new UserService();
