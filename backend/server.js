import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routers/auth.routes.js";
import cookieParser from "cookie-parser";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
