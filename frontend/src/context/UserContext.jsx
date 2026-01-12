import React, { createContext, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
export const userDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "http://localhost:8000";
  const [userData, setUserData] = React.useState(null);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(result.data);
      console.log("Current User Data:", result.data);
    } catch (error) {
      console.error("Error fetching current user data:", error);
    }
  };
  const getGeminiResponse = async (prompt) => {
    try {
      const result = await axios.post(`${serverUrl}/api/user/ask`, { command: prompt }, {withCredentials:true});
      return result.data;
    } catch (error) {
      console.log("Error in getting Gemini response:", error);
    }
  }
  useEffect(() => {
    handleCurrentUser();
  }, []);
  const value = {
    serverUrl,userData, setUserData,frontendImage,setFrontendImage,backendImage,setBackendImage,selectedImage,setSelectedImage,getGeminiResponse
  };
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
}

export default UserContext;
