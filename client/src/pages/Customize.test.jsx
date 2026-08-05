import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Customize from "./Customize";
import { userDataContext } from "../context/UserContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Card component
vi.mock("../components/Card", () => ({
  default: ({ image }) => (
    <div data-testid="card">
      <img src={image} alt="assistant" />
    </div>
  ),
}));

// Mock images
vi.mock("../assets/image1.avif", () => ({ default: "image1" }));
vi.mock("../assets/image2.png", () => ({ default: "image2" }));
vi.mock("../assets/image3.jpg", () => ({ default: "image3" }));
vi.mock("../assets/image4.jpg", () => ({ default: "image4" }));
vi.mock("../assets/image5.jpg", () => ({ default: "image5" }));
vi.mock("../assets/image6.webp", () => ({ default: "image6" }));
vi.mock("../assets/image7.avif", () => ({ default: "image7" }));

const renderComponent = (selectedImage = null, frontendImage = null) => {
  const setFrontendImage = vi.fn();
  const setBackendImage = vi.fn();
  const setSelectedImage = vi.fn();
  const setUserData = vi.fn();

  render(
    <userDataContext.Provider
      value={{
        serverUrl: "/api",
        userData: {},
        setUserData,
        frontendImage,
        setFrontendImage,
        backendImage: null,
        setBackendImage,
        selectedImage,
        setSelectedImage,
      }}
    >
      <MemoryRouter>
        <Customize />
      </MemoryRouter>
    </userDataContext.Provider>
  );

  return {
    setFrontendImage,
    setBackendImage,
    setSelectedImage,
  };
};

describe("Customize Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    global.URL.createObjectURL = vi.fn(() => "preview-image");
  });

  it("renders heading", () => {
    renderComponent();

    expect(
      screen.getByText(/Select your/i)
    ).toBeInTheDocument();
  });

  it("renders seven assistant cards", () => {
    renderComponent();

    expect(
      screen.getAllByTestId("card")
    ).toHaveLength(7);
  });

  it("does not show Next button initially", () => {
    renderComponent();

    expect(
      screen.queryByRole("button", {
        name: /next/i,
      })
    ).not.toBeInTheDocument();
  });

  it("shows Next button when image is selected", () => {
    renderComponent("image1");

    expect(
      screen.getByRole("button", {
        name: /next/i,
      })
    ).toBeInTheDocument();
  });

  it("navigates to customize2", () => {
    renderComponent("image1");

    fireEvent.click(
      screen.getByRole("button", {
        name: /next/i,
      })
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      "/customize2"
    );
  });

  it("navigates back to home", () => {
    renderComponent();

    const backButton = document.querySelector("svg");

    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("uploads image successfully", () => {
    const {
      setFrontendImage,
      setBackendImage,
    } = renderComponent();

    const file = new File(
      ["dummy"],
      "avatar.png",
      {
        type: "image/png",
      }
    );

    const input = document.querySelector(
      'input[type="file"]'
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(setBackendImage).toHaveBeenCalledWith(file);

    expect(setFrontendImage).toHaveBeenCalledWith(
      "preview-image"
    );
  });

  it("renders uploaded preview image", () => {
    renderComponent(
      "input",
      "preview-image"
    );

    expect(
      screen.getByAltText("custom")
    ).toBeInTheDocument();
  });
  it("opens file picker and selects input option when upload card is clicked", () => {
  const setFrontendImage = vi.fn();
  const setBackendImage = vi.fn();
  const setSelectedImage = vi.fn();

  render(
    <userDataContext.Provider
      value={{
        serverUrl: "/api",
        userData: {},
        setUserData: vi.fn(),
        frontendImage: null,
        setFrontendImage,
        backendImage: null,
        setBackendImage,
        selectedImage: null,
        setSelectedImage,
      }}
    >
      <MemoryRouter>
        <Customize />
      </MemoryRouter>
    </userDataContext.Provider>
  );

  const input = document.querySelector('input[type="file"]');

  const clickSpy = vi
    .spyOn(input, "click")
    .mockImplementation(() => {});

  // Upload card is the parent element just before the hidden input
  fireEvent.click(input.previousElementSibling);

  expect(clickSpy).toHaveBeenCalled();
  expect(setSelectedImage).toHaveBeenCalledWith("input");

  clickSpy.mockRestore();
});
});