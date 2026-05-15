import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import healthRoutes from "./routes/health.routes.js";
import userRoutes from "./routes/user.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import trackingRoutes from "./routes/tracking.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import systemRoutes from "./routes/system.routes.js";
import clinicalRoutes from "./routes/clinical.routes.js";
import financialRoutes from "./routes/financial.routes.js";
import taskRoutes from "./routes/task.routes.js";


import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

import verificationRoutes from "./routes/verification.routes.js";

/* ===============================
   GLOBAL MIDDLEWARES
=============================== */

app.use(express.json({ limit: "10kb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

/* ===============================
   ROUTES
=============================== */

app.use("/api/health", healthRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/clinical", clinicalRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/tasks", taskRoutes);


/* ===============================
   404 HANDLER
=============================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* ===============================
   ERROR HANDLER
=============================== */
app.use(errorHandler);

export default app;