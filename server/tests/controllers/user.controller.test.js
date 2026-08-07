import { jest } from "@jest/globals";

// ============================
// Mock Dependencies
// ============================

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.unstable_mockModule("../../config/cloudinary.js", () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule("../../gemini.js", () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule("../../metrics/dbMetrics.js", () => ({
  recordDatabaseQuery: jest.fn(),
  assistantRequestsQuery: jest.fn(),
  cloudinaryUploadsQuery: jest.fn(),
}));

jest.unstable_mockModule("../../metrics/authMetrics.js", () => ({
  recordSuccessfulLogin: jest.fn(),
  recordFailedLogin: jest.fn(),
}));

const User = (await import("../../models/user.models.js")).default;
const uploadOnCloudinary = (await import("../../config/cloudinary.js")).default;
const geminiResponse = (await import("../../gemini.js")).default;

const { getCurrentUser, updateAssistant, askToAssistant } =
  await import("../../controllers/user.controllers.js");

// ============================
// Mock Response
// ============================

const mockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // getCurrentUser
  // ============================================

  describe("getCurrentUser", () => {
    test("returns current user", async () => {
      const user = {
        name: "John",
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user),
      });

      const req = {
        userId: "1",
      };

      const res = mockResponse();

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(user);
    });

    test("returns 404 if user not found", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = {
        userId: "1",
      };

      const res = mockResponse();

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("handles server error", async () => {
      User.findById.mockImplementation(() => {
        throw new Error("Database Error");
      });

      const req = {
        userId: "1",
      };

      const res = mockResponse();

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================
  // updateAssistant
  // ============================================

  describe("updateAssistant", () => {
    test("updates using image url", async () => {
      const updatedUser = {
        assistantName: "Jarvis",
      };

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser),
      });

      const req = {
        userId: "1",
        body: {
          assistantName: "Jarvis",
          imageUrl: "image.png",
        },
      };

      const res = mockResponse();

      await updateAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("updates using uploaded image", async () => {
      uploadOnCloudinary.mockResolvedValue({
        secure_url: "cloudinary.png",
      });

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          assistantName: "Jarvis",
        }),
      });

      const req = {
        userId: "1",
        file: {
          path: "test.png",
        },
        body: {
          assistantName: "Jarvis",
        },
      };

      const res = mockResponse();

      await updateAssistant(req, res);

      expect(uploadOnCloudinary).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("returns 404", async () => {
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const req = {
        userId: "1",
        body: {},
      };

      const res = mockResponse();

      await updateAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("handles update error", async () => {
      User.findByIdAndUpdate.mockImplementation(() => {
        throw new Error("Update Error");
      });

      const req = {
        userId: "1",
        body: {},
      };

      const res = mockResponse();

      await updateAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ============================================
  // askToAssistant
  // ============================================

  describe("askToAssistant", () => {
    test("returns gemini response", async () => {
      const save = jest.fn();

      User.findById.mockResolvedValue({
        name: "John",
        assistantName: "Jarvis",
        history: [],
        save,
      });

      geminiResponse.mockResolvedValue({
        type: "general",
        response: "Hello",
      });

      const req = {
        userId: "1",
        body: {
          command: "Hi",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("returns 404 if user missing", async () => {
      User.findById.mockResolvedValue(null);

      const req = {
        userId: "1",
        body: {
          command: "Hi",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("handles invalid JSON", async () => {
      User.findById.mockResolvedValue({
        name: "John",
        assistantName: "Jarvis",
        history: [],
        save: jest.fn(),
      });

      geminiResponse.mockResolvedValue("Invalid");

      const req = {
        userId: "1",
        body: {
          command: "Hi",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("handles server error", async () => {
      User.findById.mockRejectedValue(new Error("Server Error"));

      const req = {
        userId: "1",
        body: {
          command: "Hi",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("handles get_date", async () => {
      User.findById.mockResolvedValue({
        name: "John",
        assistantName: "Jarvis",
        history: [],
        save: jest.fn(),
      });

      geminiResponse.mockResolvedValue({
        type: "get_date",
        response: "",
      });

      const req = {
        userId: "1",
        body: {
          command: "date",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("handles get_time", async () => {
      User.findById.mockResolvedValue({
        name: "John",
        assistantName: "Jarvis",
        history: [],
        save: jest.fn(),
      });

      geminiResponse.mockResolvedValue({
        type: "get_time",
        response: "",
      });

      const req = {
        userId: "1",
        body: {
          command: "time",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("handles get_day", async () => {
      User.findById.mockResolvedValue({
        name: "John",
        assistantName: "Jarvis",
        history: [],
        save: jest.fn(),
      });

      geminiResponse.mockResolvedValue({
        type: "get_day",
        response: "",
      });

      const req = {
        userId: "1",
        body: {
          command: "day",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("handles get_month", async () => {
      User.findById.mockResolvedValue({
        name: "John",
        assistantName: "Jarvis",
        history: [],
        save: jest.fn(),
      });

      geminiResponse.mockResolvedValue({
        type: "get_month",
        response: "",
      });

      const req = {
        userId: "1",
        body: {
          command: "month",
        },
      };

      const res = mockResponse();

      await askToAssistant(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
  test("parses valid JSON string returned by Gemini", async () => {
    User.findById.mockResolvedValue({
      name: "John",
      assistantName: "Jarvis",
      history: [],
      save: jest.fn(),
    });

    geminiResponse.mockResolvedValue(`
  {
    "type":"general",
    "userInput":"Hello",
    "response":"Hi"
  }
  `);

    const req = {
      userId: "1",
      body: {
        command: "Hello",
      },
    };

    const res = mockResponse();

    await askToAssistant(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith({
      type: "general",
      userInput: "Hello",
      response: "Hi",
    });
  });
});
