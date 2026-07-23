import express from "express";
import { getCurrentUser ,updateAssistant,askToAssistant} from "../controllers/user.controllers.js";
import authMiddleware from "../middlewares/isAuth.js"; // Authentication middleware for protected routes 
import upload from "../middlewares/multer.js" // Multer middleware for handling file uploads

const userRoutes = express.Router();

userRoutes.get("/current",authMiddleware, getCurrentUser); // Get current authenticated user details 
userRoutes.put("/update",authMiddleware,upload.single('assistantImage'), updateAssistant); // Update assistant details with image upload
userRoutes.post("/ask",authMiddleware, askToAssistant); // Ask a question to the assistant

export default userRoutes;