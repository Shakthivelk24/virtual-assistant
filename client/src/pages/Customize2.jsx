import React,{useContext,useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext.jsx';
import { MdArrowBack } from "react-icons/md";

import axios from 'axios';
function Customize2() {
  const navigate = useNavigate();
  const {userData,serverUrl,backendImage,selectedImage,setUserData}=useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || '');
  const [loading, setLoading] = useState(false);
  const handleUpdateAssistant = async ()=>{
      setLoading(true);
      try {
        let formData = new FormData();
        formData.append('assistantName', assistantName);
        if(backendImage){
          formData.append('assistantImage', backendImage);
        }else{
           formData.append('imageUrl', selectedImage);
        }
        const result = await axios.put(`${serverUrl}/api/user/update`,formData,{withCredentials:true})
        setLoading(false);

        console.log("Assistant Updated :",result.data);
        setUserData(result.data);
        navigate("/");
      } catch (error) {
        console.log("Error in updating assistant :",error); 
        setLoading(false);
      }
  }
  
  return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-[black] to-[#010140] flex flex-col justify-center items-center overflow-y-scroll relative p-4">
       <MdArrowBack className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer' onClick={() => navigate(-1)} />
       <h1 className="text-white text-[30px] font-semibold mb-[20px]">Enter Your <span className="text-blue-500">Assistant Name</span></h1><br />
       <input
          type="text"
          placeholder="eg : Krishna"
          className="w-full h-[60px] max-w-[600px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-400 px-[20px] py-[10px] text-[18px] rounded-full"
          required
          onChange={(e)=>{
            setAssistantName(e.target.value)
          }}
          value={assistantName}
        />
        <br />
        {assistantName.length>0 &&   <button
          className="min-w-[300px] h-[60px] mt-[10px] bg-blue-500 text-1xl font-semibold text-white rounded-full hover:bg-blue-600 cursor-pointer "
          disabled={loading}
          onClick={handleUpdateAssistant}
        >
          {loading ? "Updating..." : "Finally Create Your Assistant"}
        </button>}
    </div>
  )
}

export default Customize2
