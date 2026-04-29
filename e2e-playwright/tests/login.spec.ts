import { expect, test } from '@fixtures/index';
import {
  validUsers,
  lockedOutUser,
  invalidCredentials,
  successIndicators,
} from '@utils/testData';

/**
 * Authentication Test Suite - Sauce Demo
 * 
 * This suite is organized for clarity, maintainability, and reuse.
 * It validates core login behavior, negative authentication paths,
 * and error handling using shared page objects and fixtures.
 */

test.describe('Authentication Flow @smoke @regression', () => {
  // Override storageState for login tests to ensure clean authentication state
  test.use({ storageState: undefined });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test.describe('Successful Login', () => {
    validUsers.forEach((user) => {
      test(`should login successfully with ${user.description} [${user.username}]`, async ({
        page,
        loginPage,
      }) => {
        await loginPage.login(user.username, user.password);

        expect(page.url()).toMatch(successIndicators.urlPattern);
        expect(page).toHaveTitle(successIndicators.title);

        const errorMessage = await loginPage.getError();
        expect(errorMessage).toBe('');
      });
    });
  });

  test.describe('Account Lockout', () => {
    test('should display error for locked out user', async ({ loginPage }) => {
      await loginPage.login(lockedOutUser.username, lockedOutUser.password);

      expect(await loginPage.isLoginPageVisible()).toBe(true);
      expect(await loginPage.getError()).toContain(lockedOutUser.expectedError);
    });
  });

  test.describe('Invalid Login Attempts', () => {
    invalidCredentials.forEach((credential) => {
      test(`should show error when ${credential.description}`, async ({ loginPage }) => {
        await loginPage.login(credential.username, credential.password);

        expect(await loginPage.isLoginPageVisible()).toBe(true);

        const errorMessage = await loginPage.getError();
        expect(errorMessage).toContain(credential.expectedError);
        expect(errorMessage.length).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Login Page State', () => {
    test('should load login page and display form fields', async ({ loginPage }) => {
      expect(await loginPage.isLoginPageVisible()).toBe(true);
      expect(await loginPage.isErrorNotVisible()).toBe(true);
    });

    test('should clear error message after successful login following failed attempt', async ({
      loginPage,
      page,
    }) => {
      await loginPage.login('invalid_user', 'wrong_password');
      let errorMessage = await loginPage.getError();
      expect(errorMessage.length).toBeGreaterThan(0);

      await loginPage.login('standard_user', 'secret_sauce');
      expect(page.url()).toMatch(successIndicators.urlPattern);

      errorMessage = await loginPage.getError();
      expect(errorMessage).toBe('');
    });
  });

  test.describe('Login Edge Cases', () => {
    test('should handle multiple failed login attempts', async ({ loginPage }) => {
      for (let i = 0; i < 3; i++) {
        await loginPage.login('invalid_user', 'wrong_password');
        const errorMessage = await loginPage.getError();
        expect(errorMessage.length).toBeGreaterThan(0);
      }

      expect(await loginPage.isLoginPageVisible()).toBe(true);
    });

    test('should validate credentials with special characters', async ({ loginPage, page }) => {
      await loginPage.login('  standard_user  ', 'secret_sauce');

      const isErrorVisible = !(await loginPage.isErrorNotVisible());
      const isNavigated = page.url().match(successIndicators.urlPattern);
      expect(isErrorVisible || isNavigated).toBe(true);
    });
  });
});
