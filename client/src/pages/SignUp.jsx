import React, { useContext, useState } from "react";
import auth from "../assets/auth.jpg";
import { useNavigate } from "react-router-dom";
import { userDataContext } from "../context/userContext.jsx";
import axios from "axios";
import toast from "react-hot-toast";

function SignUp() {
   const navigate= useNavigate();
   const [name,setName] = useState("");
   const [email,setEmail] = useState("");
   const [password,setPassword] = useState("");
   const [error,setError] = useState("");
   const {serverUrl,userData, setUserData} = useContext(userDataContext);
   const [loading,setLoading] = useState(false);
   console.log("Server URL from context:", serverUrl);
   const handleSignUp = async(e)=>{
        e.preventDefault();
        setLoading(true);
        setError("");
         try{
            console.log("Signing up with:", {name, email, password});
            let result = await axios.post(`${serverUrl}/api/auth/signup`,{
                name,
                email,
                password
            },{withCredentials:true});
            setUserData(result.data);
            toast.success("Signed Up Successfully");
            setLoading(false);
            navigate("/customize");
         }catch(err){   
            setUserData(null);
            toast.error("Sign Up Failed");
            console.log("Error during sign up:", err.message);
            setError(err.response?.data?.message || "An error occurred");
            setLoading(false);
         }  
   }
  return (
    <div
      className="w-full h-screen bg-cover bg-center flex justify-center items-center"
      style={{ backgroundImage: `url(${auth})` }}
    >
      <form className="w-[90%] h-135 max-w-110 bg-[#e1781c3f] backdrop-blur-md:shadow-lg shadow-yellow-300 flex flex-col items-center justify-center gap-6 p-6 rounded-lg px-[30px]" onSubmit={handleSignUp}>
        <h1 className="text-white text-[30px] font-semibold mb-[30px]">
          Register to <span className="text-yellow-400">Virtual Assistant</span>
        </h1>
        <input
          type="text"
          placeholder="Enter your Name"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-400 px-[20px] py-[10px] text-[18px] rounded-full"
          required
          onChange={(e)=>{setName(e.target.value)}}
          value={name}
        />
        <input
          type="email"
          placeholder="Enter your Email"
          className="w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-400 px-[20px] py-[10px] text-[18px] rounded-full"
          required
          onChange={(e)=>{setEmail(e.target.value)}}
          value={email}
        />
        <div className="w-full h-[60px] border-2 border-white bg-transparent text-white rounded-full text-[18px] flex items-center">
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full h-full bg-transparent outline-none rounded-full placeholder-gray-400 px-5 text-white"
            required
            onChange={(e)=>{setPassword(e.target.value)}}
            value={password}
          />
        </div>
        {error.length>0 && <p className="text-red-500 text-[14px]">{error}</p>}
        <button type ="submit" className="min-w-[150px] h-[60px] mt-[10px] bg-orange-500 text-1xl font-semibold text-white rounded-full hover:bg-orange-600 cursor-pointer" disabled={loading}>
           {loading ? "Signing Up..." : "Sign Up"}
        </button>
        <p className="text-white text-[15px]">Already have an account? <span className="text-yellow-300 cursor-pointer hover:underline" onClick={()=>{
            navigate("/signin")
        }}>Sign In</span></p>
      </form>
    </div>
  );
}

export default SignUp;
