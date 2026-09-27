import React, {
  createContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";

export const userDataContext = createContext();

function UserContext({ children }) {
  const serverUrl =
    import.meta.env.VITE_BACKEND_URL || "/api";

  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================================
  // GET AUTH CONFIG
  // ================================
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    console.log("TOKEN EXISTS:", !!token);

    if (!token) {
      return {
        withCredentials: true,
      };
    }

    console.log(
      "TOKEN PREVIEW:",
      token.substring(0, 20) + "..."
    );

    return {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ================================
  // GET CURRENT USER
  // ================================
  const handleCurrentUser = async () => {
    setLoading(true);

    try {
      const config = getAuthConfig();

      console.log("Getting current user...");
      console.log("Authorization header exists:", !!config.headers?.Authorization);

      const result = await axios.get(
        `${serverUrl}/user/current`,
        config
      );

      console.log("CURRENT USER RESPONSE:", result.data);

      setUserData(result.data);

    } catch (error) {

      console.log(
        "CURRENT USER ERROR:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        setUserData(null);
      } else {
        console.error(error);
      }

    } finally {
      setLoading(false);
    }
  };

  // ================================
  // ASK ASSISTANT
  // ================================
  const getGeminiResponse = async (prompt) => {
    try {

      const config = getAuthConfig();

      console.log("Sending assistant request...");
      console.log(
        "Authorization header exists:",
        !!config.headers?.Authorization
      );

      const result = await axios.post(
        `${serverUrl}/user/ask`,
        {
          command: prompt,
        },
        config
      );

      return result.data;

    } catch (error) {

      console.error(
        "Error in getting Gemini response:",
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // ================================
  // INITIAL USER CHECK
  // ================================
  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,

    userData,
    setUserData,

    frontendImage,
    setFrontendImage,

    backendImage,
    setBackendImage,

    selectedImage,
    setSelectedImage,

    getGeminiResponse,
    handleCurrentUser,

    loading,
    setLoading,
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
}

export default UserContext;