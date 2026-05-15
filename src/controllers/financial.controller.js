import { Payment } from "../models/payment.model.js";
import { Withdrawal } from "../models/withdrawal.model.js";

export const getEarningsSummary = async (req, res) => {
  try {
    const providerId = req.user.id;

    const successfulPayments = await Payment.find({
      providerId,
      status: "SUCCESS"
    });

    const totalEarnings = successfulPayments.reduce((acc, curr) => acc + curr.providerAmount, 0);

    const withdrawals = await Withdrawal.find({ providerId });
    const totalWithdrawn = withdrawals
      .filter(w => w.status === "APPROVED")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingWithdrawal = withdrawals
      .filter(w => w.status === "PENDING")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const currentBalance = totalEarnings - totalWithdrawn - pendingWithdrawal;

    res.json({
      success: true,
      summary: {
        totalEarnings,
        totalWithdrawn,
        pendingWithdrawal,
        currentBalance
      },
      withdrawals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    const providerId = req.user.id;
    const providerType = req.user.role;

    // Validate balance before creating request
    const successfulPayments = await Payment.find({ providerId, status: "SUCCESS" });
    const totalEarnings = successfulPayments.reduce((acc, curr) => acc + curr.providerAmount, 0);
    
    const withdrawals = await Withdrawal.find({ providerId });
    const totalWithdrawn = withdrawals
      .filter(w => w.status === "APPROVED")
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const pendingWithdrawal = withdrawals
      .filter(w => w.status === "PENDING")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const currentBalance = totalEarnings - totalWithdrawn - pendingWithdrawal;

    if (amount > currentBalance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const withdrawal = await Withdrawal.create({
      providerId,
      providerType,
      amount,
      bankDetails
    });

    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
