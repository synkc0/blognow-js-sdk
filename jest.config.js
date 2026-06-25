module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    // entities (transitive of node-html-parser) ships ESM-only; downlevel it for Jest.
    '^.+\\.js$': ['ts-jest', { isolatedModules: true, tsconfig: { allowJs: true } }],
  },
  // Transform only the ESM dep, keep the rest of node_modules ignored.
  transformIgnorePatterns: ['/node_modules/(?!(entities)/)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
};