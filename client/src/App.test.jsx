// src/App.test.jsx

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { userDataContext } from "./context/UserContext";

// --------------------
// Mock Pages
// --------------------
vi.mock("./pages/Home.jsx", () => ({
  default: () => <div>Home Page</div>,
}));

vi.mock("./pages/SignIn.jsx", () => ({
  default: () => <div>Sign In Page</div>,
}));

vi.mock("./pages/SignUp.jsx", () => ({
  default: () => <div>Sign Up Page</div>,
}));

vi.mock("./pages/Customize.jsx", () => ({
  default: () => <div>Customize Page</div>,
}));

vi.mock("./pages/Customize2.jsx", () => ({
  default: () => <div>Customize2 Page</div>,
}));

vi.mock("./components/Loading.jsx", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("react-hot-toast", () => ({
  Toaster: () => <div>Toaster</div>,
}));

function renderWithContext(
  contextValue,
  initialEntries = ["/"]
) {
  return render(
    <userDataContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </userDataContext.Provider>
  );
}

describe("App Routing", () => {
  const defaultContext = {
    userData: null,
    setUserData: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading screen", () => {
    renderWithContext({
      ...defaultContext,
      loading: true,
    });

    expect(
      screen.getByText("Loading...")
    ).toBeInTheDocument();
  });

  it("redirects guest from / to signup", () => {
    renderWithContext(defaultContext, ["/signup"]);

    expect(
      screen.getByText("Sign Up Page")
    ).toBeInTheDocument();
  });

  it("renders SignIn page for guest", () => {
    renderWithContext(defaultContext, ["/signin"]);

    expect(
      screen.getByText("Sign In Page")
    ).toBeInTheDocument();
  });

  it("renders SignUp page for guest", () => {
    renderWithContext(defaultContext, ["/signup"]);

    expect(
      screen.getByText("Sign Up Page")
    ).toBeInTheDocument();
  });

  it("redirects guest accessing customize page", () => {
    renderWithContext(defaultContext, ["/customize"]);

    expect(
      screen.getByText("Sign Up Page")
    ).toBeInTheDocument();
  });

  it("redirects guest accessing customize2 page", () => {
    renderWithContext(defaultContext, ["/customize2"]);

    expect(
      screen.getByText("Sign Up Page")
    ).toBeInTheDocument();
  });

  it("renders Home for fully customized user", () => {
    renderWithContext({
      ...defaultContext,
      userData: {
        assistantImage: "image.png",
        assistantName: "Jarvis",
      },
    });

    expect(
      screen.getByText("Home Page")
    ).toBeInTheDocument();
  });

  it("redirects logged-in user without customization", () => {
    renderWithContext(
      {
        ...defaultContext,
        userData: {},
      },
      ["/customize"]
    );

    expect(
      screen.getByText("Customize Page")
    ).toBeInTheDocument();
  });

  it("redirects logged-in user away from signin", () => {
    renderWithContext(
      {
        ...defaultContext,
        userData: {
          assistantImage: "img",
          assistantName: "AI",
        },
      },
      ["/signin"]
    );

    expect(
      screen.getByText("Home Page")
    ).toBeInTheDocument();
  });

  it("redirects logged-in user away from signup", () => {
    renderWithContext(
      {
        ...defaultContext,
        userData: {
          assistantImage: "img",
          assistantName: "AI",
        },
      },
      ["/signup"]
    );

    expect(
      screen.getByText("Home Page")
    ).toBeInTheDocument();
  });

  it("renders Customize for logged-in user", () => {
    renderWithContext(
      {
        ...defaultContext,
        userData: {
          assistantImage: "",
          assistantName: "",
        },
      },
      ["/customize"]
    );

    expect(
      screen.getByText("Customize Page")
    ).toBeInTheDocument();
  });

  it("renders Customize2 for logged-in user", () => {
    renderWithContext(
      {
        ...defaultContext,
        userData: {
          assistantImage: "",
          assistantName: "",
        },
      },
      ["/customize2"]
    );

    expect(
      screen.getByText("Customize2 Page")
    ).toBeInTheDocument();
  });
});