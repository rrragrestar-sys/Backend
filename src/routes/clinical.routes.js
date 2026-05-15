import { Router } from "express";
import {
  createPrescription,
  getPrescriptionPDF,
  createVisitReport,
  getVisitReportPDF
} from "../controllers/clinical.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/prescription", createPrescription);
router.get("/prescription/pdf/:id", getPrescriptionPDF);

router.post("/visit-report", createVisitReport);
router.get("/visit-report/pdf/:id", getVisitReportPDF);

export default router;
