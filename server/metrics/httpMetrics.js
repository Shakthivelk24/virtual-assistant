import {
  httpRequestsTotal,
  httpRequestDuration,
  serverErrorCounter,
} from "./metrics.js";

// ============================================================
// HTTP Metrics Middleware
// ============================================================

const httpMetrics = (req, res, next) => {
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const route = req.route?.path || req.originalUrl || req.path;

    // Total HTTP Requests
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode,
    });

    // Request Duration
    end({
      method: req.method,
      route,
      status: res.statusCode,
    });

    // Server Errors
    if (res.statusCode >= 500) {
      serverErrorCounter.inc();
    }
  });

  next();
};

export default httpMetrics;