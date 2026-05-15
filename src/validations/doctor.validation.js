import Joi from "joi";

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  bio: Joi.string().max(500),
  fees: Joi.object({
    video: Joi.number().min(0),
    clinic: Joi.number().min(0),
  }),
  name: Joi.string(),
  phone: Joi.string(),
  specialization: Joi.string(),
  qualifications: Joi.array().items(Joi.string()),
  experience: Joi.number().min(0),
  languages: Joi.array().items(Joi.string()),
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    next();
  };
};
