import { Payment } from "../models/payment.model.js";

class BillingService {
  /**
   * Calculate 10% platform fee and 90% provider split
   * @param {number} totalAmount 
   * @returns {object} { platformFee, providerAmount }
   */
  calculateSplit(totalAmount) {
    const platformFee = totalAmount * 0.10;
    const providerAmount = totalAmount - platformFee;
    return { platformFee, providerAmount };
  }

  async createPaymentRecord(data) {
    const { totalAmount, bookingId, userId, providerId, providerType, paymentMode } = data;
    const { platformFee, providerAmount } = this.calculateSplit(totalAmount);

    const payment = new Payment({
      bookingId,
      userId,
      providerId,
      providerType,
      totalAmount,
      platformFee,
      providerAmount,
      paymentMode,
      status: "SUCCESS" // Simplified for now
    });

    return await payment.save();
  }
}

export const billingService = new BillingService();
