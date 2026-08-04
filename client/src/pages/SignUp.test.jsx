import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import SignUp from "./SignUp";
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

vi.mock("../assets/auth.jpg", () => ({
  default: "auth.jpg",
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
        <SignUp />
      </MemoryRouter>
    </userDataContext.Provider>,
  );

  return { setUserData };
};

describe("SignUp Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form", () => {
    renderComponent();

    expect(screen.getByPlaceholderText("Enter your Name")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Enter your Email")).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sign up/i }),
    ).toBeInTheDocument();
  });

  it("updates input values", () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter your Name"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your Email"), {
      target: { value: "john@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "123456" },
    });

    expect(screen.getByPlaceholderText("Enter your Name")).toHaveValue("John");

    expect(screen.getByPlaceholderText("Enter your Email")).toHaveValue(
      "john@test.com",
    );

    expect(screen.getByPlaceholderText("Enter your password")).toHaveValue(
      "123456",
    );
  });

  it("registers successfully", async () => {
    axios.post.mockResolvedValue({
      data: {
        id: 1,
        name: "John",
      },
    });

    const { setUserData } = renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter your Name"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your Email"), {
      target: { value: "john@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "123456" },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign up/i,
      }),
    );

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    expect(setUserData).toHaveBeenCalledWith({
      id: 1,
      name: "John",
    });

    expect(toast.success).toHaveBeenCalledWith("Signed Up Successfully");

    expect(mockNavigate).toHaveBeenCalledWith("/customize");
  });

  it("shows error when signup fails", async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          message: "Email already exists",
        },
      },
      message: "Request Failed",
    });

    const { setUserData } = renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter your Name"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your Email"), {
      target: {
        value: "john@test.com",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: {
        value: "123456",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /sign up/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument();
    });

    expect(setUserData).toHaveBeenCalledWith(null);

    expect(toast.error).toHaveBeenCalledWith("Sign Up Failed");
  });

  it("navigates to signin page", () => {
    renderComponent();

    fireEvent.click(screen.getByText("Sign In"));

    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("disables button while loading", async () => {
    axios.post.mockImplementation(() => new Promise(() => {}));

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter your Name"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your Email"), {
      target: {
        value: "john@test.com",
      },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: {
        value: "123456",
      },
    });

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("button")).toBeDisabled();

    expect(screen.getByText("Signing Up...")).toBeInTheDocument();
  });
  it("shows default error message when response message is missing", async () => {
    axios.post.mockRejectedValue({
      message: "Network Error",
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter your Name"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your Email"), {
      target: { value: "john@test.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText("An error occurred")).toBeInTheDocument();
  });
});
