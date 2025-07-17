// Jest setup file for Microsoft Bot Framework tests
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.MicrosoftAppId = 'test-app-id';
process.env.MicrosoftAppPassword = 'test-app-password';
process.env.PORT = '3978';

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG) {
    console.log = jest.fn();
}

// Setup test timeout
jest.setTimeout(10000);