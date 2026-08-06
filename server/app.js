import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/user.routes.js";

import register from "./metrics/metrics.js";
import httpMetrics from "./metrics/httpMetrics.js";

dotenv.config();

const app = express();

// ============================================================
// Middleware
// ============================================================

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ============================================================
// Metrics Middleware
// ============================================================

app.use(httpMetrics);

// ============================================================
// Prometheus Metrics
// ============================================================

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ============================================================
// Health Check
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "backend",
  });
});

// ============================================================
// Routes
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

export default app;