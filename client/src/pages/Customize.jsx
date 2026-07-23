import React, { useState, useRef, useContext } from "react";
import Card from "../components/Card";
import image1 from "../assets/image1.avif";
import image2 from "../assets/image2.png";
import image3 from "../assets/image3.jpg";
import image4 from "../assets/image4.jpg";
import image5 from "../assets/image5.jpg";
import image6 from "../assets/image6.webp";
import image7 from "../assets/image7.avif";
import { LuImageUp } from "react-icons/lu";
import { userDataContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";

function Customize() {
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
  const navigate = useNavigate();
  const inputImage = useRef(null);
  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#010140] flex flex-col justify-center items-center overflow-y-scroll relative p-4">
      <MdArrowBack className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer' onClick={() => navigate("/")} />
      <h1 className="text-white text-[30px] font-semibold mb-[20px]">
        Select your <span className="text-blue-500">Assistant Image</span>
      </h1>
      <div className="w-[90%] max-w-[60%] flex justify-center items-center flex-wrap gap-[20px]">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />
        <div
          className={`w-[50px] h-[100px] lg:w-[125px] lg:h-[225px] overflow-hidden  bg-[#030326] border-2 border-[#2a2a6e] rounded-2xl hover:shadow-2xl hover:shadow-blue-500 transition-shadow duration-300 cursor-pointer hover:border-white hover:border-2 flex items-center justify-center ${
            selectedImage === "input"
              ? "border-white border-4 shadow-blue-500 shadow-2xl"
              : null
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <LuImageUp className="text-white w-[25px] h-[25px]" />
          )}
          {frontendImage && (
            <img
              src={frontendImage}
              alt="custom"
              className="w-full h-full object-cover rounded-2xl"
            />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>
      {selectedImage && (
        <button
          className="min-w-[150px] h-[60px] mt-[10px] bg-blue-500 text-1xl font-semibold text-white rounded-full hover:bg-blue-600 cursor-pointer"
          onClick={() => navigate("/customize2")}
        >
          Next
        </button>
      )}
    </div>
  );
}

export default Customize;
