// UserContext.test.jsx

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import React, { useContext } from "react";
import UserContext, { userDataContext } from "../context/UserContext";

vi.mock("axios");

vi.mock("../components/Loading.jsx", () => ({
  default: () => <div>Loading...</div>,
}));

function TestComponent() {
  const context = useContext(userDataContext);

  return (
    <>
      <div data-testid="server-url">{context.serverUrl}</div>

      <div data-testid="loading">
        {context.loading ? "true" : "false"}
      </div>

      <div data-testid="username">
        {context.userData?.name || "No User"}
      </div>

      <button
        onClick={() => context.getGeminiResponse("Hello")}
      >
        Ask Gemini
      </button>
    </>
  );
}

describe("UserContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children", async () => {
    axios.get.mockResolvedValue({
      data: {
        name: "Shakthi",
      },
    });

    render(
      <UserContext>
        <TestComponent />
      </UserContext>
    );

    expect(
      screen.getByTestId("server-url")
    ).toHaveTextContent("/api");
  });

  it("fetches current user successfully", async () => {
    axios.get.mockResolvedValue({
      data: {
        name: "Shakthi",
      },
    });

    render(
      <UserContext>
        <TestComponent />
      </UserContext>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("username")
      ).toHaveTextContent("Shakthi");
    });

    expect(axios.get).toHaveBeenCalledWith(
      "/api/user/current",
      {
        withCredentials: true,
      }
    );
  });

  it("sets userData to null on 401", async () => {
    axios.get.mockRejectedValue({
      response: {
        status: 401,
      },
    });

    render(
      <UserContext>
        <TestComponent />
      </UserContext>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("username")
      ).toHaveTextContent("No User");
    });
  });

  it("handles server error gracefully", async () => {
    const spy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    axios.get.mockRejectedValue(new Error("Server Error"));

    render(
      <UserContext>
        <TestComponent />
      </UserContext>
    );

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    spy.mockRestore();
  });

  it("loading becomes false after API call", async () => {
    axios.get.mockResolvedValue({
      data: {
        name: "Shakthi",
      },
    });

    render(
      <UserContext>
        <TestComponent />
      </UserContext>
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("loading")
      ).toHaveTextContent("false");
    });
  });

  it("getGeminiResponse returns response", async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    axios.post.mockResolvedValue({
      data: {
        answer: "Hello User",
      },
    });

    let context;

    function Wrapper() {
      context = useContext(userDataContext);
      return null;
    }

    render(
      <UserContext>
        <Wrapper />
      </UserContext>
    );

    const result = await context.getGeminiResponse("Hello");

    expect(result).toEqual({
      answer: "Hello User",
    });

    expect(axios.post).toHaveBeenCalledWith(
      "/api/user/ask",
      { command: "Hello" },
      { withCredentials: true }
    );
  });

  it("returns undefined when Gemini request fails", async () => {
    axios.get.mockResolvedValue({
      data: {},
    });

    axios.post.mockRejectedValue(
      new Error("API Error")
    );

    const spy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    let context;

    function Wrapper() {
      context = useContext(userDataContext);
      return null;
    }

    render(
      <UserContext>
        <Wrapper />
      </UserContext>
    );

    const result = await context.getGeminiResponse("Hello");

    expect(result).toBeUndefined();

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});