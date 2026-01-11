import React,{useContext} from 'react'
import { userDataContext } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const {userData,setUserData,serverUrl} = useContext(userDataContext);
  const navigate = useNavigate();

  const handleLogOut = async ()=>{
     try {
        const result = await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true});
        navigate("/signin");
        setUserData(null);
     } catch (error) {
        console.log("Error in logging out :",error);
     }
  }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#010140] flex flex-col justify-center items-center overflow-y-scroll relative p-4 gap-[15px]'>
      <button  className="min-w-[150px] h-[60px] mt-[10px] bg-blue-500 text-1xl font-semibold text-white rounded-full hover:bg-blue-600 cursor-pointer absolute top-[20px] right-[20px]" onClick={handleLogOut}>
           Log Out
      </button>
      <button  className="min-w-[150px] h-[60px] mt-[10px] bg-blue-500 text-1xl font-semibold text-white rounded-full hover:bg-blue-600 cursor-pointer absolute top-[100px] right-[20px] px-[20px] py-[20px]" onClick={()=>{navigate("/customize")}}>
           Customize your Assistant
      </button>
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl'>
        <img src={userData?.assistantImage} alt="Assistant" className='w-full h-full object-cover'/>
      </div>
      <h1 className='text-white text-[20px] font-semibold mt-[20px]'>Welcome to your Assistant, <span className='text-blue-500'>{userData?.assistantName}</span>!</h1>
    </div>
  )
}

export default Home
