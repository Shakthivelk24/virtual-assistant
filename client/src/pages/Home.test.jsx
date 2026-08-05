import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";
import { userDataContext } from "../context/UserContext";

// --------------------
// Mock Router
// --------------------

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// --------------------
// Mock Assets
// --------------------

vi.mock("../assets/user.gif", () => ({
  default: "user.gif",
}));

vi.mock("../assets/AI.gif", () => ({
  default: "ai.gif",
}));

// --------------------
// Mock Axios
// --------------------

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// --------------------
// Mock Browser APIs
// --------------------

beforeEach(() => {
  vi.clearAllMocks();

  class MockRecognition {
    start = vi.fn();
    stop = vi.fn();
  }

  window.SpeechRecognition = MockRecognition;
  window.webkitSpeechRecognition = MockRecognition;

  window.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: () => [],
    onvoiceschanged: null,
  };

  global.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };

  window.open = vi.fn();
});

// --------------------
// Render Helper
// --------------------

const renderComponent = () => {
  const setUserData = vi.fn();

  const utils = render(
    <userDataContext.Provider
      value={{
        serverUrl: "/api",
        userData: {
          assistantName: "Jarvis",
          assistantImage: "assistant.png",
        },
        setUserData,
        getGeminiResponse: vi.fn(),
      }}
    >
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </userDataContext.Provider>,
  );

  return {
    ...utils,
    setUserData,
  };
};
// --------------------
// Tests
// --------------------

describe("Home Component - Rendering", () => {
  it("renders welcome text", () => {
    renderComponent();

    expect(screen.getByText(/Welcome to your Assistant/i)).toBeInTheDocument();

    expect(screen.getByText("Jarvis")).toBeInTheDocument();
  });

  it("renders assistant image", () => {
    renderComponent();

    expect(screen.getByAltText("Assistant")).toHaveAttribute(
      "src",
      "assistant.png",
    );
  });

  it("shows user image initially", () => {
    renderComponent();

    expect(screen.getByAltText("User")).toBeInTheDocument();
  });

  it("renders desktop buttons", () => {
    renderComponent();

    expect(screen.getAllByText("Log Out")[0]).toBeInTheDocument();

    expect(screen.getAllByText("Customize Assistant")[0]).toBeInTheDocument();
  });

  it("opens mobile menu", () => {
    const { container } = renderComponent();

    const menuIcon = container.querySelector("svg");

    fireEvent.click(menuIcon);

    expect(screen.getAllByText("Log Out").length).toBeGreaterThan(1);

    expect(screen.getAllByText("Customize Assistant").length).toBeGreaterThan(
      1,
    );
  });

  it("closes mobile menu", () => {
    const { container } = renderComponent();

    const icons = container.querySelectorAll("svg");

    fireEvent.click(icons[0]);

    const closeIcon = container.querySelectorAll("svg")[1];

    fireEvent.click(closeIcon);

    expect(screen.getAllByText("Log Out").length).toBe(1);
  });

  it("navigates to customize page", () => {
    renderComponent();

    fireEvent.click(screen.getAllByText("Customize Assistant")[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/customize");
  });
});
import axios from "axios";

describe("Home Component - Logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs out successfully from desktop button", async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const { setUserData } = renderComponent();

    fireEvent.click(screen.getAllByText("Log Out")[0]);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(axios.get).toHaveBeenCalledWith("/api/auth/logout", {
      withCredentials: true,
    });

    expect(setUserData).toHaveBeenCalledWith(null);

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("logs out successfully from mobile menu", async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    const { container, setUserData } = renderComponent();

    const menuIcon = container.querySelector("svg");

    fireEvent.click(menuIcon);

    fireEvent.click(screen.getAllByText("Log Out")[1]);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(setUserData).toHaveBeenCalledWith(null);

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("handles logout failure gracefully", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    axios.get.mockRejectedValue(new Error("Network Error"));

    renderComponent();

    fireEvent.click(screen.getAllByText("Log Out")[0]);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();

    spy.mockRestore();
  });

  it("keeps user logged in when logout request fails", async () => {
    const { setUserData } = renderComponent();

    axios.get.mockRejectedValue(new Error("Server Error"));

    fireEvent.click(screen.getAllByText("Log Out")[0]);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    expect(setUserData).not.toHaveBeenCalled();
  });
});

describe("Home Component - Speech APIs", () => {
  let recognition;

  beforeEach(() => {
    vi.clearAllMocks();

    recognition = {
      start: vi.fn(),
      stop: vi.fn(),
      continuous: false,
      lang: "",
      interimResults: false,
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
    };

    class MockRecognition {
      constructor() {
        return recognition;
      }
    }

    window.SpeechRecognition = MockRecognition;
    window.webkitSpeechRecognition = MockRecognition;

    window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [{ lang: "hi-IN", name: "Hindi" }],
      onvoiceschanged: null,
    };

    global.SpeechSynthesisUtterance = function (text) {
      this.text = text;
      this.lang = "";
      this.voice = null;
      this.onend = null;
    };
  });

  it("starts recognition when component mounts", () => {
    vi.useFakeTimers();

    renderComponent();

    vi.advanceTimersByTime(1000);

    expect(recognition.start).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("updates listening state when recognition starts", () => {
    renderComponent();

    recognition.onstart();

    expect(recognition.start).toHaveBeenCalledTimes(0);
  });

  it("restarts recognition after onend", () => {
    vi.useFakeTimers();

    renderComponent();

    recognition.onend();

    vi.advanceTimersByTime(1000);

    expect(recognition.start).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("restarts recognition after non-aborted error", () => {
  vi.useFakeTimers();

  renderComponent();

  recognition.onerror({
    error: "network",
  });

  vi.advanceTimersByTime(1000);

  expect(recognition.start).toHaveBeenCalled();

  vi.useRealTimers();
});

  it("greets the user when voices are loaded", () => {
    renderComponent();

    window.speechSynthesis.onvoiceschanged();

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("calls speech synthesis with greeting", () => {
    renderComponent();

    window.speechSynthesis.onvoiceschanged();

    const utterance = window.speechSynthesis.speak.mock.calls[0][0];

    expect(utterance.text).toContain("Jarvis");
  });

  it("stops recognition on component unmount", () => {
    const { unmount } = renderComponent();

    unmount();

    expect(recognition.stop).toHaveBeenCalled();
  });
});

describe("Home Component - Gemini Commands", () => {
  let recognition;
  let getGeminiResponse;

  beforeEach(() => {
    vi.clearAllMocks();

    recognition = {
      start: vi.fn(),
      stop: vi.fn(),
      continuous: false,
      lang: "",
      interimResults: false,
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
    };

    class MockRecognition {
      constructor() {
        return recognition;
      }
    }

    window.SpeechRecognition = MockRecognition;
    window.webkitSpeechRecognition = MockRecognition;

    window.open = vi.fn();

    window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [],
      onvoiceschanged: null,
    };

    global.SpeechSynthesisUtterance = function (text) {
      this.text = text;
      this.lang = "";
      this.voice = null;
      this.onend = null;
    };

    getGeminiResponse = vi.fn();
  });

  function renderGemini(data) {
    getGeminiResponse.mockResolvedValue(data);

    render(
      <userDataContext.Provider
        value={{
          serverUrl: "/api",
          userData: {
            assistantName: "Jarvis",
            assistantImage: "assistant.png",
          },
          setUserData: vi.fn(),
          getGeminiResponse,
        }}
      >
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </userDataContext.Provider>,
    );
  }

  it("handles google search", async () => {
    renderGemini({
      type: "google_search",
      userInput: "React",
      response: "Searching Google",
    });

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis React",
          },
        ],
      ],
    });

    expect(window.open).toHaveBeenCalledWith(
      "https://www.google.com/search?q=React",
      "_blank",
    );
  });

  it("handles youtube search", async () => {
    renderGemini({
      type: "youtube_search",
      userInput: "Music",
      response: "Searching YouTube",
    });

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis Music",
          },
        ],
      ],
    });

    expect(window.open).toHaveBeenCalled();
  });

  it("handles youtube play", async () => {
    renderGemini({
      type: "youtube_play",
      userInput: "Songs",
      response: "Playing",
    });

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis Songs",
          },
        ],
      ],
    });

    expect(window.open).toHaveBeenCalled();
  });

  it("opens calculator", async () => {
    renderGemini({
      type: "calculator_open",
      userInput: "",
      response: "Opening Calculator",
    });

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis calculator",
          },
        ],
      ],
    });

    expect(window.open).toHaveBeenCalledWith(
      "https://www.online-calculator.com/",
      "_blank",
    );
  });

  it("opens instagram", async () => {
    renderGemini({
      type: "instagram_open",
      userInput: "",
      response: "Opening Instagram",
    });

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis instagram",
          },
        ],
      ],
    });

    expect(window.open).toHaveBeenCalledWith(
      "https://www.instagram.com/",
      "_blank",
    );
  });

  it("opens facebook", async () => {
    renderGemini({
      type: "facebook_open",
      userInput: "",
      response: "Opening Facebook",
    });

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis facebook",
          },
        ],
      ],
    });

    expect(window.open).toHaveBeenCalledWith(
      "https://www.facebook.com/",
      "_blank",
    );
  });

  it("opens weather", async () => {
    renderGemini({
      type: "weather-show",
      userInput: "",
      response: "Opening Weather",
    });

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis weather",
          },
        ],
      ],
    });

    expect(window.open).toHaveBeenCalledWith(
      "https://www.weather.com/",
      "_blank",
    );
  });
});
describe("Home Component - Remaining Branches", () => {
  let recognition;
  let getGeminiResponse;

  beforeEach(() => {
    vi.clearAllMocks();

    recognition = {
      start: vi.fn(),
      stop: vi.fn(),
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
      continuous: false,
      lang: "",
      interimResults: false,
    };

    class MockRecognition {
      constructor() {
        return recognition;
      }
    }

    window.SpeechRecognition = MockRecognition;
    window.webkitSpeechRecognition = MockRecognition;

    window.speechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: () => [],
      onvoiceschanged: null,
    };

    global.SpeechSynthesisUtterance = function (text) {
      this.text = text;
      this.onend = null;
    };

    window.open = vi.fn();

    getGeminiResponse = vi.fn();
  });

  function renderHome() {
    return render(
      <userDataContext.Provider
        value={{
          serverUrl: "/api",
          userData: {
            assistantName: "Jarvis",
            assistantImage: "assistant.png",
          },
          setUserData: vi.fn(),
          getGeminiResponse,
        }}
      >
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </userDataContext.Provider>,
    );
  }

  it("does nothing if transcript doesn't contain assistant name", async () => {
    renderHome();

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Hello there",
          },
        ],
      ],
    });

    expect(getGeminiResponse).not.toHaveBeenCalled();
  });

  it("handles Gemini API failure", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    getGeminiResponse.mockRejectedValue(new Error("Gemini Error"));

    renderHome();

    await recognition.onresult({
      results: [
        [
          {
            transcript: "Jarvis tell me a joke",
          },
        ],
      ],
    });

    expect(getGeminiResponse).toHaveBeenCalled();

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it("ignores InvalidStateError while starting recognition", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    recognition.start.mockImplementation(() => {
      const error = new Error();
      error.name = "InvalidStateError";
      throw error;
    });

    vi.useFakeTimers();

    renderHome();

    vi.advanceTimersByTime(1000);

    expect(spy).not.toHaveBeenCalled();

    vi.useRealTimers();

    spy.mockRestore();
  });

  it("logs unexpected recognition start errors", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    recognition.start.mockImplementation(() => {
      throw new Error("Microphone Error");
    });

    vi.useFakeTimers();

    renderHome();

    vi.advanceTimersByTime(1000);

    expect(spy).toHaveBeenCalled();

    vi.useRealTimers();

    spy.mockRestore();
  });

  it("cleans up when component unmounts", () => {
    const stopSpy = recognition.stop;

    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    const { unmount } = renderHome();

    unmount();

    expect(stopSpy).toHaveBeenCalled();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
