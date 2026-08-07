import { jest } from "@jest/globals";

// ============================
// Mock Dependencies
// ============================

const mockSave = jest.fn();

const MockUser = jest.fn().mockImplementation((data) => ({
  ...data,
  _id: "123",
  save: mockSave,
}));

MockUser.findOne = jest.fn();

jest.unstable_mockModule("../../models/user.models.js", () => ({
  default: MockUser,
}));

jest.unstable_mockModule("../../config/token.js", () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule("../../metrics/authMetrics.js", () => ({
  recordSuccessfulLogin: jest.fn(),
  recordFailedLogin: jest.fn(),
  recordUserRegistration: jest.fn(),
  recordUserLogout: jest.fn(),
}));

jest.unstable_mockModule("../../metrics/dbMetrics.js", () => ({
  recordDatabaseQuery: jest.fn(),
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

// ============================
// Imports
// ============================

const bcrypt = (await import("bcryptjs")).default;
const User = (await import("../../models/user.models.js")).default;
const token = (await import("../../config/token.js")).default;

const {
  signUp,
  signIn,
  signOut,
} = await import("../../controllers/auth.controllers.js");

// ============================
// Mock Request & Response
// ============================

const mockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);

  return res;
};

// ============================
// Tests
// ============================

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================
  // SIGN UP
  // ==========================

  describe("signUp", () => {
    test("should return 400 if user already exists", async () => {
      User.findOne.mockResolvedValue({ email: "test@test.com" });

      const req = {
        body: {
          name: "John",
          email: "test@test.com",
          password: "123456",
        },
      };

      const res = mockResponse();

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User already exists",
      });
    });

    test("should return 400 if password is too short", async () => {
      User.findOne.mockResolvedValue(null);

      const req = {
        body: {
          name: "John",
          email: "test@test.com",
          password: "123",
        },
      };

      const res = mockResponse();

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Password length must be 6 or more",
      });
    });

    test("should signup successfully", async () => {
      User.findOne.mockResolvedValue(null);

      bcrypt.genSalt.mockResolvedValue("salt");

      bcrypt.hash.mockResolvedValue("hashedPassword");

      

      token.mockResolvedValue("jwt-token");

      const req = {
        body: {
          name: "John",
          email: "test@test.com",
          password: "123456",
        },
      };

      const res = mockResponse();

      await signUp(req, res);

      expect(res.cookie).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        message: "Signup success",
      });
    });

    test("should return 500 on signup error", async () => {
      User.findOne.mockRejectedValue(new Error());

      const req = {
        body: {},
      };

      const res = mockResponse();

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================
  // SIGN IN
  // ==========================

  describe("signIn", () => {
    test("should return user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const req = {
        body: {
          email: "abc@test.com",
          password: "123456",
        },
      };

      const res = mockResponse();

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "User not found",
      });
    });

    test("should return wrong credentials", async () => {
      User.findOne.mockResolvedValue({
        password: "hashed",
      });

      bcrypt.compare.mockResolvedValue(false);

      const req = {
        body: {
          email: "abc@test.com",
          password: "123456",
        },
      };

      const res = mockResponse();

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith({
        message: "Wrong credentials",
      });
    });

    test("should signin successfully", async () => {
      User.findOne.mockResolvedValue({
        _id: "1",
        password: "hashed",
      });

      bcrypt.compare.mockResolvedValue(true);

      token.mockResolvedValue("jwt-token");

      const req = {
        body: {
          email: "abc@test.com",
          password: "123456",
        },
      };

      const res = mockResponse();

      await signIn(req, res);

      expect(res.cookie).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        message: "Signin success",
      });
    });

    test("should return 500 on signin error", async () => {
      User.findOne.mockRejectedValue(new Error());

      const req = {
        body: {},
      };

      const res = mockResponse();

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================
  // SIGN OUT
  // ==========================

  describe("signOut", () => {
    test("should logout successfully", async () => {
      const req = {};

      const res = mockResponse();

      await signOut(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        message: "Logout success",
      });
    });

    test("should handle logout error", async () => {
      const req = {};

      const res = mockResponse();

      res.clearCookie.mockImplementation(() => {
        throw new Error();
      });

      await signOut(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        message: "Server issue",
      });
    });
  });
});