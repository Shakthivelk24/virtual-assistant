import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import register from "./metrics/metrics.js";
import httpMetrics from "./metrics/httpMetrics.js";


dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()); // Middleware to parse cookies
app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow requests from the frontend URL
  credentials: true,
}));

// ============================================================
// Prometheus HTTP Metrics
// ============================================================
app.use(httpMetrics);

const PORT = process.env.PORT || 5000;

// ============================================================
// Prometheus Metrics
// ============================================================

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});


app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/user", userRoutes); // User-related routes


const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
  }
};

startServer();
