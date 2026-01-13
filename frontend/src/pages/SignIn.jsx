import React, { useContext, useState } from "react";
import auth from "../assets/auth2.jpg";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/userContext.jsx";
import axios from "axios";
import toast from "react-hot-toast";

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { serverUrl, userData, setUserData } = useContext(userDataContext);
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      setUserData(result.data);
      toast.success("Signed In Successfully");
      setLoading(false);
      navigate("/");
    } catch (err) {
      setUserData(null);
      toast.error("Sign In Failed");
      console.log("Error during sign in:", err.message);
      setError(err.response?.data?.message || "An error occurred");
      setLoading(false);
    }
  };
  return (
    <div
      className="w-full h-screen bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${auth})` }}
    >
      <form
        className="w-[90%] h-135 max-w-110 bg-[#ebe5e57b] backdrop-blur-md:shadow-lg shadow-black-800 flex flex-col items-center justify-center gap-6 p-6 rounded-lg px-[30px]"
        onSubmit={handleSignUp}
      >
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Register to <span className="text-blue-800">Virtual Assistant</span>
        </h1>
        <input
          type="email"
          placeholder="Enter your Email"
          className="w-full h-[60px] outline-none border-2 border-black bg-transparent text-black font-medium placeholder-gray-400 px-[20px] py-[10px] text-[18px] rounded-full"
          required
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          value={email}
        />
        <div className="w-full h-[60px] border-2 border-black bg-transparent text-black font-medium rounded-full text-[18px] flex items-center">
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full h-full bg-transparent outline-none rounded-full placeholder-gray-400 px-5 text-black"
            required
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            value={password}
          />
        </div>
        {error.length > 0 && (
          <p className="text-red-500 text-[14px]">{error}</p>
        )}
        <button
          type="submit"
          className="min-w-[150px] h-[60px] mt-[10px] bg-blue-500 text-1xl font-semibold text-white rounded-full hover:bg-blue-600 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <p className="text-white text-[15px]">
          want to create new account?{" "}
          <span
            className="text-blue-300 cursor-pointer hover:underline"
            onClick={() => {
              navigate("/signup");
            }}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
