import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routers/auth.routes.js";
import userRoutes from "./routers/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import geminiResonse from "./gemini.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

const port = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/",async(req,res)=>{
  let prompt = req.query.prompt;
  let response = await geminiResonse(prompt);
  res.json(response);
})

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
