import {
  loginCounter,
  failedLoginCounter,
  registrationCounter,
  activeUsersGauge,
} from "./metrics.js";

// ============================================================
// Successful Login
// ============================================================

export const recordSuccessfulLogin = () => {
  loginCounter.inc();
  activeUsersGauge.inc();
};

// ============================================================
// Failed Login
// ============================================================

export const recordFailedLogin = () => {
  failedLoginCounter.inc();
};

// ============================================================
// User Registration
// ============================================================

export const recordUserRegistration = () => {
  registrationCounter.inc();
};

// ============================================================
// User Logout
// ============================================================

export const recordUserLogout = () => {
  const current = activeUsersGauge.get();

  // Prevent negative values
  if (current > 0) {
    activeUsersGauge.dec();
  }
};