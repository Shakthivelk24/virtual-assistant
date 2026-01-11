import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const geminiResonse = async (prompt) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;
    const result = await axios.post(apiUrl, {
      "contents": [
        {
          "parts": [
            {
              "text": prompt
            },
          ],
        },
      ],
    });
    return result.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log("Error in Gemini API call:", error);
  }
};

export default geminiResonse;
