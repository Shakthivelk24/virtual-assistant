import express from "express";
import { getCurrentUser ,updateAssistant,askToAssistant} from "../controllers/user.controllers.js";
import authMiddleware from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js"

const userRoutes = express.Router();

userRoutes.get("/current",authMiddleware, getCurrentUser);
userRoutes.put("/update",authMiddleware,upload.single('assistantImage'), updateAssistant);
userRoutes.post("/ask",authMiddleware, askToAssistant);

export default userRoutes;