import React from "react";
import { useContext } from "react";
import { userDataContext } from "../context/UserContext.jsx";

function Card({ image }) {
  const {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontendImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);
  return (
    <div
      className={`w-[50px] h-[100px] lg:w-[125px] lg:h-[225px] overflow-hidden  bg-[#030326] border-2 border-[#2a2a6e] rounded-2xl hover:shadow-2xl hover:shadow-blue-500 transition-shadow duration-300 cursor-pointer hover:border-white hover:border-2 ${
        selectedImage === image
          ? "border-white border-4 shadow-blue-500 shadow-2xl"
          : null
      }`}
      onClick={() => {
        setSelectedImage(image);
        setBackendImage(null);
        setFrontendImage(null);
      }}
    >
      <img
        src={image}
        alt="card image"
        className="w-full h-full object-cover rounded-2xl"
      />
    </div>
  );
}

export default Card;
