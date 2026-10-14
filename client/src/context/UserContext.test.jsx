import React, { useContext } from "react";

import {
  render,
  waitFor,
  cleanup,
} from "@testing-library/react";

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import UserContext, {
  userDataContext,
} from "./UserContext.jsx";

import axios from "axios";


// ============================================================
// AXIOS MOCK
// ============================================================

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));


// ============================================================
// TEST COMPONENT
// ============================================================

function TestComponent() {
  const context = useContext(userDataContext);

  return (
    <div>
      <span data-testid="server-url">
        {context.serverUrl}
      </span>

      <span data-testid="loading">
        {context.loading ? "true" : "false"}
      </span>

      <span data-testid="user">
        {context.userData
          ? context.userData.name
          : "No User"}
      </span>
    </div>
  );
}


// ============================================================
// RENDER HELPER
// ============================================================

const renderContext = () => {
  return render(
    <UserContext>
      <TestComponent />
    </UserContext>
  );
};


// ============================================================
// BEFORE EACH
// ============================================================

beforeEach(() => {
  vi.clearAllMocks();

  axios.get.mockResolvedValue({
    data: {
      _id: "user123",
      name: "Shakthi",
      email: "shakthi@example.com",
      assistantName: "Radha",
    },
  });

  axios.post.mockReset();

  localStorage.clear();
});


// ============================================================
// AFTER EACH
// ============================================================

afterEach(() => {
  cleanup();

  localStorage.clear();

  vi.restoreAllMocks();
});


// ============================================================
// USER CONTEXT TESTS
// ============================================================

describe("UserContext", () => {

  // ==========================================================
  // SERVER URL
  // ==========================================================

  it("provides server URL", () => {
    renderContext();

    expect(
      document.querySelector(
        '[data-testid="server-url"]'
      )
    ).toHaveTextContent("/api");
  });


  // ==========================================================
  // INITIAL USER REQUEST
  // ==========================================================

  it("gets current user when context loads", async () => {
    renderContext();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/user/current",
        {
          withCredentials: true,
        }
      );
    });
  });


  // ==========================================================
  // SET USER DATA
  // ==========================================================

  it("stores current user data", async () => {
    renderContext();

    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-testid="user"]'
        )
      ).toHaveTextContent("Shakthi");
    });
  });


  // ==========================================================
  // AUTH TOKEN
  // ==========================================================

  it("sends JWT token when token exists", async () => {
    localStorage.setItem(
      "token",
      "test-jwt-token"
    );

    renderContext();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/user/current",
        {
          withCredentials: true,
          headers: {
            Authorization:
              "Bearer test-jwt-token",
          },
        }
      );
    });
  });


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  it("sets loading to false after user request completes", async () => {
    renderContext();

    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-testid="loading"]'
        )
      ).toHaveTextContent("false");
    });
  });


  // ==========================================================
  // 401 ERROR
  // ==========================================================

  it("removes token when current user returns 401", async () => {
    localStorage.setItem(
      "token",
      "expired-token"
    );

    axios.get.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          message: "Unauthorized",
        },
      },
    });

    renderContext();

    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-testid="user"]'
        )
      ).toHaveTextContent("No User");
    });

    expect(
      localStorage.getItem("token")
    ).toBeNull();
  });


  // ==========================================================
  // NON-401 ERROR
  // ==========================================================

  it("handles non-401 current user error", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    axios.get.mockRejectedValueOnce({
      response: {
        status: 500,
        data: {
          message: "Server Error",
        },
      },
    });

    renderContext();

    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-testid="loading"]'
        )
      ).toHaveTextContent("false");
    });

    expect(
      consoleError
    ).toHaveBeenCalled();

    consoleError.mockRestore();
  });


  // ==========================================================
  // GEMINI SUCCESS
  // ==========================================================

  it("gets Gemini response successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        response: "Hello Shakthi",
      },
    });

    function GeminiTest() {
      const { getGeminiResponse } =
        useContext(userDataContext);

      React.useEffect(() => {
        getGeminiResponse("Hello")
          .then((data) => {
            window.__geminiResult = data;
          });
      }, []);

      return null;
    }

    render(
      <UserContext>
        <GeminiTest />
      </UserContext>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/user/ask",
        {
          command: "Hello",
        },
        {
          withCredentials: true,
        }
      );
    });

    await waitFor(() => {
      expect(window.__geminiResult).toEqual({
        response: "Hello Shakthi",
      });
    });

    delete window.__geminiResult;
  });


  // ==========================================================
  // GEMINI WITH TOKEN
  // ==========================================================

  it("sends JWT token with Gemini request", async () => {
    localStorage.setItem(
      "token",
      "gemini-token"
    );

    axios.post.mockResolvedValueOnce({
      data: {
        response: "Authenticated response",
      },
    });

    function GeminiTest() {
      const { getGeminiResponse } =
        useContext(userDataContext);

      React.useEffect(() => {
        getGeminiResponse("Hello");
      }, []);

      return null;
    }

    render(
      <UserContext>
        <GeminiTest />
      </UserContext>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/user/ask",
        {
          command: "Hello",
        },
        {
          withCredentials: true,
          headers: {
            Authorization:
              "Bearer gemini-token",
          },
        }
      );
    });
  });


  // ==========================================================
  // GEMINI ERROR
  // ==========================================================

  it("throws error when Gemini request fails", async () => {
    const error = new Error(
      "Gemini API failed"
    );

    axios.post.mockRejectedValueOnce(error);

    let getGeminiResponseFn;

    function GeminiErrorTest() {
      const { getGeminiResponse } =
        useContext(userDataContext);

      getGeminiResponseFn = getGeminiResponse;

      return null;
    }

    render(
      <UserContext>
        <GeminiErrorTest />
      </UserContext>
    );

    await expect(
      getGeminiResponseFn("hello")
    ).rejects.toThrow(
      "Gemini API failed"
    );

    expect(axios.post).toHaveBeenCalledWith(
      "/api/user/ask",
      {
        command: "hello",
      },
      expect.any(Object)
    );
  });


  // ==========================================================
  // GEMINI REQUEST COMMAND
  // ==========================================================

  it("sends prompt as command", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        response: "Test response",
      },
    });

    function GeminiTest() {
      const { getGeminiResponse } =
        useContext(userDataContext);

      React.useEffect(() => {
        getGeminiResponse(
          "What is the weather?"
        );
      }, []);

      return null;
    }

    render(
      <UserContext>
        <GeminiTest />
      </UserContext>
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/user/ask",
        {
          command: "What is the weather?",
        },
        {
          withCredentials: true,
        }
      );
    });
  });


  // ==========================================================
  // CURRENT USER ERROR DOES NOT THROW
  // ==========================================================

  it("does not throw current user request error", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    axios.get.mockRejectedValueOnce(
      new Error("Current user failed")
    );

    renderContext();

    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-testid="loading"]'
        )
      ).toHaveTextContent("false");
    });

    expect(
      consoleError
    ).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  // ==========================================================
  // CUSTOM BACKEND URL
  // ==========================================================

  it("uses custom VITE_BACKEND_URL when provided", () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://api.example.com");

    renderContext();

    expect(
      document.querySelector(
        '[data-testid="server-url"]'
      )
    ).toHaveTextContent("https://api.example.com");

    vi.unstubAllEnvs();
  });

  it("falls back to /api when VITE_BACKEND_URL is empty", () => {
    vi.stubEnv("VITE_BACKEND_URL", "");

    renderContext();

    expect(
      document.querySelector(
        '[data-testid="server-url"]'
      )
    ).toHaveTextContent("/api");

    vi.unstubAllEnvs();
  });
});