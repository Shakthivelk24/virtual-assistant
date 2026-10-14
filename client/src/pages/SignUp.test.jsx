import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import SignUp from "./SignUp";
import { userDataContext } from "../context/UserContext.jsx";

// ======================================================
// MOCK AXIOS
// ======================================================

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// ======================================================
// MOCK REACT HOT TOAST
// ======================================================

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ======================================================
// MOCK REACT ROUTER
// ======================================================

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ======================================================
// MOCK IMAGE
// ======================================================

vi.mock("../assets/auth.jpg", () => ({
  default: "auth.jpg",
}));

// ======================================================
// CONTEXT HELPER
// ======================================================

const renderSignUp = (contextValue) => {
  return render(
    <MemoryRouter>
      <userDataContext.Provider value={contextValue}>
        <SignUp />
      </userDataContext.Provider>
    </MemoryRouter>
  );
};

// ======================================================
// TEST SUITE
// ======================================================

describe("SignUp Component", () => {
  let contextValue;

  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();

    contextValue = {
      serverUrl: "/api",
      setUserData: vi.fn(),
    };
  });

  // ====================================================
  // 1. RENDER
  // ====================================================

  it("renders the signup form", () => {
    renderSignUp(contextValue);

    expect(
      screen.getByText("Virtual Assistant")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your Name")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your Email")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Sign Up",
      })
    ).toBeInTheDocument();
  });

  // ====================================================
  // 2. NAME INPUT
  // ====================================================

  it("allows the user to enter name", () => {
    renderSignUp(contextValue);

    const nameInput =
      screen.getByPlaceholderText(
        "Enter your Name"
      );

    fireEvent.change(nameInput, {
      target: {
        value: "Shakthi",
      },
    });

    expect(nameInput).toHaveValue("Shakthi");
  });

  // ====================================================
  // 3. EMAIL INPUT
  // ====================================================

  it("allows the user to enter email", () => {
    renderSignUp(contextValue);

    const emailInput =
      screen.getByPlaceholderText(
        "Enter your Email"
      );

    fireEvent.change(emailInput, {
      target: {
        value: "shakthi@example.com",
      },
    });

    expect(emailInput).toHaveValue(
      "shakthi@example.com"
    );
  });

  // ====================================================
  // 4. PASSWORD INPUT
  // ====================================================

  it("allows the user to enter password", () => {
    renderSignUp(contextValue);

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

  // ====================================================
  // 5. INPUT TYPES
  // ====================================================

  it("uses correct input types", () => {
    renderSignUp(contextValue);

    expect(
      screen.getByPlaceholderText(
        "Enter your Name"
      )
    ).toHaveAttribute("type", "text");

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

  // ====================================================
  // 6. SUCCESSFUL SIGNUP
  // ====================================================

  it("signs up successfully", async () => {
    const signupResponse = {
      token: "test-jwt-token",
      _id: "user123",
      name: "Shakthi",
      email: "shakthi@example.com",
    };

    axios.post.mockResolvedValueOnce({
      data: signupResponse,
    });

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/auth/signup",
        {
          name: "Shakthi",
          email: "shakthi@example.com",
          password: "password123",
        },
        {
          withCredentials: true,
        }
      );
    });

    expect(
      localStorage.getItem("token")
    ).toBe("test-jwt-token");

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(
      signupResponse
    );

    expect(toast.success).toHaveBeenCalledWith(
      "Signed Up Successfully"
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/customize"
    );
  });

  // ====================================================
  // 7. OLD TOKEN REMOVED
  // ====================================================

  it("removes old token before signup", async () => {
    localStorage.setItem(
      "token",
      "old-token"
    );

    axios.post.mockResolvedValueOnce({
      data: {
        token: "new-token",
        name: "Shakthi",
        email: "test@example.com",
      },
    });

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(
      localStorage.getItem("token")
    ).toBe("new-token");
  });

  // ====================================================
  // 8. LOADING STATE
  // ====================================================

  it("shows Signing Up while request is in progress", async () => {
    let resolveSignup;

    axios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignup = resolve;
        })
    );

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Signing Up...",
      })
    ).toBeDisabled();

    await act(async () => {
      resolveSignup({
        data: {
          token: "test-token",
          name: "Shakthi",
        },
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/customize"
      );
    });
  });

  // ====================================================
  // 9. TOKEN NOT RECEIVED
  // ====================================================

  it("shows error when backend does not return token", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        name: "Shakthi",
        email: "test@example.com",
      },
    });

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Token was not received from the server"
        )
      ).toBeInTheDocument();
    });

    expect(
      localStorage.getItem("token")
    ).toBeNull();

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);

    expect(toast.error).toHaveBeenCalledWith(
      "Token was not received from the server"
    );

    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  // ====================================================
  // 10. BACKEND ERROR
  // ====================================================

  it("displays backend error message", async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message:
            "Email already exists",
        },
      },
    });

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "existing@example.com",
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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Email already exists"
        )
      ).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Email already exists"
    );

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);

    expect(
      localStorage.getItem("token")
    ).toBeNull();

    expect(mockNavigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  // ====================================================
  // 11. GENERIC NETWORK ERROR
  // ====================================================

  it("handles network error", async () => {
    axios.post.mockRejectedValueOnce(
      new Error("Network Error")
    );

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Network Error")
      ).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Network Error"
    );

    expect(
      contextValue.setUserData
    ).toHaveBeenCalledWith(null);

    consoleSpy.mockRestore();
  });

  // ====================================================
  // 12. ERROR CLEARS TOKEN
  // ====================================================

  it("removes token after failed signup", async () => {
    localStorage.setItem(
      "token",
      "old-token"
    );

    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Signup failed",
        },
      },
    });

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(
        localStorage.getItem("token")
      ).toBeNull();
    });

    consoleSpy.mockRestore();
  });

  // ====================================================
  // 13. SIGN IN NAVIGATION
  // ====================================================

  it("navigates to signin page", () => {
    renderSignUp(contextValue);

    fireEvent.click(
      screen.getByText("Sign In")
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/signin"
    );
  });

  // ====================================================
  // 14. USER DATA IS STORED
  // ====================================================

  it("stores signup response in user context", async () => {
    const signupData = {
      token: "jwt-token",
      _id: "user123",
      name: "Shakthi",
      email: "shakthi@example.com",
    };

    axios.post.mockResolvedValueOnce({
      data: signupData,
    });

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(
        contextValue.setUserData
      ).toHaveBeenCalledWith(
        signupData
      );
    });
  });

  // ====================================================
  // 15. SIGNUP API REQUEST
  // ====================================================

  it("sends correct signup data to backend", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: "test-token",
        name: "Shakthi",
        email: "test@example.com",
      },
    });

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Name"
      ),
      {
        target: {
          value: "Shakthi Vel",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your Email"
      ),
      {
        target: {
          value: "shakthi@gmail.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter your password"
      ),
      {
        target: {
          value: "StrongPassword123",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/auth/signup",
        {
          name: "Shakthi Vel",
          email: "shakthi@gmail.com",
          password: "StrongPassword123",
        },
        {
          withCredentials: true,
        }
      );
    });
  });

  // ====================================================
  // 16. DEFAULT ERROR FALLBACK
  // ====================================================

  it("shows default error message when error has no response or message", async () => {
    axios.post.mockRejectedValueOnce({});

    renderSignUp(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Name"),
      {
        target: {
          value: "Shakthi",
        },
      }
    );

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
        name: "Sign Up",
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred during signup")
      ).toBeInTheDocument();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "An error occurred during signup"
    );
  });
});