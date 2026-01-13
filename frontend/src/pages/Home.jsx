import React, { useContext, useState, useRef, use } from "react";
import { userDataContext } from "../context/UserContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import UserImage from "../assets/user.gif";
import AIImage from "../assets/AI.gif";
import { TiThMenu } from "react-icons/ti";
import { IoMdCloseCircle } from "react-icons/io";

function Home() {
  const { userData, setUserData, serverUrl, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userCommand, setUserCommand] = useState("");
  const [AICommand, setAICommand] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const isSpeakingRef = useRef(false);

  const recognitionRef = useRef(null);

  const isRecognizingRef = useRef(false);

  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      navigate("/signin");
      setUserData(null);
    } catch (error) {
      console.log("Error in logging out :", error);
    }
  };
  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch (error) {
        if (!error.message.includes("start")) {
          console.error("Recognition error:", error);
        }
      }
    }
  };
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    isSpeakingRef.current = true;
    utterance.lang = "hi-IN";
    utterance.lang = "ta-IN";
    utterance.lang = "ka-IN";
    const voices = synth.getVoices();
    const hindiVoice = voices.find((voice) => voice.lang === "hi-IN");
    const tamilVoice = voices.find((voice) => voice.lang === "ta-IN");
    const kannadaVoice = voices.find((voice) => voice.lang === "ka-IN");
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    } else if (tamilVoice) {
      utterance.voice = tamilVoice;
    } else if (kannadaVoice) {
      utterance.voice = kannadaVoice;
    }
    utterance.onend = () => {
      setAICommand("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    };
    synth.cancel();
    synth.speak(utterance);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);
    if (type === "google_search") {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
    } else if (type === "youtube_search") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    } else if (type === "youtube_play") {
      const query = encodeURIComponent(userInput);
      window.open(
        `https://www.youtube.com/results?search_query=${query}`,
        "_blank"
      );
    } else if (type === "calculator_open") {
      window.open(`https://www.online-calculator.com/`, "_blank");
    } else if (type === "instagram_open") {
      window.open(`https://www.instagram.com/`, "_blank");
    } else if (type === "facebook_open") {
      window.open(`https://www.facebook.com/`, "_blank");
    } else if (type === "weather-show") {
      window.open(`https://www.weather.com/`, "_blank");
    }
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    let isMounted = true;

    const startTimeout = () =>
      setTimeout(() => {
        if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
          try {
            recognition.start();
            console.log("Speech recognition started after timeout");
          } catch (error) {
            if (error.name !== "InvalidStateError") {
              console.log("Error starting speech recognition:", error);
            }
          }
        }
      }, 1000);

    recognition.onstart = () => {
      console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Speech recognition restarted after end");
            } catch (error) {
              if (error.name !== "InvalidStateError") {
                console.log("Error restarting speech recognition:", error);
              }
            }
          }
        }, 1000);
      }
    };
    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
              console.log("Speech recognition restarted after error");
            } catch (error) {
              if (error.name !== "InvalidStateError") {
                console.log("Error restarting speech recognition:", error);
              }
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.trim();
      setUserCommand(transcript);

      if (
        transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
      ) {
        try {
          setAICommand("");
          recognition.stop();
          isRecognizingRef.current = false;
          setListening(false);
          const data = await getGeminiResponse(transcript);
          console.log("Gemini Response:", data);
          handleCommand(data);
          setAICommand(data.response);
          setUserCommand("");
        } catch (error) {
          console.log("Error in getting Gemini response:", error);
        }
      }
    };
    const fallback = setInterval(() => {
      if (!isSpeakingRef.current && !isRecognizingRef.current) {
        startTimeout();
      }
    }, 10000);
    startTimeout();

    window.speechSynthesis.onvoiceschanged = () => {
      const greeting = new SpeechSynthesisUtterance(
        `Hello ${userData.assistantName} is online now. How can I assist you today?`
      );
      greeting.lang = "ta-IN";
      greeting.onend = () => {
        startTimeout();
      };
      synth.speak(greeting);
    };

    return () => {
      recognition.stop();
      isMounted = false;
      clearTimeout(startTimeout);
      setListening(false);
      isRecognizingRef.current = false;
      clearInterval(fallback);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#010140] flex flex-col items-center relative px-4 py-6 gap-4 overflow-y-auto">
      {/* Mobile menu icon */}
      <TiThMenu
        onClick={() => setMenuOpen(true)}
        className="lg:hidden text-white absolute top-5 right-5 w-6 h-6 cursor-pointer"
      />

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4">
          <IoMdCloseCircle
            onClick={() => setMenuOpen(false)}
            className="text-white absolute top-5 right-5 w-6 h-6 cursor-pointer"
          />

          <button
            onClick={handleLogOut}
            className="w-48 h-14 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Log Out
          </button>

          <button
            onClick={() => navigate("/customize")}
            className="w-48 h-14 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            Customize Assistant
          </button>
        </div>
      )}

      {/* Desktop buttons */}
      <div className="hidden lg:flex absolute top-5 right-5 gap-4">
        <button
          onClick={handleLogOut}
          className="w-40 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Log Out
        </button>

        <button
          onClick={() => navigate("/customize")}
          className="w-52 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Customize Assistant
        </button>
      </div>

      {/* Assistant image */}
      <div className="w-56 h-72 sm:w-64 sm:h-80 lg:w-72 lg:h-96 rounded-3xl overflow-hidden">
        <img
          src={userData?.assistantImage}
          alt="Assistant"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Welcome text */}
      <h1 className="text-white text-lg sm:text-xl font-semibold text-center">
        Welcome to your Assistant,
        <span className="text-blue-500 ml-1">{userData?.assistantName}</span>
      </h1>

      {/* Command image */}
      {!AICommand && (
        <img src={UserImage} alt="User" className="w-[200px] h-[100px]" />
      )}

      {AICommand && (
        <img src={AIImage} alt="AI" className="w-[200px] h-[200px]" />
      )}

      {/* Command text */}
      <h1 className="text-white text-base sm:text-lg text-center px-2">
        {userCommand ? userCommand : AICommand ? AICommand : ""}
      </h1>
    </div>
  );
}

export default Home;
