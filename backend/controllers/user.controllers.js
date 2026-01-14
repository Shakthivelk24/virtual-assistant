import User from "../models/user.models.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResonse from "../gemini.js";
import moment from "moment";

// Get Current User Controller
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // Assuming userId is set in req by authentication middleware
    const user = await User.findById(userId).select("-password"); // Exclude password field
    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Handle user not found
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body; // Destructure assistant details from request body

    let assistantImage = imageUrl; // Default to provided imageUrl
    // If a file is uploaded, upload it to Cloudinary
    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path); // Upload file to Cloudinary
      assistantImage = result.secure_url; // Get the secure URL of the uploaded image
    }
    // Update user document with new assistant details
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");
    // Handle case where user is not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("UPDATE ERROR:", error); // Log update errors
    res.status(500).json({ message: error.message });
  }
};
// Ask to Assistant Controller
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body; // Destructure command from request body
    const user = await User.findById(req.userId); // Find user by ID
    user.history.push(command); // Add command to user's history
    await user.save(); // Save updated user document
    const userName = user.name; // Get user's name
    const assistantName = user.assistantName; // Get assistant's name
    const result = await geminiResonse(command, assistantName, userName); // Get response from Gemini AI
    // Extract JSON part from the response
    const jsonMatch = result.match(/{[\s\S]*}/);
    // Handle case where JSON is not found in the response
    if (!jsonMatch) {
      return res
        .status(500)
        .json({ message: "Invalid response from assistant" });
    }
    // Parse the JSON response
    const jsonResponse = JSON.parse(jsonMatch[0]);
    // Determine response type and send appropriate response
    const type = jsonResponse.type;
    // Handle different response types
    switch (type) {
      case "get_date":
        return res.json({
          type: "get_date",
          userInput: jsonResponse.userInput,
          response: `Today is ${moment().format("MMMM Do YYYY")}`,
        });
      case "get_time":
        return res.json({
          type: "get_time",
          userInput: jsonResponse.userInput,
          response: `The current time is ${moment().format("h:mm A")}`,
        });
      case "get_day":
        return res.json({
          type: "get_day",
          userInput: jsonResponse.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });
      case "get_month":
        return res.json({
          type: "get_month",
          userInput: jsonResponse.userInput,
          response: `This month is ${moment().format("MMMM")}`,
        });
      case "general":
      case "google_search":
      case "youtube_search":
      case "youtube_play":
      case "calculator_open":
      case "instagram_open":
      case "facebook_open":
      case "weather-show":
        return res.json({
          type: type,
          userInput: jsonResponse.userInput,
          response: jsonResponse.response,
        });
      default:
        return res
          .status(500)
          .json({ message: "Unknown response type from assistant" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
