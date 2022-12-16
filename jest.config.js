//const tsconfigPathsJest = require('tsconfig-paths-jest')

module.exports = {
  preset: 'ts-jest',
  roots: [
    '<rootDir>/src'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts'
  ],
  testEnvironment: 'node',
  testMatch: [
    '**/?(*.)@(test|spec).@(ts|js)'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
};
