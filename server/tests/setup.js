// Jest setup file for DestinationService tests

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

// Console log suppression for cleaner test output
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  // Suppress console.error during tests unless it's a test failure
  console.error = (...args) => {
    if (process.env.NODE_ENV !== 'test' || args[0]?.includes?.('Error')) {
      originalConsoleError(...args);
    }
  };
  
  // Optionally suppress console.log during tests
  if (process.env.SUPPRESS_LOGS === 'true') {
    console.log = () => {};
  }
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
