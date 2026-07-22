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
    const { command } = req.body;

    // Find user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Save command history
    user.history.push(command);
    await user.save();

    const userName = user.name;
    const assistantName = user.assistantName;

    // Get Gemini response
    const result = await geminiResonse(
      command,
      assistantName,
      userName
    );

    console.log("Gemini Response:", result);

    // If geminiResponse() already returns an object
    let jsonResponse;

    if (typeof result === "string") {
      const jsonMatch = result.match(/{[\s\S]*}/);

      if (!jsonMatch) {
        return res.status(500).json({
          message: "Invalid JSON received from Gemini",
        });
      }

      jsonResponse = JSON.parse(jsonMatch[0]);
    } else {
      jsonResponse = result;
    }

    // Handle dynamic values
    switch (jsonResponse.type) {
      case "get_date":
        jsonResponse.response = `Today is ${moment().format("MMMM Do YYYY")}`;
        break;

      case "get_time":
        jsonResponse.response = `The current time is ${moment().format(
          "h:mm A"
        )}`;
        break;

      case "get_day":
        jsonResponse.response = `Today is ${moment().format("dddd")}`;
        break;

      case "get_month":
        jsonResponse.response = `This month is ${moment().format("MMMM")}`;
        break;

      default:
        // Leave response unchanged
        break;
    }

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Ask Assistant Error:", error);

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};