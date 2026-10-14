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
export const askToAssistant = async (req, res) => {
  try {
    assistantRequestsQuery();
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
    const result = await geminiResonse(command, assistantName, userName);

    console.log("Gemini Response:", result);

    // Parse Gemini response safely
    let jsonResponse;

    if (typeof result === "string") {
      let cleanedResult = result.trim();

      try {
        // First, parse the complete response as JSON
        jsonResponse = JSON.parse(cleanedResult);
      } catch {
        // Remove optional Markdown code fences without regex
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
          return res.status(500).json({
            message: "Invalid JSON received from Gemini",
          });
        }
      }
    } else if (
      result !== null &&
      typeof result === "object" &&
      !Array.isArray(result)
    ) {
      // Gemini helper already returned an object
      jsonResponse = result;
    } else {
      return res.status(500).json({
        message: "Invalid response received from Gemini",
      });
    }

    // Validate the parsed response
    if (
      jsonResponse === null ||
      typeof jsonResponse !== "object" ||
      Array.isArray(jsonResponse)
    ) {
      return res.status(500).json({
        message: "Invalid JSON object received from Gemini",
      });
    }

    // Handle dynamic values
    switch (jsonResponse.type) {
      case "get_date":
        jsonResponse.response = `Today is ${moment().format("MMMM Do YYYY")}`;
        break;

      case "get_time":
        jsonResponse.response = `The current time is ${moment().format(
          "h:mm A",
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
