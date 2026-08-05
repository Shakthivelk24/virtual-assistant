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

import Customize2 from "./Customize2";
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

const renderComponent = ({
  backendImage = null,
  selectedImage = "image1",
  assistantName = "",
} = {}) => {
  const setUserData = vi.fn();

  render(
    <userDataContext.Provider
      value={{
        serverUrl: "/api",
        userData: {
          assistantName,
        },
        backendImage,
        selectedImage,
        setUserData,
      }}
    >
      <MemoryRouter>
        <Customize2 />
      </MemoryRouter>
    </userDataContext.Provider>
  );

  return { setUserData };
};

describe("Customize2 Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading", () => {
    renderComponent();

    expect(
      screen.getByText(/Assistant Name/i)
    ).toBeInTheDocument();
  });

  it("renders input with existing assistant name", () => {
    renderComponent({
      assistantName: "Jarvis",
    });

    expect(
      screen.getByPlaceholderText("eg : Krishna")
    ).toHaveValue("Jarvis");
  });

  it("updates assistant name", () => {
    renderComponent();

    const input = screen.getByPlaceholderText(
      "eg : Krishna"
    );

    fireEvent.change(input, {
      target: {
        value: "Friday",
      },
    });

    expect(input).toHaveValue("Friday");
  });

  it("does not show button when assistant name is empty", () => {
    renderComponent();

    expect(
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
  });

  it("shows button when assistant name is entered", () => {
    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Friday",
        },
      }
    );

    expect(
      screen.getByRole("button")
    ).toBeInTheDocument();
  });

  it("updates assistant using uploaded image", async () => {
    axios.put.mockResolvedValue({
      data: {
        assistantName: "Friday",
      },
    });

    const { setUserData } = renderComponent({
      backendImage: new File(
        ["dummy"],
        "assistant.png"
      ),
    });

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Friday",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button")
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });

    expect(setUserData).toHaveBeenCalledWith({
      assistantName: "Friday",
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("updates assistant using selected image url", async () => {
    axios.put.mockResolvedValue({
      data: {
        assistantName: "Friday",
      },
    });

    renderComponent({
      backendImage: null,
      selectedImage: "image2",
    });

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Friday",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button")
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });
  });

  it("handles update failure", async () => {
    const spy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    axios.put.mockRejectedValue(
      new Error("Network Error")
    );

    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Friday",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button")
    );

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    spy.mockRestore();
  });

  it("shows loading state while updating", async () => {
    axios.put.mockImplementation(
      () => new Promise(() => {})
    );

    renderComponent();

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Friday",
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
      screen.getByText("Updating...")
    ).toBeInTheDocument();
  });

  it("navigates back", () => {
    renderComponent();

    const backButton =
      document.querySelector("svg");

    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});