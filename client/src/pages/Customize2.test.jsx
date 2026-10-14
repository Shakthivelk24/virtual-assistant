import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

import Customize2 from "./Customize2";
import { userDataContext } from "../context/UserContext.jsx";

// Mock axios
vi.mock("axios", () => ({
  default: {
    put: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-icons
vi.mock("react-icons/md", () => ({
  MdArrowBack: ({ onClick, ...props }) => (
    <button
      data-testid="back-button"
      onClick={onClick}
      {...props}
    >
      Back
    </button>
  ),
}));

const renderCustomize2 = (contextValue) => {
  return render(
    <MemoryRouter>
      <userDataContext.Provider value={contextValue}>
        <Customize2 />
      </userDataContext.Provider>
    </MemoryRouter>
  );
};

describe("Customize2 Component", () => {
  let contextValue;

  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();

    contextValue = {
      userData: {
        assistantName: "",
      },

      serverUrl: "/api",

      backendImage: null,

      selectedImage: "default-assistant.png",

      setUserData: vi.fn(),
    };
  });

  // ==========================================
  // 1. RENDER COMPONENT
  // ==========================================

  it("renders assistant name input", () => {
    renderCustomize2(contextValue);

    expect(
      screen.getByPlaceholderText("eg : Krishna")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Assistant Name")
    ).toBeInTheDocument();
  });

  // ==========================================
  // 2. INITIAL ASSISTANT NAME
  // ==========================================

  it("loads existing assistant name from userData", () => {
    contextValue.userData = {
      assistantName: "Krishna",
    };

    renderCustomize2(contextValue);

    const input = screen.getByPlaceholderText("eg : Krishna");

    expect(input).toHaveValue("Krishna");
  });

  // ==========================================
  // 3. EMPTY ASSISTANT NAME
  // ==========================================

  it("does not show create button when assistant name is empty", () => {
    renderCustomize2(contextValue);

    expect(
      screen.queryByRole("button", {
        name: "Finally Create Your Assistant",
      })
    ).not.toBeInTheDocument();
  });

  // ==========================================
  // 4. TYPE ASSISTANT NAME
  // ==========================================

  it("updates assistant name when user types", () => {
    renderCustomize2(contextValue);

    const input = screen.getByPlaceholderText("eg : Krishna");

    fireEvent.change(input, {
      target: {
        value: "Radha",
      },
    });

    expect(input).toHaveValue("Radha");
  });

  // ==========================================
  // 5. SHOW CREATE BUTTON
  // ==========================================

  it("shows create button when assistant name is entered", () => {
    renderCustomize2(contextValue);

    const input = screen.getByPlaceholderText("eg : Krishna");

    fireEvent.change(input, {
      target: {
        value: "Radha",
      },
    });

    expect(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    ).toBeInTheDocument();
  });

  // ==========================================
  // 6. NO TOKEN
  // ==========================================

  it("does not update assistant when token is missing", async () => {
    renderCustomize2(contextValue);

    const input = screen.getByPlaceholderText("eg : Krishna");

    fireEvent.change(input, {
      target: {
        value: "Radha",
      },
    });

    const button = screen.getByRole("button", {
      name: "Finally Create Your Assistant",
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.put).not.toHaveBeenCalled();
    });

    expect(contextValue.setUserData).not.toHaveBeenCalled();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // ==========================================
  // 7. SUCCESSFUL UPDATE
  // ==========================================

  it("updates assistant successfully", async () => {
    localStorage.setItem("token", "test-token");

    const updatedUser = {
      _id: "123",
      name: "Shakthi",
      assistantName: "Radha",
    };

    axios.put.mockResolvedValueOnce({
      data: updatedUser,
    });

    renderCustomize2(contextValue);

    const input = screen.getByPlaceholderText("eg : Krishna");

    fireEvent.change(input, {
      target: {
        value: "Radha",
      },
    });

    const button = screen.getByRole("button", {
      name: "Finally Create Your Assistant",
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledTimes(1);
    });

    expect(axios.put).toHaveBeenCalledWith(
      "/api/user/update",
      expect.any(FormData),
      {
        withCredentials: true,
        headers: {
          Authorization: "Bearer test-token",
        },
      }
    );

    expect(contextValue.setUserData).toHaveBeenCalledWith(
      updatedUser
    );

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // ==========================================
  // 8. FORM DATA WITH SELECTED IMAGE
  // ==========================================

  it("sends selected image when backendImage is not available", async () => {
    localStorage.setItem("token", "test-token");

    axios.put.mockResolvedValueOnce({
      data: {
        assistantName: "Radha",
      },
    });

    contextValue.backendImage = null;
    contextValue.selectedImage = "assistant.png";

    renderCustomize2(contextValue);

    const input = screen.getByPlaceholderText("eg : Krishna");

    fireEvent.change(input, {
      target: {
        value: "Radha",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });

    const formData = axios.put.mock.calls[0][1];

    expect(formData).toBeInstanceOf(FormData);

    expect(formData.get("assistantName")).toBe("Radha");

    expect(formData.get("imageUrl")).toBe(
      "assistant.png"
    );

    expect(formData.get("assistantImage")).toBeNull();
  });

  // ==========================================
  // 9. FORM DATA WITH BACKEND IMAGE
  // ==========================================

  it("sends backend image when backendImage exists", async () => {
    localStorage.setItem("token", "test-token");

    axios.put.mockResolvedValueOnce({
      data: {
        assistantName: "Radha",
      },
    });

    const imageFile = new File(
      ["image-content"],
      "assistant.png",
      {
        type: "image/png",
      }
    );

    contextValue.backendImage = imageFile;

    renderCustomize2(contextValue);

    const input = screen.getByPlaceholderText("eg : Krishna");

    fireEvent.change(input, {
      target: {
        value: "Radha",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });

    const formData = axios.put.mock.calls[0][1];

    expect(formData).toBeInstanceOf(FormData);

    expect(formData.get("assistantName")).toBe("Radha");

    expect(formData.get("assistantImage")).toBe(
      imageFile
    );

    expect(formData.get("imageUrl")).toBeNull();
  });

  // ==========================================
  // 10. AUTHORIZATION HEADER
  // ==========================================

  it("sends JWT authorization header", async () => {
    localStorage.setItem("token", "my-jwt-token");

    axios.put.mockResolvedValueOnce({
      data: {
        assistantName: "Radha",
      },
    });

    renderCustomize2(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Radha",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/user/update",
        expect.any(FormData),
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer my-jwt-token",
          },
        }
      );
    });
  });

  // ==========================================
  // 11. LOADING STATE
  // ==========================================

  it("shows Updating while request is in progress", async () => {
    localStorage.setItem("token", "test-token");

    let resolveRequest;

    axios.put.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    renderCustomize2(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Radha",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Updating...",
      })
    ).toBeDisabled();

    resolveRequest({
      data: {
        assistantName: "Radha",
      },
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  // ==========================================
  // 12. API ERROR
  // ==========================================

  it("handles API update error", async () => {
    localStorage.setItem("token", "test-token");

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    axios.put.mockRejectedValueOnce({
      response: {
        data: {
          message: "Update failed",
        },
      },
    });

    renderCustomize2(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Radha",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });

    expect(contextValue.setUserData).not.toHaveBeenCalled();

    expect(mockNavigate).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Finally Create Your Assistant",
        })
      ).not.toBeDisabled();
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  // ==========================================
  // 13. BACK BUTTON
  // ==========================================

  it("navigates back when back button is clicked", () => {
    renderCustomize2(contextValue);

    fireEvent.click(
      screen.getByTestId("back-button")
    );

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  // ==========================================
  // 14. SET USER DATA AFTER SUCCESS
  // ==========================================

  it("updates context userData after successful assistant creation", async () => {
    localStorage.setItem("token", "test-token");

    const updatedUser = {
      _id: "user123",
      assistantName: "Krishna",
      assistantImage: "krishna.png",
    };

    axios.put.mockResolvedValueOnce({
      data: updatedUser,
    });

    renderCustomize2(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Krishna",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    );

    await waitFor(() => {
      expect(contextValue.setUserData).toHaveBeenCalledWith(
        updatedUser
      );
    });
  });

  // ==========================================
  // 15. ERROR WITHOUT RESPONSE DATA
  // ==========================================

  it("handles update error without response data using error.message", async () => {
    localStorage.setItem("token", "test-token");

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    axios.put.mockRejectedValueOnce(
      new Error("Network update failed")
    );

    renderCustomize2(contextValue);

    fireEvent.change(
      screen.getByPlaceholderText("eg : Krishna"),
      {
        target: {
          value: "Krishna",
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Finally Create Your Assistant",
      })
    );

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });

    expect(consoleError).toHaveBeenCalledWith(
      "❌ Error in updating assistant:",
      "Network update failed"
    );

    expect(contextValue.setUserData).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});