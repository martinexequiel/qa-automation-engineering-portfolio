import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Enhanced Page Object Model for Sauce Demo Login
 * 
 * DESIGN PRINCIPLES:
 * - Single Responsibility: Only login-related functionality
 * - Separation of Concerns: Actions (login, fill) vs Assertions (assertLoginSuccess, assertError)
 * - Encapsulation: Private locator methods, no selector exposure to tests
 * - Resilience: Prefers getByRole, data-test attributes as fallback
 * 
 * ARCHITECTURE:
 * 1. Private Methods: Locator helpers (getUsernameField, getPasswordField, etc.)
 * 2. Action Methods: User interactions (goto, login, fillCredentials)
 * 3. Assertion Methods: State verification (assertLoginSuccess, assertErrorShown, etc.)
 * 
 * This separation ensures tests are clean and assertions are explicit.
 */
export class LoginPage extends BasePage {
  private readonly baseUrl = process.env.BASE_URL || 'https://www.saucedemo.com';
  private readonly timeouts = {
    short: 2000,
    medium: 5000,
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // PRIVATE LOCATOR METHODS - Implementation Details
  // ============================================
  /**
   * Access username input field.
   * Prefers getByRole for accessibility, falls back to data-test.
   */
  private getUsernameField() {
    return this.page.getByRole('textbox', { name: /username/i }).or(
      this.page.locator('[data-test="username"]')
    );
  }

  /**
   * Access password input field.
   * Prefers getByRole for accessibility, falls back to data-test.
   */
  private getPasswordField() {
    return this.page.getByRole('textbox', { name: /password/i }).or(
      this.page.locator('[data-test="password"]')
    );
  }

  /**
   * Access login button.
   * Prefers getByRole for accessibility, falls back to data-test.
   */
  private getLoginButton() {
    return this.page.getByRole('button', { name: /login/i }).or(
      this.page.locator('[data-test="login-button"]')
    );
  }

  /**
   * Access error message container.
   * Used for assertion and visibility checks.
   */
  private getErrorMessage() {
    return this.page.locator('[data-test="error"]');
  }

  // ============================================
  // ACTION METHODS - User Interactions
  // ============================================
  /**
   * Navigate to the login page and wait for page load.
   * No assertions - just navigation.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.baseUrl);
    
    // Wait for the page to be interactive
    await this.getUsernameField().waitFor({
      state: 'visible',
      timeout: this.timeouts.medium,
    });
  }

  /**
   * Fill login credentials and submit form.
   * Does NOT assert on success/failure - caller is responsible for assertions.
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillCredentials(username, password);
    await this.clickLoginButton();
    
    // Wait for navigation or error to appear
    await Promise.race([
      this.page.waitForURL('**/inventory.html', { timeout: this.timeouts.medium }),
      this.getErrorMessage().waitFor({ state: 'visible', timeout: this.timeouts.medium }),
    ]).catch(() => {
      // Ignored: test will verify state
    });
  }

  /**
   * Fill username and password fields.
   * Extracted as a private helper for reusability.
   */
  private async fillCredentials(username: string, password: string): Promise<void> {
    await this.getUsernameField().fill(username);
    await this.getPasswordField().fill(password);
  }

  /**
   * Click the login button.
   * Extracted as a private helper for clarity.
   */
  private async clickLoginButton(): Promise<void> {
    await this.getLoginButton().click();
  }

  // ============================================
  // ASSERTION METHODS - State Verification
  // ============================================
  /**
   * Assert that login was successful.
   * Verifies: URL, page title, no error message.
   */
  async assertLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.page).toHaveTitle('Swag Labs');
    await this.assertNoErrorMessage();
  }

  /**
   * Assert that error message is displayed and contains expected text.
   */
  async assertErrorMessage(expectedText: string): Promise<void> {
    const errorLocator = this.getErrorMessage();
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText(expectedText);
  }

  /**
   * Assert that NO error message is visible.
   */
  async assertNoErrorMessage(): Promise<void> {
    const errorLocator = this.getErrorMessage();
    const count = await errorLocator.count();
    expect(count).toBe(0);
  }

  /**
   * Assert that the login form is displayed and ready.
   */
  async assertLoginFormVisible(): Promise<void> {
    await expect(this.getUsernameField()).toBeVisible();
    await expect(this.getPasswordField()).toBeVisible();
    await expect(this.getLoginButton()).toBeVisible();
  }

  /**
   * Get error message text (for debugging/flexible assertions).
   * Deprecated: Use assertErrorMessage() instead for consistent testing.
   */
  async getErrorText(): Promise<string> {
    try {
      const errorLocator = this.getErrorMessage();
      await errorLocator.waitFor({ state: 'visible', timeout: this.timeouts.short });
      return await errorLocator.innerText();
    } catch {
      return '';
    }
  }
}
