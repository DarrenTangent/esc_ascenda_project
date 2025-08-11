/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  // If you use mongodb-memory-server in tests/setupMongo.js, add:
  // setupFilesAfterEnv: ['<rootDir>/tests/setupMongo.js'],
  // Helps avoid race conditions with DB
  runInBand: true
};
