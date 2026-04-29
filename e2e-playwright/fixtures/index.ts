/**
 * Fixtures Index
 * 
 * Central export point for all custom fixtures.
 * Fixtures extend Playwright's test context with reusable dependencies.
 * 
 * Usage:
 * import { test } from '@fixtures/index';
 * test('example', async ({ myCustomFixture }) => {
 *   // use myCustomFixture
 * });
 */

import { test as base, expect } from '@playwright/test';
import {
  CartPage,
  CheckoutCompletePage,
  CheckoutPage,
  InventoryPage,
  LoginPage,
} from '@pages/index';
import { validUsers } from '@utils/testData';

const standardUser = validUsers.find((user) => user.username === 'standard_user');
if (!standardUser) {
  throw new Error('Standard user test data is required for test fixtures.');
}

export const test = base.extend<{
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  checkoutCompletePage: CheckoutCompletePage;
  standardUser: typeof standardUser;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  standardUser: async ({}, use) => {
    await use(standardUser);
  },
});

export { expect };
