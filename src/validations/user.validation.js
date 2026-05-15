import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  phone: Joi.string().required().pattern(/^[0-9]{10,15}$/),
  password: Joi.string().required().min(6),
  gender: Joi.string().valid("male", "female", "other").optional(),
  dob: Joi.date().iso().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});
