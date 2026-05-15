import { Router } from "express";
import {
  getEarningsSummary,
  requestWithdrawal
} from "../controllers/financial.controller.js";
import { simulatePayment } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/earnings", getEarningsSummary);
router.post("/withdraw", requestWithdrawal);
router.post("/simulate-payment", simulatePayment);

export default router;
