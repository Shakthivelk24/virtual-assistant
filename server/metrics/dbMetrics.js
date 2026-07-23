import { databaseQueriesCounter,assistantRequestsCounter,cloudinaryUploadsCounter } from "./metrics.js";

// ============================================================
// Database Query Counter
// ============================================================

export const recordDatabaseQuery = () => {
  databaseQueriesCounter.inc();
};

// ============================================================
// Multiple Database Queries
// ============================================================

export const recordDatabaseQueries = (count = 1) => {
  databaseQueriesCounter.inc(count);
};

export const assistantRequestsQuery = () => {
  assistantRequestsCounter.inc();
}

export const cloudinaryUploadsQuery = () => {
  cloudinaryUploadsCounter.inc();
}