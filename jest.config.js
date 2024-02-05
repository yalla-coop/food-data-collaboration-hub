module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '@datafoodconsortium/connector': require.resolve(
      '@datafoodconsortium/connector'
    )
  }
};
