import express from "express";
import request from "supertest";
import mongoose from "mongoose";
import { jest } from "@jest/globals";

// ============================
// Mock Dependencies
// ============================

jest.unstable_mockModule("../config/db.js", () => ({
  default: jest.fn(),
}));

jest.unstable_mockModule("../metrics/httpMetrics.js", () => ({
  default: (req, res, next) => next(),
}));

jest.unstable_mockModule("../metrics/metrics.js", () => ({
  default: {
    contentType: "text/plain",
    metrics: jest.fn().mockResolvedValue("metrics-data"),
  },
}));

jest.unstable_mockModule("../routers/auth.routes.js", () => ({
  default: express.Router(),
}));

jest.unstable_mockModule("../routers/user.routes.js", () => ({
  default: express.Router(),
}));

// ============================
// Import App AFTER mocks
// ============================

const { default: app } = await import("../app.js");

// ============================
// Tests
// ============================

describe("App", () => {
  test("GET /api/health returns 200 with database disconnected", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      status: "UP",
      service: "backend",
      database: "disconnected",
    });
  });

  test("GET /api/health returns database connected when mongoose readyState is 1", async () => {
    const originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, "readyState", {
      value: 1,
      configurable: true,
    });

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "UP",
      service: "backend",
      database: "connected",
    });

    Object.defineProperty(mongoose.connection, "readyState", {
      value: originalReadyState,
      configurable: true,
    });
  });

  test("GET /metrics returns metrics", async () => {
    const res = await request(app).get("/metrics");

    expect(res.status).toBe(200);
    expect(res.text).toBe("metrics-data");
  });

  test("Health endpoint returns JSON", async () => {
    const res = await request(app).get("/api/health");

    expect(res.headers["content-type"]).toMatch(/application\/json/);
  });

  test("Unknown route returns 404", async () => {
    const res = await request(app).get("/unknown-route");

    expect(res.status).toBe(404);
  });
});