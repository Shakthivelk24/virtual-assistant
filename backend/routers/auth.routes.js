import express from "express";
import { signUp, signIn, signOut } from "../controllers/auth.controllers.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signUp); // User registration route
authRoutes.post("/signin", signIn); // User login route
authRoutes.get("/logout", signOut); // User logout route

export default authRoutes;
