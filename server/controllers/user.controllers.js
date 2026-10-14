import User from "../models/user.models.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResonse from "../gemini.js";
import moment from "moment";
import {
  recordDatabaseQuery,
  assistantRequestsQuery,
  cloudinaryUploadsQuery,
} from "../metrics/dbMetrics.js";
import {
  recordSuccessfulLogin,
  recordFailedLogin,
} from "../metrics/authMetrics.js";

// Get Current User Controller
export const getCurrentUser = async (req, res) => {
  try {
    recordDatabaseQuery();
    const userId = req.userId; // Assuming userId is set in req by authentication middleware
    const user = await User.findById(userId).select("-password"); // Exclude password field
    if (!user) {
      recordFailedLogin(); // Record failed login attempt
      return res.status(404).json({ message: "User not found" }); // Handle user not found
    }
    recordSuccessfulLogin(); // Record successful login attempt
    res.status(200).json(user);
  } catch (error) {
    console.error("getCurrentUser Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body; // Destructure assistant details from request body

    let assistantImage = imageUrl; // Default to provided imageUrl
    // If a file is uploaded, upload it to Cloudinary
    if (req.file) {
      cloudinaryUploadsQuery();
      const result = await uploadOnCloudinary(req.file.path); // Upload file to Cloudinary
      assistantImage = result.secure_url; // Get the secure URL of the uploaded image
    }
    // Update user document with new assistant details
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true },
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
const parseGeminiResponse = (result) => {
  let jsonResponse;

  if (typeof result !== "string") {
    if (
      result === null ||
      typeof result !== "object" ||
      Array.isArray(result)
    ) {
      throw new Error("Invalid response received from Gemini");
    }

    return result;
  }

  let cleanedResult = result.trim();

  try {
    jsonResponse = JSON.parse(cleanedResult);
  } catch {
    if (cleanedResult.startsWith("```")) {
      const firstNewline = cleanedResult.indexOf("\n");

      if (firstNewline !== -1) {
        cleanedResult = cleanedResult.slice(firstNewline + 1);
      }
    }

    cleanedResult = cleanedResult.trim();

    if (cleanedResult.endsWith("```")) {
      cleanedResult = cleanedResult.slice(0, -3).trimEnd();
    }

    try {
      jsonResponse = JSON.parse(cleanedResult);
    } catch {
      throw new Error("Invalid JSON received from Gemini");
    }
  }

  if (
    jsonResponse === null ||
    typeof jsonResponse !== "object" ||
    Array.isArray(jsonResponse)
  ) {
    throw new Error("Invalid JSON object received from Gemini");
  }

  return jsonResponse;
};

const updateDynamicResponse = (jsonResponse) => {
  const responseFormatters = {
    get_date: () => `Today is ${moment().format("MMMM Do YYYY")}`,
    get_time: () => `The current time is ${moment().format("h:mm A")}`,
    get_day: () => `Today is ${moment().format("dddd")}`,
    get_month: () => `This month is ${moment().format("MMMM")}`,
  };

  const formatter = responseFormatters[jsonResponse.type];

  if (formatter) {
    jsonResponse.response = formatter();
  }

  return jsonResponse;
};
export const askToAssistant = async (req, res) => {
  try {
    assistantRequestsQuery();
    const { command } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.history.push(command);
    await user.save();

    const result = await geminiResonse(
      command,
      user.assistantName,
      user.name,
    );

    console.log("Gemini Response:", result);

    const jsonResponse = updateDynamicResponse(
      parseGeminiResponse(result),
    );

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error("Ask Assistant Error:", error);

    if (
      error.message === "Invalid JSON received from Gemini" ||
      error.message === "Invalid JSON object received from Gemini" ||
      error.message === "Invalid response received from Gemini"
    ) {
      return res.status(500).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};