import Joi from "joi";

export const sendMessageSchema = Joi.object({
  receiverId: Joi.string().required(),
  text: Joi.string().required().max(1000),
});
