import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import token from "../config/token.js";

import {
  recordSuccessfulLogin,
  recordFailedLogin,
  recordUserRegistration,
  recordUserLogout,
} from "../metrics/authMetrics.js";

import { recordDatabaseQuery } from "../metrics/dbMetrics.js";

// ============================================================
// User Registration Controller
// ============================================================

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    recordDatabaseQuery();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password length must be 6 or more",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    recordDatabaseQuery();

    // Generate JWT
    const authToken = await token(newUser._id);

    console.log("JWT CREATED:", !!authToken);

    // Store JWT in cookie for web browser
    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: false,
    });

    console.log("TOKEN COOKIE SET");

    // Prometheus metric
    recordUserRegistration();

    // Return JWT for Android / Capacitor
    return res.status(201).json({
      message: "Signup success",
      token: authToken,
    });

  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      message: "Server issue",
    });
  }
};

// ============================================================
// User Login Controller
// ============================================================

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    recordDatabaseQuery();

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      recordFailedLogin();

      return res.status(400).json({
        message: "User not found",
      });
    }

    // Check password
    const match = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!match) {
      recordFailedLogin();

      return res.status(400).json({
        message: "Wrong credentials",
      });
    }

    // Generate JWT
    const authToken = await token(existingUser._id);

    console.log("LOGIN JWT CREATED:", !!authToken);

    // Store JWT in cookie for web browser
    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: false,
    });

    // Prometheus metric
    recordSuccessfulLogin();

    // Return JWT for Android / Capacitor
    return res.status(200).json({
      message: "Signin success",
      token: authToken,
    });

  } catch (error) {
    console.error("Signin Error:", error);

    recordFailedLogin();

    return res.status(500).json({
      message: "Server issue",
    });
  }
};

// ============================================================
// User Logout Controller
// ============================================================

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");

    recordUserLogout();

    return res.status(200).json({
      message: "Logout success",
    });

  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      message: "Server issue",
    });
  }
};