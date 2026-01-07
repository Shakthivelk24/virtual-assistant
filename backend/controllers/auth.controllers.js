import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import token from "../config/token.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password length must be 6 or more" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const authToken = await token(newUser._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });

    res.status(201).json({ message: "Signup success" });
  } catch (error) {
    res.status(500).json({ message: "Server issue" });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, existingUser.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong credentials" });
    }

    const authToken = await token(existingUser._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });

    res.status(200).json({ message: "Signin success" });
  } catch (error) {
    res.status(500).json({ message: "Server issue" });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout success" });
  } catch (error) {
    res.status(500).json({ message: "Server issue" });
  }
};
