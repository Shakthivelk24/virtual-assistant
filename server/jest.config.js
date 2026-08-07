export default {
  testEnvironment: "node",

  transform: {},

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageReporters: [
    "text",
    "lcov",
    "html",
  ],

  collectCoverageFrom: [
    "**/*.js",         // Optional: exclude if you don't want to test app.js
    "!config/db.js",
    "!config/token.js",
    "!config/cloudinary.js",
    "!middlewares/multer.js",
    "!node_modules/**",
    "!coverage/**",
    "!jest.config.js",
    "!models/**",          // if your config is inside /server
    "!server/models/**",
    "!server/config/**",
    "!metrics/**",
    "!server.js",
    "!routers/**",
  ],

  testMatch: [
    "**/?(*.)+(spec|test).js",
  ],
};