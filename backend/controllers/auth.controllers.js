import bcrypt from "bcryptjs";
import User from "../models/user.models.js";
import token from "../config/token.js";

// User Registration Controller
export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body; // Destructure user details from request body

    const existingUser = await User.findOne({ email });// Check if user already exists
    if (existingUser) { // If user exists, return error
      return res.status(400).json({ message: "User already exists" });
    }
    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password length must be 6 or more" });
    }
    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    // Save the new user to the database
    await newUser.save();
    // Generate authentication token
    const authToken = await token(newUser._id);
    // Set the token in an HTTP-only cookie
    res.cookie("token", authToken, {
      httpOnly: true,  
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days 
      sameSite: "strict", // CSRF protection
      secure: false, // Set to true in production with HTTPS
    });

    res.status(201).json({ message: "Signup success" }); // Respond with success message
  } catch (error) {
    res.status(500).json({ message: "Server issue" }); // Handle server errors
  }
};
// User Login Controller
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body; // Destructure login credentials from request body

    const existingUser = await User.findOne({ email }); // Check if user exists
    // If user does not exist, return error
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }
    // Compare provided password with stored hashed password
    const match = await bcrypt.compare(password, existingUser.password);
    // If passwords do not match, return error
    if (!match) {
      return res.status(400).json({ message: "Wrong credentials" });
    }
    // Generate authentication token
    const authToken = await token(existingUser._id);
    // Set the token in an HTTP-only cookie
    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });
    // Respond with success message
    res.status(200).json({ message: "Signin success" });
  } catch (error) {
    res.status(500).json({ message: "Server issue" });// Handle server errors
  }
};
// User Logout Controller
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token"); // Clear the authentication token cookie
    res.status(200).json({ message: "Logout success" }); // Respond with success message
  } catch (error) {
    res.status(500).json({ message: "Server issue" });  // Handle server errors
  }
};
