import React,{useContext} from 'react'
import { Routes, Route } from 'react-router-dom'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import Customize from './pages/Customize.jsx'
import Home from './pages/Home.jsx'
import Customize2 from './pages/Customize2.jsx'
import { userDataContext } from './context/UserContext.jsx'
import { Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";

function App() {
  const {userData, setUserData} = useContext(userDataContext);
  return (
    <>
    <Toaster />
    <Routes>
      <Route path="/" element={(userData?.assistantImage && userData?.assistantName) ? <Home /> : <Navigate to={"/customize"} />} /> 
      <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to={"/"} />} />
      <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to={"/"} />} />
      <Route path="/customize" element={userData ? <Customize /> : <Navigate to={"/signup"} />} />
      <Route path="/customize2" element={userData ? <Customize2 /> : <Navigate to={"/signup"} />} />
    </Routes>
    </>
  )
}

export default App
