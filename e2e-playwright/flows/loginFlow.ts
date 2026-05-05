import { Page } from '@playwright/test';
import { LoginPage } from '@pages/index';

/**
 * LOGIN FLOW - Business Logic Layer
 * 
 * Purpose:
 * - Orchestrates reusable authentication flows
 * - Represents real user behavior at business level
 * - Separates page interactions from test logic
 * - Eliminates test code duplication
 * 
 * PHILOSOPHY:
 * - Each flow = one business scenario
 * - Flows use page objects (not tests)
 * - Minimal assertions (or none) - let tests assert
 * - Returns state/data when needed for test assertions
 * 
 * USAGE:
 * Instead of:
 *   await loginPage.goto();
 *   await loginPage.login(username, password);
 *   await loginPage.assertLoginSuccess();
 * 
 * Do this:
 *   await loginAsStandardUser(page);
 * 
 * Or:
 *   await loginWithCredentials(page, username, password);
 *   await loginPage.assertLoginSuccess();
 */

/**
 * LOGIN AS STANDARD USER - Common positive flow
 * 
 * This is the most frequent login scenario in tests.
 * Orchestrates the complete successful login flow.
 * 
 * @param page - Playwright Page instance
 * @returns LoginPage instance for assertions
 * @example
 * const loginPage = await loginAsStandardUser(page);
 * await loginPage.assertLoginSuccess();
 */
export async function loginAsStandardUser(page: Page): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  return loginPage;
}

/**
 * LOGIN WITH CUSTOM CREDENTIALS - Generic login flow
 * 
 * Reusable for any credential combination.
 * Allows tests to be more flexible and parameterized.
 * 
 * @param page - Playwright Page instance
 * @param username - User account username
 * @param password - User account password
 * @returns LoginPage instance for assertions
 * @example
 * const loginPage = await loginWithCredentials(page, 'standard_user', 'secret_sauce');
 * await loginPage.assertLoginSuccess();
 */
export async function loginWithCredentials(
  page: Page,
  username: string,
  password: string
): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);
  return loginPage;
}

/**
 * LOGIN AND EXPECT FAILURE - Negative flow
 * 
 * Used for testing invalid credentials, locked accounts, etc.
 * Ensures error state without passing (test verifies the error).
 * 
 * @param page - Playwright Page instance
 * @param username - User account username
 * @param password - User account password
 * @returns LoginPage instance for error assertions
 * @example
 * const loginPage = await loginAndExpectFailure(page, 'invalid_user', 'wrong_password');
 * await loginPage.assertErrorMessage('Username and password do not match');
 */
export async function loginAndExpectFailure(
  page: Page,
  username: string,
  password: string
): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);
  // Note: No assertion here - caller is responsible
  return loginPage;
}
