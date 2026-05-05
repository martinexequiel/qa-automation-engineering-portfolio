import { expect, test } from '@fixtures/index';
import { loginWithCredentials, attemptInvalidLogin } from '@flows/index';
import { validUsers, lockedOutUser, invalidCredentials } from '@utils/testData';

/**
 * AUTHENTICATION TEST SUITE - REFACTORED
 * 
 * IMPROVEMENTS:
 * 1. Flows layer - loginWithCredentials() replaces manual goto() + login()
 * 2. Explicit assertions - assertErrorMessage() is clearer than getError()
 * 3. Atomic tests - each test has ONE responsibility
 * 4. Separated concerns - page actions vs assertions explicit
 * 5. Better readability - test reads like business behavior
 * 
 * ARCHITECTURE:
 * - Flows orchestrate page object interactions
 * - Page objects expose action and assertion methods
 * - Tests use flows to reduce duplication
 * - Tests assert explicitly on business outcomes
 */

test.describe('Authentication Flow @smoke @regression', () => {
  // Override storageState for login tests to ensure clean authentication state
  test.use({ storageState: undefined });

  // ============================================
  // POSITIVE SCENARIOS - Successful Login
  // ============================================
  test.describe('Successful Login', () => {
    validUsers.forEach((user) => {
      test(`should login successfully with ${user.description}`, async ({ page }) => {
        // GIVEN: We have a valid user credential
        // WHEN: We use the login flow with that credential
        // THEN: Login should succeed
        const loginPage = await loginWithCredentials(page, user.username, user.password);

        // Assert using explicit assertion method (not manual expectations)
        await loginPage.assertLoginSuccess();
      });
    });
  });

  // ============================================
  // NEGATIVE SCENARIOS - Login Failures
  // ============================================
  test.describe('Invalid Credentials', () => {
    invalidCredentials.forEach((credential) => {
      test(`should show error when ${credential.description}`, async ({ page }) => {
        // GIVEN: We have invalid credentials
        // WHEN: We attempt login with those credentials
        // THEN: Error should display the expected message
        const loginPage = await attemptInvalidLogin(page, credential.username, credential.password);

        // Use explicit assertion method for error handling
        await loginPage.assertErrorMessage(credential.expectedError);
      });
    });
  });

  test('should display error for locked out user', async ({ page }) => {
    // GIVEN: We have a locked out user account
    // WHEN: We attempt login with that account
    // THEN: Specific account lockout error should appear
    const loginPage = await attemptInvalidLogin(page, lockedOutUser.username, lockedOutUser.password);

    // Verify it's still on login page and shows specific error
    await loginPage.assertLoginFormVisible();
    await loginPage.assertErrorMessage(lockedOutUser.expectedError);
  });

  // ============================================
  // EDGE CASES - Unusual Scenarios
  // ============================================
  test.describe('Login Page State', () => {
    test('should load login page with form fields visible', async ({ loginPage }) => {
      // GIVEN: We navigate to login page
      // WHEN: Page loads
      // THEN: All form fields should be visible
      await loginPage.goto();
      await loginPage.assertLoginFormVisible();
    });

    test('should not show error message on initial page load', async ({ loginPage }) => {
      // GIVEN: Fresh login page
      // WHEN: We navigate to it
      // THEN: No error message should be visible
      await loginPage.goto();
      await loginPage.assertNoErrorMessage();
    });
  });

  test.describe('Multiple Failed Attempts', () => {
    test('should allow multiple failed login attempts', async ({ page }) => {
      // GIVEN: User attempts login multiple times with wrong credentials
      // WHEN: Each attempt fails
      // THEN: User can continue attempting without account lockout
      for (let i = 0; i < 3; i++) {
        const loginPage = await attemptInvalidLogin(page, 'invalid_user', 'wrong_password');
        await loginPage.assertErrorMessage('Username and password do not match');
      }
    });
  });
});

