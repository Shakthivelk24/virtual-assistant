import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import SignIn from "./SignIn";
import { userDataContext } from "../context/UserContext";

vi.mock("axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../assets/auth2.jpg", () => ({
  default: "auth2.jpg",
}));

const renderComponent = () => {
  const setUserData = vi.fn();

  render(
    <userDataContext.Provider
      value={{
        serverUrl: "/api",
        userData: null,
        setUserData,
      }}
    >
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    </userDataContext.Provider>
  );

  return { setUserData };
};

describe("SignIn Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signin form", () => {
    renderComponent();

    expect(
      screen.getByPlaceholderText("Enter your Email")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    ).toBeInTheDocument();
  });

  it("updates input values", () => {
    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Email"),
      {
        target: {
          value: "john@test.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: {
          value: "123456",
        },
      }
    );

    expect(
      screen.getByPlaceholderText("Enter your Email")
    ).toHaveValue("john@test.com");

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toHaveValue("123456");
  });

  it("signs in successfully", async () => {
    axios.post.mockResolvedValue({
      data: {
        success: true,
      },
    });

    axios.get.mockResolvedValue({
      data: {
        id: 1,
        name: "John",
      },
    });

    const { setUserData } = renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Email"),
      {
        target: {
          value: "john@test.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(axios.post).toHaveBeenCalledWith(
      "/api/auth/signin",
      {
        email: "john@test.com",
        password: "123456",
      },
      {
        withCredentials: true,
      }
    );

    expect(axios.get).toHaveBeenCalledWith(
      "/api/user/current",
      {
        withCredentials: true,
      }
    );

    expect(setUserData).toHaveBeenCalledWith({
      id: 1,
      name: "John",
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Signed In Successfully"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("shows API error message", async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          message: "Invalid Credentials",
        },
      },
      message: "Request Failed",
    });

    const { setUserData } = renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Email"),
      {
        target: {
          value: "john@test.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button")
    );

    await waitFor(() => {
      expect(
        screen.getByText("Invalid Credentials")
      ).toBeInTheDocument();
    });

    expect(setUserData).toHaveBeenCalledWith(null);

    expect(toast.error).toHaveBeenCalledWith(
      "Sign In Failed"
    );
  });

  it("shows default error message", async () => {
    axios.post.mockRejectedValue({
      message: "Server Error",
    });

    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Email"),
      {
        target: {
          value: "john@test.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button")
    );

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred")
      ).toBeInTheDocument();
    });
  });

  it("navigates to signup page", () => {
    renderComponent();

    fireEvent.click(
      screen.getByText("Sign Up")
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/signup"
    );
  });

  it("disables button while loading", async () => {
    axios.post.mockImplementation(
      () => new Promise(() => {})
    );

    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("Enter your Email"),
      {
        target: {
          value: "john@test.com",
        },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter your password"),
      {
        target: {
          value: "123456",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button")
    );

    expect(
      screen.getByRole("button")
    ).toBeDisabled();

    expect(
      screen.getByText("Signing In...")
    ).toBeInTheDocument();
  });
  
});