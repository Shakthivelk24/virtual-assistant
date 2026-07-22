import client from "prom-client";

// ============================================================
// Prometheus Registry
// ============================================================

const register = new client.Registry();

// ============================================================
// Collect Default Node.js Metrics
// ============================================================

client.collectDefaultMetrics({
  register,
});

// ============================================================
// HTTP Metrics
// ============================================================

export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// ============================================================
// Authentication Metrics
// ============================================================

export const loginCounter = new client.Counter({
  name: "user_login_total",
  help: "Total successful user logins",
  registers: [register],
});

export const failedLoginCounter = new client.Counter({
  name: "user_login_failed_total",
  help: "Total failed login attempts",
  registers: [register],
});

export const registrationCounter = new client.Counter({
  name: "user_registration_total",
  help: "Total registered users",
  registers: [register],
});

export const activeUsersGauge = new client.Gauge({
  name: "active_users",
  help: "Current active users",
  registers: [register],
});

// ============================================================
// Database Metrics
// ============================================================

export const databaseQueriesCounter = new client.Counter({
  name: "database_queries_total",
  help: "Total database queries executed",
  registers: [register],
});

// ============================================================
// Error Metrics
// ============================================================

export const serverErrorCounter = new client.Counter({
  name: "server_errors_total",
  help: "Total internal server errors",
  registers: [register],
});

export const assistantRequestsCounter = new client.Counter({
  name: "assistant_requests_total",
  help: "Total requests sent to the AI assistant",
  registers: [register],
});

export const cloudinaryUploadsCounter = new client.Counter({
  name: "cloudinary_uploads_total",
  help: "Total Cloudinary image uploads",
  registers: [register],
});

// ============================================================
// Registry Export
// ============================================================

export { register };

export default register;