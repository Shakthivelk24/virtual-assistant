import React from "react";

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
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

import SignIn from "./SignIn.jsx";
import { userDataContext } from "../context/UserContext.jsx";
import axios from "axios";


// ============================================================
// HOISTED MOCKS
// ============================================================

const { mockNavigate, mockToastSuccess, mockToastError } =
  vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
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
// REACT ROUTER MOCK
// ============================================================

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});


// ============================================================
// REACT HOT TOAST MOCK
// ============================================================

vi.mock("react-hot-toast", () => ({
  default: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));


// ============================================================
// CONTEXT
// ============================================================

const createContextValue = () => ({
  serverUrl: "/api",

  userData: null,

  setUserData: vi.fn(),

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

const renderSignIn = () => {
  return render(
    <userDataContext.Provider value={contextValue}>
      <SignIn />
    </userDataContext.Provider>
  );
};


// ============================================================
// BEFORE EACH
// ============================================================

beforeEach(() => {
  vi.clearAllMocks();

  contextValue = createContextValue();

  localStorage.clear();

  axios.post.mockReset();
  axios.get.mockReset();

  mockNavigate.mockClear();

  mockToastSuccess.mockClear();
  mockToastError.mockClear();
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
// SIGN IN COMPONENT
// ============================================================

describe("SignIn Component", () => {

  // ==========================================================
  // RENDERING
  // ==========================================================

  it("renders the sign in form", () => {
    renderSignIn();

    expect(
      screen.getByText("Virtual Assistant")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Enter your Email"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(
        "Enter your password"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sign In",
      })
    ).toBeInTheDocument();
  });


  // ==========================================================
  // EMAIL
  // ==========================================================

  it("allows the user to enter email", () => {
    renderSignIn();

    const emailInput =
      screen.getByPlaceholderText(
        "Enter your Email"
      );

    fireEvent.change(emailInput, {
      target: {
        value: "test@example.com",
      },
    });

    expect(emailInput).toHaveValue(
      "test@example.com"
    );
  });


  // ==========================================================
  // PASSWORD
  // ==========================================================

  it("allows the user to enter password", () => {
    renderSignIn();

    const passwordInput =
      screen.getByPlaceholderText(
        "Enter your password"
      );

    fireEvent.change(passwordInput, {
      target: {
        value: "password123",
      },
    });

    expect(passwordInput).toHaveValue(
      "password123"
    );
  });


  // ==========================================================
  // INPUT TYPES
  // ==========================================================

  it("uses correct input types", () => {
    renderSignIn();

    expect(
      screen.getByPlaceholderText(
        "Enter your Email"
      )
    ).toHaveAttribute("type", "email");

    expect(
      screen.getByPlaceholderText(
        "Enter your password"
      )
    ).toHaveAttribute("type", "password");
  });


  // ==========================================================
  // SUCCESSFUL SIGN IN
  // ==========================================================

  it("signs in successfully", async () => {
    const user = {
      _id: "user123",
      name: "Shakthi",
      email: "test@example.com",
      assistantName: "Radha",
    };

    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-jwt-token",
      },
    });

    axios.get.mockResolvedValueOnce({
      data: user,
    });

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/auth/signin",
        {
          email: "test@example.com",
          password: "password123",
        },
        {
          withCredentials: true,
        }
      );
    });

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

    expect(
      localStorage.getItem("token")
    ).toBe("test-jwt-token");

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(user);

    expect(
      mockToastSuccess
    ).toHaveBeenCalledWith(
      "Signed In Successfully"
    );

    expect(
      mockNavigate
    ).toHaveBeenCalledWith("/");
  });


  // ==========================================================
  // REMOVE OLD TOKEN
  // ==========================================================

  it("removes old token before signing in", async () => {
    localStorage.setItem(
      "token",
      "old-token"
    );

    axios.post.mockResolvedValueOnce({
      data: {
        token: "new-token",
      },
    });

    axios.get.mockResolvedValueOnce({
      data: {
        _id: "user123",
        name: "Shakthi",
        email: "test@example.com",
      },
    });

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(
      localStorage.getItem("token")
    ).toBe("new-token");
  });


  // ==========================================================
  // JWT USED FOR CURRENT USER
  // ==========================================================

  it("uses returned JWT for current user request", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "my-secret-token",
      },
    });

    axios.get.mockResolvedValueOnce({
      data: {
        _id: "user123",
        name: "Shakthi",
        email: "shakthi@example.com",
        assistantName: "Radha",
      },
    });

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/user/current",
        {
          withCredentials: true,
          headers: {
            Authorization:
              "Bearer my-secret-token",
          },
        }
      );
    });
  });


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  it("shows Signing In while request is in progress", async () => {
    let resolvePost;

    axios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        })
    );

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      await screen.findByRole("button", {
        name: "Signing In...",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Signing In...",
      })
    ).toBeDisabled();

    axios.get.mockResolvedValueOnce({
      data: {
        _id: "user123",
        name: "Shakthi",
        email: "test@example.com",
        assistantName: "Radha",
      },
    });

    await act(async () => {
      resolvePost({
        data: {
          token: "test-token",
        },
      });
    });

    await waitFor(() => {
      expect(
        mockNavigate
      ).toHaveBeenCalledWith("/");
    });
  });


  // ==========================================================
  // NO TOKEN FROM BACKEND
  // ==========================================================

  it("shows error when backend does not return token", async () => {
    axios.post.mockResolvedValueOnce({
      data: {},
    });

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      await screen.findByText(
        "Token was not received from the server"
      )
    ).toBeInTheDocument();

    expect(
      localStorage.getItem("token")
    ).toBeNull();

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);

    expect(
      mockToastError
    ).toHaveBeenCalledWith(
      "Token was not received from the server"
    );
  });


  // ==========================================================
  // BACKEND ERROR MESSAGE
  // ==========================================================

  it("shows backend error message", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Invalid email or password",
        },
      },
    });

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "wrong@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "wrongpassword",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      await screen.findByText(
        "Invalid email or password"
      )
    ).toBeInTheDocument();

    expect(
      mockToastError
    ).toHaveBeenCalledWith(
      "Invalid email or password"
    );

    expect(
      localStorage.getItem("token")
    ).toBeNull();
  });


  // ==========================================================
  // GENERIC API ERROR
  // ==========================================================

  it("shows generic error when API fails without response", async () => {
    axios.post.mockRejectedValueOnce(
      new Error("Network Error")
    );

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      await screen.findByText("Network Error")
    ).toBeInTheDocument();

    expect(
      mockToastError
    ).toHaveBeenCalledWith(
      "Network Error"
    );
  });


  // ==========================================================
  // REMOVE TOKEN AFTER FAILURE
  // ==========================================================

  it("removes token after failed sign in", async () => {
    localStorage.setItem(
      "token",
      "old-token"
    );

    axios.post.mockRejectedValueOnce(
      new Error("Login failed")
    );

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    await waitFor(() => {
      expect(
        localStorage.getItem("token")
      ).toBeNull();
    });

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);
  });


  // ==========================================================
  // NAVIGATE TO SIGNUP
  // ==========================================================

  it("navigates to signup page", () => {
    renderSignIn();

    const signUpText =
      screen.getByText("Sign Up");

    fireEvent.click(signUpText);

    expect(
      mockNavigate
    ).toHaveBeenCalledWith("/signup");
  });


  // ==========================================================
  // FORM SUBMISSION
  // ==========================================================

  it("submits form when Sign In button is clicked", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-token",
      },
    });

    axios.get.mockResolvedValueOnce({
      data: {
        _id: "user123",
        name: "Shakthi",
        email: "test@example.com",
        assistantName: "Radha",
      },
    });

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(
        1
      );
    });
  });


  // ==========================================================
  // ACTUAL USER DATA
  // ==========================================================

  it("stores actual user data in context", async () => {
    const user = {
      _id: "user123",
      name: "Shakthi",
      email: "shakthi@example.com",
      assistantName: "Radha",
    };

    axios.post.mockResolvedValueOnce({
      data: {
        token: "jwt-token",
      },
    });

    axios.get.mockResolvedValueOnce({
      data: user,
    });

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "shakthi@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    await waitFor(() => {
      expect(
        contextValue.setUserData
      ).toHaveBeenCalledWith(user);
    });

    expect(
      localStorage.getItem("token")
    ).toBe("jwt-token");

    expect(
      mockToastSuccess
    ).toHaveBeenCalledWith(
      "Signed In Successfully"
    );

    expect(
      mockNavigate
    ).toHaveBeenCalledWith("/");
  });

  // ==========================================================
  // NO USER DATA RECEIVED
  // ==========================================================

  it("shows error when user data is not received from server", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-token",
      },
    });

    axios.get.mockResolvedValueOnce({});

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Email"),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      await screen.findByText(
        "User data was not received from the server"
      )
    ).toBeInTheDocument();

    expect(localStorage.getItem("token")).toBeNull();
    expect(contextValue.setUserData).toHaveBeenCalledWith(null);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ==========================================================
  // DEFAULT ERROR FALLBACK
  // ==========================================================

  it("shows default error message when error has no response or message", async () => {
    axios.post.mockRejectedValueOnce({});

    renderSignIn();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Email"),
      {
        target: {
          value: "test@example.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: {
          value: "password123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign In",
      })
    );

    expect(
      await screen.findByText(
        "An error occurred during sign in"
      )
    ).toBeInTheDocument();

    expect(mockToastError).toHaveBeenCalledWith(
      "An error occurred during sign in"
    );
  });

});