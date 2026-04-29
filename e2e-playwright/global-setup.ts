import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { validUsers } from './utils/testData';

/**
 * Global Setup for Playwright Tests
 *
 * This setup runs once before all tests to establish authenticated sessions.
 * It creates storage state files that can be reused across tests, improving
 * performance and maintainability.
 *
 * Benefits:
 * - Eliminates repetitive login operations in tests
 * - Faster test execution (no login delays per test)
 * - Centralized authentication logic
 * - Easy to update credentials in one place
 */

async function globalSetup(config: FullConfig) {
  // Create authenticated storage state for standard user
  const standardUser = validUsers.find(user => user.username === 'standard_user');
  if (!standardUser) {
    throw new Error('Standard user not found in test data');
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);

  // Navigate and login
  await loginPage.goto();
  await loginPage.login(standardUser.username, standardUser.password);

  // Verify login success
  await page.waitForURL('**/inventory.html');

  // Save authenticated storage state
  await context.storageState({ path: 'playwright/.auth/standard-user.json' });

  await browser.close();

  // Optionally create states for other users if needed
  // For now, we focus on standard user as it's most common
}

export default globalSetup;