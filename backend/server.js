import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config();

connectDB();

const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()); // Middleware to parse cookies
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

const port = process.env.PORT || 5000;

app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/user", userRoutes); // User-related routes


app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
