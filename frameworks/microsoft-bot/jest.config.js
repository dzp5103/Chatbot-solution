module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/test'],
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!**/node_modules/**'
    ],
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
    testTimeout: 10000,
    verbose: true
};