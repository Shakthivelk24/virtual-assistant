import { jest } from "@jest/globals";

// ============================
// Mock JWT
// ============================

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: jest.fn(),
  },
}));

const jwt = (await import("jsonwebtoken")).default;

const { default: isAuth } = await import("../../middlewares/isAuth.js");

// ============================
// Mock Response
// ============================

const mockResponse = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("isAuth Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("should authenticate valid token", async () => {
    jwt.verify.mockReturnValue({
      id: "user123",
    });

    const req = {
      cookies: {
        token: "jwt-token",
      },
    };

    const res = mockResponse();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "jwt-token",
      "test-secret",
    );

    expect(req.userId).toBe("user123");

    expect(next).toHaveBeenCalled();

    expect(res.status).not.toHaveBeenCalled();
  });

  test("should return 401 when token is missing", async () => {
    const req = {
      cookies: {},
    };

    const res = mockResponse();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 for invalid token", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid Token");
    });

    const req = {
      cookies: {
        token: "invalid-token",
      },
    };

    const res = mockResponse();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 when jwt.verify throws", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("JWT Error");
    });

    const req = {
      cookies: {
        token: "jwt-token",
      },
    };

    const res = mockResponse();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });

    expect(next).not.toHaveBeenCalled();
  });
});