import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Environment Configuration Variables
 * These are read from .env file or system environment variables
 * Best Practice: Externalize configuration to avoid hardcoding values
 */
const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';
const HEADED = process.env.HEADED === 'true' || false;
const SLOW_MO = parseInt(process.env.SLOW_MO || '0');
const TIMEOUT = parseInt(process.env.TIMEOUT || '30000');
const RETRIES_CI = parseInt(process.env.RETRIES_CI || '2');
const RETRIES_LOCAL = parseInt(process.env.RETRIES_LOCAL || '0');

/**
 * Playwright Configuration for Professional QA Automation
 * Reference: https://playwright.dev/docs/test-configuration
 * 
 * Key Decisions:
 * 1. Headless: true (default) - runs tests without visual browser for efficiency
 * 2. Parallel: true - maximizes test execution speed on multi-core systems
 * 3. Retries: CI=2, Local=0 - prevents flakiness in CI pipelines
 * 4. Screenshots: only on failure - reduces storage while capturing critical evidence
 * 5. Videos: only on failure - essential for debugging failed tests
 * 6. Trace: on first retry - captures comprehensive state for debugging
 * 7. Environment-driven: all values configurable via .env or CLI
 */
export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  
  /**
   * Test Execution: Run tests in parallel for speed
   * CI environments use workers: 1 to avoid resource contention
   */
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  /**
   * Fail Fast Rules for Quality Gates
   * forbidOnly: Prevents accidentally committed test.only() in CI/CD
   * forbidSkip: Optional - uncomment to block skipped tests in CI
   */
  forbidOnly: !!process.env.CI,
  // forbidSkip: !!process.env.CI,

  /**
   * Retry Strategy
   * - CI environments: 2 retries to reduce false negatives (flaky tests)
   * - Local development: 0 retries to catch issues immediately
   * This balances between catching real bugs and tolerating transient failures
   */
  retries: process.env.CI ? RETRIES_CI : RETRIES_LOCAL,

  /**
   * Timeout Configuration
   * Global timeout for test execution (in milliseconds)
   * Note: Individual actions (click, navigate) use actionTimeout
   */
  timeout: TIMEOUT,

  /**
   * Reporters: Multiple reporters for different audiences
   * - html: Visual report for test results and artifacts
   * - json: Machine-readable for CI/CD integrations
   * - list: Console output for real-time feedback
   */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  /**
   * Output Directory Configuration
   * Artifacts from failed tests: screenshots, videos, traces
   * Organized for easy navigation and debugging
   */
  outputDir: 'test-results',

  /**
   * Shared browser and action configuration
   * Applied to all projects unless overridden
   * Reference: https://playwright.dev/docs/api/class-testoptions
   */
  use: {
    /**
     * Storage State for Authenticated Sessions
     * Loads pre-authenticated browser state to avoid login in every test
     * Improves test performance and maintainability
     */
    storageState: 'playwright/.auth/standard-user.json',

    /**
     * Base URL for relative navigation
     * Used in tests: await page.goto('/login')
     * Externalizes environment-specific URLs
     */
    baseURL: BASE_URL,

    /**
     * Navigation and Action Timeouts
     * actionTimeout: Individual action timeout (click, fill, etc.)
     * navigationTimeout: Page load timeout
     */
    actionTimeout: TIMEOUT,
    navigationTimeout: TIMEOUT,

    /**
     * Execution Mode
     * headless: false = visual browser window (for debugging)
     * headless: true = headless mode (for CI/CD and efficiency)
     * Controlled via HEADED environment variable
     */
    headless: !HEADED,

    /**
     * Debugging and Development
     * slowMo: Slows down test execution (useful for debugging/demos)
     * Controlled via SLOW_MO environment variable
     */
    slowMo: SLOW_MO,

    /**
     * Failure Artifacts: Capture evidence for debugging failed tests
     * screenshot: only on failure - balances storage vs diagnostic info
     * video: only on failure - captures test execution before failure
     * trace: on-first-retry - full test state including DOM, network
     */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  /**
   * Browser Projects Configuration
   * Defines which browsers to test against
   * Each project inherits base configuration and can override settings
   * Best Practice: Test against multiple browsers for cross-browser compatibility
   */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Uncomment for mobile testing - extends cross-browser coverage */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Uncomment for branded browser testing */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /**
   * Web Server Configuration (Optional)
   * Uncomment to start a local dev server before tests
   * Useful for testing local applications in development
   * reuseExistingServer: false in CI to ensure clean state
   */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
