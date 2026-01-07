import express from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controllers.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signUp);
authRoutes.post("/signin", signIn);
authRoutes.get("/logout", signOut);

export default authRoutes;
