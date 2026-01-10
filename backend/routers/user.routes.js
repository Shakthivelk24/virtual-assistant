import express from "express";
import { getCurrentUser } from "../controllers/user.controllers.js";
import authMiddleware from "../middlewares/isAuth.js";

const userRoutes = express.Router();

userRoutes.get("/current",authMiddleware, getCurrentUser);


export default userRoutes;