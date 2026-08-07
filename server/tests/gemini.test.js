import { jest } from "@jest/globals";

// ============================
// Mock Axios
// ============================

jest.unstable_mockModule("axios", () => ({
  default: {
    post: jest.fn(),
  },
}));

const axios = (await import("axios")).default;

const geminiResponse = (await import("../gemini.js")).default;

describe("Gemini Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_URL = "http://fake-api";
  });

  test("should return parsed JSON response", async () => {
    axios.post.mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    type: "general",
                    userInput: "Hello",
                    response: "Hi!",
                  }),
                },
              ],
            },
          },
        ],
      },
    });

    const result = await geminiResponse(
      "Hello",
      "Jarvis",
      "Shakthi"
    );

    expect(axios.post).toHaveBeenCalledWith(
      "http://fake-api",
      expect.any(Object)
    );

    expect(result).toEqual({
      type: "general",
      userInput: "Hello",
      response: "Hi!",
    });
  });

  test("should remove markdown before parsing", async () => {
    axios.post.mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: `\`\`\`json
{
"type":"general",
"userInput":"Hi",
"response":"Hello"
}
\`\`\``,
                },
              ],
            },
          },
        ],
      },
    });

    const result = await geminiResponse(
      "Hi",
      "Jarvis",
      "Shakthi"
    );

    expect(result).toEqual({
      type: "general",
      userInput: "Hi",
      response: "Hello",
    });
  });

  test("should call axios with API URL", async () => {
    axios.post.mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    type: "general",
                    userInput: "Test",
                    response: "Done",
                  }),
                },
              ],
            },
          },
        ],
      },
    });

    await geminiResponse(
      "Test",
      "Jarvis",
      "Shakthi"
    );

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post.mock.calls[0][0]).toBe(
      "http://fake-api"
    );
  });

  test("should handle invalid JSON", async () => {
    const spy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    axios.post.mockResolvedValue({
      data: {
        candidates: [
          {
            content: {
              parts: [
                {
                  text: "invalid json",
                },
              ],
            },
          },
        ],
      },
    });

    const result = await geminiResponse(
      "Hello",
      "Jarvis",
      "Shakthi"
    );

    expect(result).toBeUndefined();

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test("should handle axios error", async () => {
    const spy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    axios.post.mockRejectedValue({
      response: {
        status: 500,
        data: {
          message: "Server Error",
        },
      },
    });

    const result = await geminiResponse(
      "Hello",
      "Jarvis",
      "Shakthi"
    );

    expect(result).toBeUndefined();

    expect(spy).toHaveBeenCalledWith("Status:", 500);

    spy.mockRestore();
  });
});