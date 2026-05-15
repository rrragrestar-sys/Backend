import { billingService } from "../services/billing.service.js";

export const simulatePayment = async (req, res) => {
  try {
    const { totalAmount, bookingId, userId, providerId, providerType, paymentMode } = req.body;

    const paymentRecord = await billingService.createPaymentRecord({
      totalAmount,
      bookingId,
      userId,
      providerId,
      providerType,
      paymentMode
    });

    res.json({
      success: true,
      message: "Payment split processed successfully",
      paymentRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
