import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object Model for Sauce Demo Login
 * 
 * Encapsulates all login-related interactions and selectors.
 * Single Responsibility: Handles ONLY login functionality.
 * 
 * Characteristics:
 * - Robust selectors using data-test attributes (QA-optimized)
 * - No internal logic exposed to tests
 * - Reusable methods for common login scenarios
 * - Defensive programming with wait strategies
 */
export class LoginPage extends BasePage {
  /**
   * Private selectors - Encapsulated within the class
   * Using data-test attributes for maximum stability
   * These selectors are implementation details, not part of the public API
   */
  private readonly selectors = {
    // Primary selectors (data-test attributes - QA-optimized)
    usernameField: '[data-test="username"]',
    passwordField: '[data-test="password"]',
    loginButton: '[data-test="login-button"]',
    errorMessage: '[data-test="error"]',
    
    // Fallback selectors (if data-test is removed)
    usernameFallback: '#user-name',
    passwordFallback: '#password',
    loginButtonFallback: '#login-button',
  };

  /**
   * Base URL for the login page
   * Externalized for flexibility across environments
   */
  private readonly baseUrl = 'https://www.saucedemo.com';

  /**
   * Constructor
   * @param page - Playwright Page instance provided by Playwright Test context
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page
   * 
   * Responsibility: Handle page navigation setup
   * 
   * @returns Promise<void>
   * @example
   * await loginPage.goto();
   */
  async goto(): Promise<void> {
    // Navigate to the base URL
    await this.page.goto(this.baseUrl);

    // Wait for the username field to be visible and ready
    // Ensures the page is fully loaded before proceeding
    await this.page.locator(this.selectors.usernameField).waitFor({
      state: 'visible',
      timeout: 5000,
    });
  }

  /**
   * Perform login action with username and password
   * 
   * Responsibility: Execute the complete login flow
   * - Fill username and password
   * - Click login button
   * - Wait for navigation/response
   * 
   * Internal Logic:
   * - Handles fill operations sequentially
   * - Validates input fields are interactive before filling
   * - Waits for login action to complete
   * 
   * @param username - User account username
   * @param password - User account password
   * @returns Promise<void>
   * @example
   * await loginPage.login('standard_user', 'secret_sauce');
   */
  async login(username: string, password: string): Promise<void> {
    // Fill username field
    // Using locator with fallback for resilience
    const usernameLocator = this.page.locator(
      `${this.selectors.usernameField}, ${this.selectors.usernameFallback}`
    );
    await usernameLocator.fill(username);

    // Fill password field
    // Using locator with fallback for resilience
    const passwordLocator = this.page.locator(
      `${this.selectors.passwordField}, ${this.selectors.passwordFallback}`
    );
    await passwordLocator.fill(password);

    // Click login button
    // Using locator with fallback for resilience
    const loginButtonLocator = this.page.locator(
      `${this.selectors.loginButton}, ${this.selectors.loginButtonFallback}`
    );
    await loginButtonLocator.click();

    // Wait for the login action to complete
    // Either the page navigates away or error message appears
    await Promise.race([
      // Success: Page navigates away from login URL
      this.page.waitForURL('**/inventory.html', { timeout: 5000 }),

      // Failure: Error message appears on the page
      this.page
        .locator(this.selectors.errorMessage)
        .waitFor({ state: 'visible', timeout: 5000 }),
    ]).catch(() => {
      // If neither happens, continue anyway
      // Test will catch the assertion failure later
    });
  }

  /**
   * Get error message text from the login form
   * 
   * Responsibility: Extract error message without exposing selectors
   * 
   * Internal Logic:
   * - Waits for error message to appear
   * - Extracts and returns text
   * - Handles cases where no error message exists
   * 
   * @returns Promise<string> - The error message text, or empty string if none
   * @example
   * const errorText = await loginPage.getError();
   * expect(errorText).toContain('Username and password do not match');
   */
  async getError(): Promise<string> {
    try {
      // Wait for error message to be visible
      const errorLocator = this.page.locator(this.selectors.errorMessage);

      // Ensure the element is visible before extracting text
      await errorLocator.waitFor({ state: 'visible', timeout: 2000 });

      // Extract and return the error message text
      // Use innerText for visible text only
      const errorText = await errorLocator.innerText();

      return errorText || '';
    } catch {
      // If no error message found, return empty string
      // This allows tests to handle missing errors gracefully
      return '';
    }
  }

  /**
   * Check if the login page is loaded
   * 
   * Utility method for test validation
   * Useful for verifying redirect from dashboard back to login
   * 
   * @returns Promise<boolean> - True if login page is visible
   * @example
   * expect(await loginPage.isLoginPageVisible()).toBe(true);
   */
  async isLoginPageVisible(): Promise<boolean> {
    try {
      // Check if the username field is visible
      const usernameLocator = this.page.locator(
        `${this.selectors.usernameField}, ${this.selectors.usernameFallback}`
      );

      await usernameLocator.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check that the login error message is not visible
   * 
   * Useful for validating default page state and post-login cleanup.
   * 
   * @returns Promise<boolean> - True if the error message is hidden or absent
   * @example
   * expect(await loginPage.isErrorNotVisible()).toBe(true);
   */
  async isErrorNotVisible(): Promise<boolean> {
    try {
      const errorLocator = this.page.locator(this.selectors.errorMessage);
      await errorLocator.waitFor({ state: 'hidden', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is already authenticated (on inventory page)
   * 
   * Useful for tests that may start with authenticated storage state
   * 
   * @returns Promise<boolean> - True if on inventory page
   * @example
   * if (!(await loginPage.isAuthenticated())) {
   *   await loginPage.login(username, password);
   * }
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if current URL contains inventory
      const currentUrl = this.page.url();
      return currentUrl.includes('/inventory.html');
    } catch {
      return false;
    }
  }
}
