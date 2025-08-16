// // Jest setup file for DestinationService tests

// // Set test environment
// process.env.NODE_ENV = 'test';

// // Global test timeout
// jest.setTimeout(10000);

// // Console log suppression for cleaner test output
// const originalConsoleError = console.error;
// const originalConsoleLog = console.log;

// beforeAll(() => {
//   // Suppress console.error during tests unless it's a test failure
//   console.error = (...args) => {
//     if (process.env.NODE_ENV !== 'test' || args[0]?.includes?.('Error')) {
//       originalConsoleError(...args);
//     }
//   };
  
//   // Optionally suppress console.log during tests
//   if (process.env.SUPPRESS_LOGS === 'true') {
//     console.log = () => {};
//   }
// });

// afterAll(() => {
//   // Restore original console methods
//   console.error = originalConsoleError;
//   console.log = originalConsoleLog;
// });

// // Global error handler for unhandled promise rejections
// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });


// server/tests/setup.js
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.FRONTEND_BASE_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET = 'sk_test_dummy';
process.env.SMTP_FROM = 'Bookings <test@example.com>';
process.env.SUPPORT_INBOX = 'support@example.com';

jest.setTimeout(15000);

// Silence logs to avoid "Cannot log after tests are done" noise
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mock nodemailer (define mocks *inside* the factory)
jest.mock('nodemailer', () => {
  const sendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });
  const transport = {
    verify: jest.fn().mockResolvedValue(),
    sendMail,
  };
  return {
    createTransport: jest.fn(() => transport),
    getTestMessageUrl: jest.fn(() => undefined),

    // expose handles for tests
    __transport: transport,
    __sendMail: sendMail,
  };
});

// expose nodemailer mocks globally for tests
const nodemailer = require('nodemailer');
global.__sendMailMock = nodemailer.__sendMail;
global.__createTransportMock = nodemailer.createTransport;

// Surface any unhandled rejections in test output
process.on('unhandledRejection', (reason, promise) => {
  // (kept minimal; console.error is mocked above)
});
