module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  moduleNameMapper: {
    '@datafoodconsortium/connector': require.resolve(
      '@datafoodconsortium/connector'
    )
  }
};
