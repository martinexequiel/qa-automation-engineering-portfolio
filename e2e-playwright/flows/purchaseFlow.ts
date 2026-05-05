import { Page, expect } from '@playwright/test';
import {
  LoginPage,
  InventoryPage,
  CartPage,
  CheckoutPage,
  CheckoutCompletePage,
} from '@pages/index';

/**
 * PURCHASE FLOW - Business Logic Layer
 * 
 * Purpose:
 * - Orchestrates complete e-commerce purchase scenarios
 * - Represents realistic user journeys
 * - Minimizes test code duplication
 * - Separates business flows from test assertions
 * 
 * ARCHITECTURE:
 * - Each flow = one complete business scenario
 * - Flows compose multiple page objects
 * - Returns page objects for explicit test assertions
 * - No test logic (loops, conditionals, etc.) in flows
 * 
 * USAGE:
 * Instead of test orchestrating 5+ page objects:
 * 
 * const { checkoutCompletePage } = await completePurchaseAsStandardUser(
 *   page,
 *   'Sauce Labs Backpack'
 * );
 * await checkoutCompletePage.assertOrderComplete();
 */

/**
 * COMPLETE PURCHASE - Standard user adds product and completes checkout
 * 
 * Business flow:
 * 1. Login as standard user
 * 2. Verify inventory page loaded
 * 3. Add product to cart
 * 4. Navigate to cart
 * 5. Proceed to checkout
 * 6. Fill customer information
 * 7. Complete overview
 * 8. Finish purchase
 * 
 * @param page - Playwright Page instance
 * @param productName - Product to add to cart
 * @param customerInfo - Customer details { firstName, lastName, postalCode }
 * @returns All page objects for flexible test assertions
 * @example
 * const result = await completePurchaseAsStandardUser(page, 'Sauce Labs Backpack', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   postalCode: '12345',
 * });
 * await result.checkoutCompletePage.assertOrderComplete();
 * await result.checkoutCompletePage.assertSuccessMessage('Thank you');
 */
export async function completePurchaseAsStandardUser(
  page: Page,
  productName: string,
  customerInfo: { firstName: string; lastName: string; postalCode: string }
) {
  // Initialize all page objects
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const checkoutCompletePage = new CheckoutCompletePage(page);

  // Step 1: Login
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret_sauce');
  await loginPage.assertLoginSuccess();

  // Step 2: Add to cart
  await inventoryPage.waitForInventoryPage();
  await inventoryPage.addProductToCart(productName);

  // Step 3: Navigate to cart and verify product
  await inventoryPage.goToCart();
  await cartPage.waitForCartPage();
  await cartPage.assertProductInCart(productName);

  // Step 4: Checkout
  await cartPage.proceedToCheckout();

  // Step 5: Fill customer info
  await checkoutPage.fillCustomerInformation(
    customerInfo.firstName,
    customerInfo.lastName,
    customerInfo.postalCode
  );

  // Step 6: Continue to overview
  await checkoutPage.continueToOverview();
  await checkoutPage.assertProductVisibleInOverview(productName);

  // Step 7: Finish purchase
  await checkoutPage.finishPurchase();

  // Return all page objects so test can assert on different states
  return {
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  };
}

/**
 * ADD PRODUCT TO CART - Focused flow (doesn't complete purchase)
 * 
 * Useful for testing:
 * - Cart interactions
 * - Multiple product additions
 * - Cart abandonment scenarios
 * 
 * @param page - Playwright Page instance
 * @param productName - Product to add
 * @returns Inventory and Cart page objects
 * @example
 * const { inventoryPage, cartPage } = await addProductToCart(page, 'Sauce Labs Backpack');
 * await inventoryPage.assertCartHasItems();
 * await inventoryPage.goToCart();
 * await cartPage.assertProductInCart('Sauce Labs Backpack');
 */
export async function addProductToCart(page: Page, productName: string) {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const cartPage = new CartPage(page);

  // Assume user is already logged in
  if (!(await page.url().includes('/inventory.html'))) {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
  }

  await inventoryPage.waitForInventoryPage();
  await inventoryPage.addProductToCart(productName);

  return {
    inventoryPage,
    cartPage,
  };
}

/**
 * ATTEMPT LOGIN WITH INVALID CREDENTIALS - Negative flow
 * 
 * Used for testing login error handling.
 * Returns login page for error assertions.
 * 
 * @param page - Playwright Page instance
 * @param username - Invalid username
 * @param password - Invalid password
 * @returns LoginPage for error assertions
 * @example
 * const loginPage = await attemptInvalidLogin(page, 'invalid_user', 'wrong_password');
 * await loginPage.assertErrorMessage('Username and password do not match');
 */
export async function attemptInvalidLogin(
  page: Page,
  username: string,
  password: string
): Promise<LoginPage> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);
  // Note: No assertion - caller verifies error state
  return loginPage;
}
