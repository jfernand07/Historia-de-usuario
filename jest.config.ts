import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Test environment
  testEnvironment: 'node',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/tests/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/src/tests/$1'
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/index.ts',
    '!src/config/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Global setup
  globalSetup: '<rootDir>/src/tests/globalSetup.ts',
  
  // Global teardown
  globalTeardown: '<rootDir>/src/tests/globalTeardown.ts',
  
  // Module paths
  modulePaths: ['<rootDir>/src'],
  
  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',
  
  // Coverage path ignore patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/src/tests/',
    '/src/config/',
    '/src/index.ts'
  ],
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(module-that-needs-to-be-transformed)/)'
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // Extensions to treat as ES modules
  extensionsToTreatAsEsm: ['.ts'],
  
  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        module: 'esnext'
      }
    }
  },
  
  // Preset
  preset: 'ts-jest/presets/default-esm',
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Notify mode
  notify: false,
  
  // Notify mode configuration
  notifyMode: 'failure-change',
  
  // Only changed
  onlyChanged: false,
  
  // Only failures
  onlyFailures: false,
  
  // Pass with no tests
  passWithNoTests: true,
  
  // Projects
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/tests/**/*.test.ts'],
      testEnvironment: 'node'
    }
  ],
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],
  
  // Root directory
  rootDir: '.',
  
  // Roots
  roots: ['<rootDir>/src'],
  
  // Runner
  runner: 'jest-runner',
  
  // Skip node resolution
  skipNodeResolution: false,
  
  // Snapshot serializers
  snapshotSerializers: [],
  
  // Test location in results
  testLocationInResults: false,
  
  // Test sequencer
  testSequencer: '@jest/test-sequencer',
  
  // Test URL
  testURL: 'http://localhost',
  
  // Timers
  timers: 'real',
  
  // Update snapshot
  updateSnapshot: false,
  
  // Use stderr
  useStderr: false,
  
  // Watch mode
  watch: false,
  
  // Watch all
  watchAll: false,
  
  // Watchman
  watchman: true
};

export default config;
