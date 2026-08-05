import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Card from "./Card";
import { userDataContext } from "../context/UserContext";

const renderComponent = (selectedImage = null) => {
  const setSelectedImage = vi.fn();
  const setBackendImage = vi.fn();
  const setFrontendImage = vi.fn();

  const utils = render(
    <userDataContext.Provider
      value={{
        serverUrl: "/api",
        userData: null,
        setUserData: vi.fn(),
        frontendImage: null,
        setFrontendImage,
        backendImage: null,
        setBackendImage,
        selectedImage,
        setSelectedImage,
      }}
    >
      <Card image="assistant.png" />
    </userDataContext.Provider>
  );

  return {
    ...utils,
    setSelectedImage,
    setBackendImage,
    setFrontendImage,
  };
};

describe("Card Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the image", () => {
    renderComponent();

    const image = screen.getByAltText("card image");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "assistant.png");
  });

  it("selects the image when clicked", () => {
    const {
      setSelectedImage,
      setBackendImage,
      setFrontendImage,
    } = renderComponent();

    fireEvent.click(screen.getByAltText("card image"));

    expect(setSelectedImage).toHaveBeenCalledWith(
      "assistant.png"
    );

    expect(setBackendImage).toHaveBeenCalledWith(null);

    expect(setFrontendImage).toHaveBeenCalledWith(null);
  });

  it("applies selected styles when image is selected", () => {
    const { container } = renderComponent("assistant.png");

    expect(container.firstChild.className).toContain(
      "border-white"
    );

    expect(container.firstChild.className).toContain(
      "shadow-2xl"
    );
  });

  it("does not apply selected styles when image is not selected", () => {
    const { container } = renderComponent("another-image.png");

    expect(container.firstChild.className).not.toContain(
      "border-4"
    );
  });
});