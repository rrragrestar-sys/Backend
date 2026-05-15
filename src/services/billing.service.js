import { Payment } from "../models/payment.model.js";

class BillingService {
  constructor(commissionRate = 0.1) {
    this.commissionRate = commissionRate;
  }

  /**
   * Calculate commission and provider payout
   * @param {number} totalAmount 
   * @returns {object} { platformFee, providerAmount }
   */
  calculateFees(totalAmount) {
    const platformFee = Math.round(totalAmount * this.commissionRate * 100) / 100;
    const providerAmount = totalAmount - platformFee;
    return { platformFee, providerAmount };
  }

  /**
   * Record a new payment and calculate fees
   */
  async recordPayment(data) {
    const { totalAmount, ...rest } = data;
    const { platformFee, providerAmount } = this.calculateFees(totalAmount);

    const payment = await Payment.create({
      totalAmount,
      platformFee,
      providerAmount,
      ...rest,
      status: "SUCCESS" // Assuming payment was already successful via gateway
    });

    return payment;
  }

  /**
   * Mock payout processing
   */
  async processPayout(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("Payment record not found");

    // In a real app, this would call Stripe Connect or Razorpay Route API
    console.log(`[BILLING] Processing payout of ${payment.providerAmount} to provider ${payment.providerId}`);
    
    // For now, we just mark it as processed if we had a field for it, 
    // but the Payment model doesn't have a payoutStatus. 
    // We could add one if needed.
    
    return { success: true, amount: payment.providerAmount };
  }
}

export const billingService = new BillingService();
