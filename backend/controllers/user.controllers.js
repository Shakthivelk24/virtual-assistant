import User from "../models/user.models.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResonse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    let assistantImage = imageUrl;

    if (req.file) {
      const result = await uploadOnCloudinary(req.file.path);
      assistantImage = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command);
    await user.save();  
    const userName = user.name;
    const assistantName = user.assistantName;
    const result = await geminiResonse(command, assistantName, userName);

    const jsonMatch = result.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      return res
        .status(500)
        .json({ message: "Invalid response from assistant" });
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);

    const type = jsonResponse.type;

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
