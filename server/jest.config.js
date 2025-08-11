/** @type {import('jest').Config} */
module.exports = {
  // Environment
  testEnvironment: 'node',

  // Test files
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],

  // Output & stability
  verbose: true,
  
  testTimeout: 10000,       // from main

  // Coverage (from main)
  collectCoverage: true,
  collectCoverageFrom: [
    'services/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageProvider: 'v8',

  // Setup (from main). If you don't have this file, create it or comment this out.
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
