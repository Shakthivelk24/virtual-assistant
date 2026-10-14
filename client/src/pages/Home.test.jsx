import React from "react";

import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
  within,
} from "@testing-library/react";

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import Home from "./Home.jsx";
import { userDataContext } from "../context/UserContext.jsx";
import axios from "axios";


// ============================================================
// HOISTED MOCKS
// ============================================================

const { mockTextToSpeech, mockNavigate } = vi.hoisted(() => ({
  mockTextToSpeech: {
    stop: vi.fn(),
    speak: vi.fn(),
  },

  mockNavigate: vi.fn(),
}));


// ============================================================
// AXIOS MOCK
// ============================================================

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));


// ============================================================
// TEXT TO SPEECH MOCK
// ============================================================

vi.mock("@capacitor-community/text-to-speech", () => ({
  TextToSpeech: mockTextToSpeech,
}));


// ============================================================
// REACT ROUTER MOCK
// ============================================================

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


// ============================================================
// SPEECH RECOGNITION MOCK
// ============================================================

let recognitionInstance = null;

class MockSpeechRecognition {
  constructor() {
    recognitionInstance = this;

    this.continuous = false;
    this.lang = "";
    this.interimResults = false;
    this.maxAlternatives = 1;

    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onresult = null;

    this.start = vi.fn(() => {
      if (this.onstart) {
        this.onstart();
      }
    });

    this.stop = vi.fn(() => {
      if (this.onend) {
        this.onend();
      }
    });
  }
}


// ============================================================
// CONTEXT
// ============================================================

const createContextValue = () => ({
  userData: {
    _id: "user123",
    name: "Shakthi",
    email: "shakthi@example.com",
    assistantName: "Radha",
    assistantImage: "https://example.com/radha.jpg",
  },

  setUserData: vi.fn(),

  serverUrl: "/api",

  getGeminiResponse: vi.fn(),

  frontendImage: null,
  setFrontendImage: vi.fn(),

  backendImage: null,
  setBackendImage: vi.fn(),

  selectedImage: null,
  setSelectedImage: vi.fn(),

  loading: false,
  setLoading: vi.fn(),
});

let contextValue;


// ============================================================
// RENDER HELPER
// ============================================================

const renderHome = (value = contextValue) => {
  return render(
    <userDataContext.Provider value={value}>
      <Home />
    </userDataContext.Provider>
  );
};


// ============================================================
// BEFORE EACH
// ============================================================

beforeEach(() => {
  vi.clearAllMocks();

  contextValue = createContextValue();

  recognitionInstance = null;

  localStorage.clear();

  window.SpeechRecognition = MockSpeechRecognition;
  window.webkitSpeechRecognition = MockSpeechRecognition;

  vi.spyOn(window, "open").mockImplementation(() => null);

  mockTextToSpeech.stop.mockResolvedValue(undefined);
  mockTextToSpeech.speak.mockResolvedValue(undefined);

  mockNavigate.mockClear();

  axios.get.mockResolvedValue({
    data: {},
  });
});


// ============================================================
// AFTER EACH
// ============================================================

afterEach(() => {
  cleanup();

  vi.restoreAllMocks();

  localStorage.clear();

  recognitionInstance = null;
});


// ============================================================
// HOME COMPONENT TESTS
// ============================================================

describe("Home Component", () => {

  // ==========================================================
  // RENDERING
  // ==========================================================

  it("renders the assistant name", () => {
    renderHome();

    expect(
      screen.getByText("Radha", {
        exact: true,
      })
    ).toBeInTheDocument();
  });


  it("renders assistant image", () => {
    renderHome();

    const image = screen.getByAltText("Assistant");

    expect(image).toBeInTheDocument();

    expect(image).toHaveAttribute(
      "src",
      "https://example.com/radha.jpg"
    );
  });


  it("renders Test Native Voice button", () => {
    renderHome();

    expect(
      screen.getByRole("button", {
        name: /test native voice/i,
      })
    ).toBeInTheDocument();
  });


  // ==========================================================
  // TEXT TO SPEECH
  // ==========================================================

  it("calls TextToSpeech when Test Native Voice is clicked", async () => {
    renderHome();

    const button = screen.getByRole("button", {
      name: /test native voice/i,
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(
      mockTextToSpeech.stop
    ).toHaveBeenCalled();

    expect(
      mockTextToSpeech.speak
    ).toHaveBeenCalled();
  });


  it("uses the correct native voice configuration", async () => {
    renderHome();

    const button = screen.getByRole("button", {
      name: /test native voice/i,
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(
      mockTextToSpeech.speak
    ).toHaveBeenCalledWith({
      text: expect.stringContaining(
        "Hello. This is a test of your virtual assistant voice."
      ),
      lang: "en-IN",
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
    });
  });


  // ==========================================================
  // LOGOUT
  // ==========================================================

  it("renders logout button", () => {
    renderHome();

    expect(
      screen.getByRole("button", {
        name: /log out/i,
      })
    ).toBeInTheDocument();
  });


  it("logs out user with JWT token", async () => {
    localStorage.setItem(
      "token",
      "test-jwt-token"
    );

    axios.get.mockResolvedValueOnce({
      data: {
        message: "Logged out successfully",
      },
    });

    renderHome();

    const logoutButton = screen.getByRole(
      "button",
      {
        name: /log out/i,
      }
    );

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(axios.get).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({
        withCredentials: true,

        headers: {
          Authorization:
            "Bearer test-jwt-token",
        },
      })
    );

    expect(
      localStorage.getItem("token")
    ).toBeNull();

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);

    expect(
      mockNavigate
    ).toHaveBeenCalledWith("/signin");
  });


  it("logs out even when token does not exist", async () => {
    localStorage.removeItem("token");

    axios.get.mockResolvedValueOnce({
      data: {
        message: "Logged out successfully",
      },
    });

    renderHome();

    const logoutButton = screen.getByRole(
      "button",
      {
        name: /log out/i,
      }
    );

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(axios.get).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({
        withCredentials: true,
        headers: {},
      })
    );

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);

    expect(
      mockNavigate
    ).toHaveBeenCalledWith("/signin");
  });


  it("clears token and navigates even when logout API fails", async () => {
    localStorage.setItem(
      "token",
      "test-jwt-token"
    );

    axios.get.mockRejectedValueOnce(
      new Error("Logout API failed")
    );

    renderHome();

    const logoutButton = screen.getByRole(
      "button",
      {
        name: /log out/i,
      }
    );

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(
      localStorage.getItem("token")
    ).toBeNull();

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);

    expect(
      mockNavigate
    ).toHaveBeenCalledWith("/signin");
  });


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  it("navigates to customize page", () => {
    renderHome();

    const customizeButton =
      screen.getByRole("button", {
        name: /customize assistant/i,
      });

    fireEvent.click(customizeButton);

    expect(
      mockNavigate
    ).toHaveBeenCalledWith("/customize");
  });


  it("opens mobile menu", () => {
    renderHome();

    expect(
      screen.queryByRole("dialog", {
        name: /mobile menu/i,
      })
    ).not.toBeInTheDocument();

    const menuButton =
      document.querySelector(".lg\\:hidden");

    expect(menuButton).toBeTruthy();

    fireEvent.click(menuButton);

    const mobileMenu = screen.getByRole("dialog", {
      name: /mobile menu/i,
    });
    expect(mobileMenu).toBeInTheDocument();

    const menuScope = within(mobileMenu);

    expect(
      menuScope.getByRole("button", {
        name: /log out/i,
      })
    ).toBeInTheDocument();

    const customizeButton = menuScope.getByRole("button", {
      name: /customize assistant/i,
    });
    expect(customizeButton).toBeInTheDocument();

    fireEvent.click(customizeButton);

    expect(mockNavigate).toHaveBeenCalledWith("/customize");
  });


  // ==========================================================
  // SPEECH RECOGNITION
  // ==========================================================

  it("creates speech recognition when assistant exists", () => {
    renderHome();

    expect(
      recognitionInstance
    ).not.toBeNull();

    expect(
      recognitionInstance.continuous
    ).toBe(true);

    expect(
      recognitionInstance.lang
    ).toBe("en-US");

    expect(
      recognitionInstance.interimResults
    ).toBe(false);

    expect(
      recognitionInstance.maxAlternatives
    ).toBe(1);
  });


  it("starts speech recognition after delay", async () => {
    renderHome();

    expect(
      recognitionInstance
    ).not.toBeNull();

    expect(
      recognitionInstance.start
    ).not.toHaveBeenCalled();

    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    });

    expect(
      recognitionInstance.start
    ).toHaveBeenCalled();
  });


  // ==========================================================
  // GEMINI COMMAND
  // ==========================================================

  it(
    "sends command to Gemini when assistant name is detected",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "normal",
        userInput: "Radha hello",
        response:
          "Hello! How can I help you?",
      });

      renderHome();

      expect(
        recognitionInstance
      ).not.toBeNull();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript: "Radha hello",
              },
            ],
          ],
        });
      });

      expect(
        contextValue.getGeminiResponse
      ).toHaveBeenCalledWith(
        "Radha hello"
      );
    }
  );


  it(
    "does not call Gemini when assistant name is not detected",
    async () => {
      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript:
                  "What is the weather today",
              },
            ],
          ],
        });
      });

      expect(
        contextValue.getGeminiResponse
      ).not.toHaveBeenCalled();
    }
  );


  it(
    "handles Gemini response",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "normal",
        userInput: "Radha hello",
        response:
          "Hello! How can I help you?",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript: "Radha hello",
              },
            ],
          ],
        });
      });

      expect(
        contextValue.getGeminiResponse
      ).toHaveBeenCalledWith(
        "Radha hello"
      );

      expect(
        mockTextToSpeech.speak
      ).toHaveBeenCalledWith({
        text:
          "Hello! How can I help you?",
        lang: "en-IN",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
    }
  );


  // ==========================================================
  // GOOGLE
  // ==========================================================

  it(
    "opens Google search for google_search command",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "google_search",
        userInput: "React tutorials",
        response: "Searching Google",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript:
                  "Radha search React tutorials",
              },
            ],
          ],
        });
      });

      expect(
        window.open
      ).toHaveBeenCalledWith(
        "https://www.google.com/search?q=React%20tutorials",
        "_blank"
      );
    }
  );


  // ==========================================================
  // YOUTUBE
  // ==========================================================

  it(
    "opens YouTube search for youtube_search command",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "youtube_search",
        userInput:
          "JavaScript tutorial",
        response:
          "Searching YouTube",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript:
                  "Radha search JavaScript tutorial on YouTube",
              },
            ],
          ],
        });
      });

      expect(
        window.open
      ).toHaveBeenCalledWith(
        "https://www.youtube.com/results?search_query=JavaScript%20tutorial",
        "_blank"
      );
    }
  );


  // ==========================================================
  // CALCULATOR
  // ==========================================================

  it(
    "opens calculator for calculator command",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "calculator_open",
        userInput: "calculator",
        response:
          "Opening calculator",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript:
                  "Radha open calculator",
              },
            ],
          ],
        });
      });

      expect(
        window.open
      ).toHaveBeenCalledWith(
        "https://www.online-calculator.com/",
        "_blank"
      );
    }
  );


  // ==========================================================
  // INSTAGRAM
  // ==========================================================

  it(
    "opens Instagram for instagram_open command",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "instagram_open",
        userInput: "Instagram",
        response:
          "Opening Instagram",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript:
                  "Radha open Instagram",
              },
            ],
          ],
        });
      });

      expect(
        window.open
      ).toHaveBeenCalledWith(
        "https://www.instagram.com/",
        "_blank"
      );
    }
  );


  // ==========================================================
  // FACEBOOK
  // ==========================================================

  it(
    "opens Facebook for facebook_open command",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "facebook_open",
        userInput: "Facebook",
        response:
          "Opening Facebook",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript:
                  "Radha open Facebook",
              },
            ],
          ],
        });
      });

      expect(
        window.open
      ).toHaveBeenCalledWith(
        "https://www.facebook.com/",
        "_blank"
      );
    }
  );


  // ==========================================================
  // WEATHER
  // ==========================================================

  it(
    "opens weather website for weather command",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "weather-show",
        userInput: "weather",
        response:
          "Opening weather",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript:
                  "Radha show weather",
              },
            ],
          ],
        });
      });

      expect(
        window.open
      ).toHaveBeenCalledWith(
        "https://www.weather.com/",
        "_blank"
      );
    }
  );


  // ==========================================================
  // AI RESPONSE TTS
  // ==========================================================

  it(
    "speaks AI response using TextToSpeech",
    async () => {
      contextValue.getGeminiResponse.mockResolvedValueOnce({
        type: "normal",
        userInput: "Radha hello",
        response:
          "Hello from your assistant",
      });

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript: "Radha hello",
              },
            ],
          ],
        });
      });

      expect(
        mockTextToSpeech.speak
      ).toHaveBeenCalledWith({
        text:
          "Hello from your assistant",
        lang: "en-IN",
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      });
    }
  );


  // ==========================================================
  // GEMINI ERROR
  // ==========================================================

  it(
    "handles Gemini API error",
    async () => {
      contextValue.getGeminiResponse.mockRejectedValueOnce(
        new Error("Gemini API error")
      );

      const consoleSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      renderHome();

      await act(async () => {
        await recognitionInstance.onresult({
          results: [
            [
              {
                transcript: "Radha hello",
              },
            ],
          ],
        });
      });

      expect(
        contextValue.getGeminiResponse
      ).toHaveBeenCalledWith(
        "Radha hello"
      );

      consoleSpy.mockRestore();
    }
  );


  // ==========================================================
  // UNSUPPORTED BROWSER
  // ==========================================================

  it(
    "handles unsupported speech recognition",
    () => {
      window.SpeechRecognition = undefined;
      window.webkitSpeechRecognition =
        undefined;

      renderHome();

      expect(
        recognitionInstance
      ).toBeNull();
    }
  );


  // ==========================================================
  // LISTENING STATE
  // ==========================================================

  it(
    "shows Listening indicator when recognition starts",
    async () => {
      renderHome();

      expect(
        recognitionInstance
      ).not.toBeNull();

      await act(async () => {
        recognitionInstance.onstart();
      });

      expect(
        screen.getByText("Listening...")
      ).toBeInTheDocument();
    }
  );

  // ==========================================================
  // MOBILE MENU CLOSE
  // ==========================================================

  it("closes mobile menu when close button is clicked", () => {
    renderHome();

    const menuButton = document.querySelector(".lg\\:hidden");
    fireEvent.click(menuButton);

    const mobileMenu = screen.getByRole("dialog", { name: /mobile menu/i });
    expect(mobileMenu).toBeInTheDocument();

    const closeButton = document.querySelector(".fixed svg.cursor-pointer");
    fireEvent.click(closeButton);

    expect(
      screen.queryByRole("dialog", { name: /mobile menu/i })
    ).not.toBeInTheDocument();
  });

  // ==========================================================
  // YOUTUBE PLAY COMMAND
  // ==========================================================

  it("opens YouTube search for youtube_play command", async () => {
    contextValue.getGeminiResponse.mockResolvedValueOnce({
      type: "youtube_play",
      userInput: "believer song",
      response: "Playing song",
    });

    renderHome();

    await act(async () => {
      await recognitionInstance.onresult({
        results: [[{ transcript: "Radha play believer song" }]],
      });
    });

    expect(window.open).toHaveBeenCalledWith(
      "https://www.youtube.com/results?search_query=believer%20song",
      "_blank"
    );
  });

  // ==========================================================
  // MISSING ASSISTANT NAME
  // ==========================================================

  it("does not initialize speech recognition if assistantName is missing", () => {
    const value = { ...contextValue, userData: null };
    renderHome(value);

    expect(recognitionInstance).toBeNull();
  });

  // ==========================================================
  // SPEECH RECOGNITION START WITH DELAY ERRORS
  // ==========================================================

  it("handles InvalidStateError when starting speech recognition with delay", async () => {
    renderHome();

    const error = new Error("Already started");
    error.name = "InvalidStateError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
  });

  it("handles non-InvalidStateError when starting speech recognition with delay", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderHome();

    const error = new Error("Device busy");
    error.name = "UnknownError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error starting speech recognition:",
      error
    );

    consoleSpy.mockRestore();
  });

  // ==========================================================
  // RECOGNITION ONEND RESTART
  // ==========================================================

  it("restarts speech recognition on onend after delay", async () => {
    renderHome();

    await act(async () => {
      recognitionInstance.onend();
    });

    recognitionInstance.start.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
  });

  it("handles InvalidStateError when restarting speech recognition on onend", async () => {
    renderHome();

    // Wait for initial startup timer to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1050));
    });

    await act(async () => {
      recognitionInstance.onend();
    });

    const error = new Error("Invalid");
    error.name = "InvalidStateError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
  });

  it("handles non-InvalidStateError when restarting speech recognition on onend", async () => {
    renderHome();

    // Wait for initial startup timer to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1050));
    });

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await act(async () => {
      recognitionInstance.onend();
    });

    const error = new Error("Generic restart error");
    error.name = "GenericError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error restarting speech recognition:",
      error
    );

    consoleSpy.mockRestore();
  });

  it("does not restart recognition on onend if assistant is speaking", async () => {
    renderHome();

    let resolveSpeak;
    mockTextToSpeech.speak.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSpeak = resolve;
        })
    );

    const button = screen.getByRole("button", {
      name: /test native voice/i,
    });

    act(() => {
      fireEvent.click(button);
    });

    recognitionInstance.start.mockClear();

    act(() => {
      recognitionInstance.onend();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).not.toHaveBeenCalled();

    await act(async () => {
      resolveSpeak();
    });
  });

  // ==========================================================
  // RECOGNITION ONERROR
  // ==========================================================

  it("handles not-allowed recognition error", () => {
    renderHome();
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "not-allowed" });
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      "Microphone permission is not allowed."
    );
    consoleWarn.mockRestore();
  });

  it("handles service-not-allowed recognition error", () => {
    renderHome();
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "service-not-allowed" });
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      "Speech recognition service is not allowed."
    );
    consoleWarn.mockRestore();
  });

  it("handles network recognition error", () => {
    renderHome();
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "network" });
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      "Speech recognition network error."
    );
    consoleWarn.mockRestore();
  });

  it("handles aborted recognition error without restarting", async () => {
    renderHome();

    // Wait for initial startup timer to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1050));
    });

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "aborted" });
    });

    recognitionInstance.start.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).not.toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  it("restarts recognition on generic error and handles start error", async () => {
    renderHome();

    // Wait for initial startup timer to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1050));
    });

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "audio-capture" });
    });

    const error = new Error("Generic error");
    error.name = "CustomError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error restarting recognition:",
      error
    );

    consoleWarn.mockRestore();
    consoleSpy.mockRestore();
  });

  it("handles InvalidStateError when restarting recognition on generic error", async () => {
    renderHome();

    // Wait for initial startup timer to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1050));
    });

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "audio-capture" });
    });

    const error = new Error("Already started");
    error.name = "InvalidStateError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  it("does not restart recognition on onerror if assistant is speaking", async () => {
    renderHome();

    let resolveSpeak;
    mockTextToSpeech.speak.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSpeak = resolve;
        })
    );

    const button = screen.getByRole("button", {
      name: /test native voice/i,
    });

    act(() => {
      fireEvent.click(button);
    });

    recognitionInstance.start.mockClear();

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "audio-capture" });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).not.toHaveBeenCalled();

    consoleWarn.mockRestore();

    await act(async () => {
      resolveSpeak();
    });
  });

  // ==========================================================
  // GREETING TIMER
  // ==========================================================

  it("plays greeting after 1500ms delay", async () => {
    renderHome();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    });

    expect(mockTextToSpeech.speak).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining(
          "Hello Radha. I am online now. How can I assist you today?"
        ),
      })
    );
  });

  // ==========================================================
  // UNMOUNT CLEANUP ERRORS
  // ==========================================================

  it("handles errors during component unmount cleanup", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const { unmount } = renderHome();

    recognitionInstance.stop.mockImplementationOnce(() => {
      throw new Error("Cleanup stop failed");
    });

    mockTextToSpeech.stop.mockRejectedValueOnce(
      new Error("TTS cleanup failed")
    );

    unmount();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Recognition cleanup:",
      expect.any(Error)
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "TTS cleanup:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  // ==========================================================
  // TEST NATIVE VOICE ERRORS & RESTART
  // ==========================================================

  it("handles recognition stop error during testNativeVoice and restarts recognition", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderHome();

    recognitionInstance.stop.mockImplementationOnce(() => {
      throw new Error("Recognition stop failed");
    });

    const button = screen.getByRole("button", {
      name: /test native voice/i,
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Recognition stop:",
      expect.any(Error)
    );

    recognitionInstance.start.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles TextToSpeech error during testNativeVoice and restarts recognition", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderHome();

    mockTextToSpeech.speak.mockRejectedValueOnce(
      new Error("TTS speak error")
    );

    const button = screen.getByRole("button", {
      name: /test native voice/i,
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(consoleError).toHaveBeenCalledWith(
      "❌ TEST NATIVE VOICE ERROR:",
      expect.any(Error)
    );

    recognitionInstance.start.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  // ==========================================================
  // SPEAK FUNCTION BRANCHES
  // ==========================================================

  it("handles empty response in speak without calling TTS", async () => {
    contextValue.getGeminiResponse.mockResolvedValueOnce({
      type: "normal",
      userInput: "Radha",
      response: "",
    });

    renderHome();
    mockTextToSpeech.speak.mockClear();

    await act(async () => {
      await recognitionInstance.onresult({
        results: [[{ transcript: "Radha" }]],
      });
    });

    expect(mockTextToSpeech.speak).not.toHaveBeenCalled();
  });

  it("handles TTS stop warning in speak and restarts recognition after speaking", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mockTextToSpeech.stop.mockRejectedValueOnce(
      new Error("TTS stop warning error")
    );

    contextValue.getGeminiResponse.mockResolvedValueOnce({
      type: "normal",
      userInput: "Radha hello",
      response: "Hello there",
    });

    renderHome();

    await act(async () => {
      await recognitionInstance.onresult({
        results: [[{ transcript: "Radha hello" }]],
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "TTS stop warning:",
      expect.any(Error)
    );

    recognitionInstance.start.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles TTS error in speak and restarts recognition", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockTextToSpeech.speak.mockRejectedValueOnce(
      new Error("Speak failure")
    );

    contextValue.getGeminiResponse.mockResolvedValueOnce({
      type: "normal",
      userInput: "Radha hello",
      response: "Hello there",
    });

    renderHome();

    await act(async () => {
      await recognitionInstance.onresult({
        results: [[{ transcript: "Radha hello" }]],
      });
    });

    expect(consoleError).toHaveBeenCalledWith(
      "❌ Native TTS error:",
      expect.any(Error)
    );

    recognitionInstance.start.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    expect(recognitionInstance.start).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("handles startRecognition start errors", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    contextValue.getGeminiResponse.mockResolvedValueOnce({
      type: "normal",
      userInput: "Radha hello",
      response: "Hi",
    });

    renderHome();

    await act(async () => {
      await recognitionInstance.onresult({
        results: [[{ transcript: "Radha hello" }]],
      });
    });

    const error = new Error("Microphone busy");
    error.name = "CustomError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Recognition start error:",
      error
    );

    consoleError.mockRestore();
  });

  it("ignores InvalidStateError in startRecognition", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    contextValue.getGeminiResponse.mockResolvedValueOnce({
      type: "normal",
      userInput: "Radha hello",
      response: "Hi",
    });

    renderHome();

    await act(async () => {
      await recognitionInstance.onresult({
        results: [[{ transcript: "Radha hello" }]],
      });
    });

    const error = new Error("Invalid state");
    error.name = "InvalidStateError";
    recognitionInstance.start.mockImplementationOnce(() => {
      throw error;
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 850));
    });

    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  // ==========================================================
  // TEST NATIVE VOICE WITHOUT RECOGNITION INSTANCE
  // ==========================================================

  it("runs testNativeVoice when recognitionRef.current is null", async () => {
    const value = {
      ...contextValue,
      userData: {
        ...contextValue.userData,
        assistantName: "",
      },
    };
    renderHome(value);

    const button = screen.getByRole("button", {
      name: /test native voice/i,
    });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(mockTextToSpeech.speak).toHaveBeenCalled();
  });

  // ==========================================================
  // GREETING TIMER UNMOUNTED
  // ==========================================================

  it("does not speak greeting if unmounted and timer fires", async () => {
    const clearTimeoutSpy = vi
      .spyOn(window, "clearTimeout")
      .mockImplementation(() => {});

    const { unmount } = renderHome();

    mockTextToSpeech.speak.mockClear();

    unmount();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1550));
    });

    expect(mockTextToSpeech.speak).not.toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  // ==========================================================
  // ONERROR TIMEOUT WHEN ALREADY RECOGNIZING
  // ==========================================================

  it("does not restart recognition in onerror timeout if recognition is already running", async () => {
    renderHome();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1050));
    });

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    act(() => {
      recognitionInstance.onerror({ error: "audio-capture" });
    });

    // Simulate recognition already running before the 1000ms timeout fires
    act(() => {
      recognitionInstance.onstart();
    });

    recognitionInstance.start.mockClear();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(recognitionInstance.start).not.toHaveBeenCalled();
    consoleWarn.mockRestore();
  });
});