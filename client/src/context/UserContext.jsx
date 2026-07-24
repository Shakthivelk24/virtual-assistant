// UserContext.jsx for managing user data and images in a React application
import React, { createContext, useState } from "react"; // Import necessary React functions
import axios from "axios"; // Import axios for HTTP requests
import { useEffect } from "react"; // Import useEffect for side effects
import Loading from "../components/Loading.jsx"; // Import Loading component for displaying loading state

// Create a context for user data
export const userDataContext = createContext();

function UserContext({ children }) { // Define the UserContext component
  const serverUrl = "/api"; // Define the server URL
  const [userData, setUserData] = React.useState(null); // State for storing user data
  const [frontendImage, setFrontendImage] = useState(null); // State for storing frontend image
  const [backendImage, setBackendImage] = useState(null); // State for storing backend image
  const [selectedImage, setSelectedImage] = useState(null); // State for storing selected image
  const [loading, setLoading] = useState(true); // State for loading status
  // Function to fetch current user data from the server

  const handleCurrentUser = async () => {
  setLoading(true);

  try {
    const result = await axios.get(
      `${serverUrl}/api/user/current`,
      { withCredentials: true }
    );

    setUserData(result.data);
  } catch (error) {
    if (error.response?.status === 401) {
      // User is not logged in
      setUserData(null);
    } else {
      console.error(error);
    }
  } finally {
    setLoading(false);
  }
};
  // Function to get response from Gemini API
  const getGeminiResponse = async (prompt) => {
    try {
      const result = await axios.post(`${serverUrl}/api/user/ask`, { command: prompt }, {withCredentials:true});
      return result.data;
    } catch (error) {
      console.log("Error in getting Gemini response:", error);
    }
  }
  
  // useEffect to fetch current user data on component mount
  useEffect(() => {
    handleCurrentUser();
  }, []);
  // Define the value to be provided by the context
  const value = {
    serverUrl,userData, setUserData,frontendImage,setFrontendImage,backendImage,setBackendImage,selectedImage,setSelectedImage,getGeminiResponse,loading,setLoading
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
