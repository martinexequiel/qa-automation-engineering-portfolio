import { expect, test } from '@fixtures/index';
import { products } from '@utils/testData';

const productName = products.backpack;

/**
 * Purchase Flow E2E Test
 *
 * Business objective:
 * - Validate login with a standard user
 * - Add a product to the cart
 * - Confirm the item is present in the cart
 * - Complete the checkout workflow
 * - Verify order completion
 */

test.describe('Purchase Flow @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should complete a product purchase end-to-end using shared Page Objects', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
    standardUser,
  }) => {
    // Login only if not already authenticated
    if (!(await loginPage.isAuthenticated())) {
      await loginPage.login(standardUser.username, standardUser.password);
    }

    await inventoryPage.waitForInventoryPage();
    await inventoryPage.addProductToCart(productName);
    expect(await inventoryPage.getCartBadgeCount()).toBeGreaterThan(0);

    await inventoryPage.goToCart();
    await cartPage.waitForCartPage();
    expect(await cartPage.isProductInCart(productName)).toBe(true);

    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInformation('Test', 'Buyer', '90210');
    await checkoutPage.continueToOverview();
    expect(await checkoutPage.isProductVisibleInOverview(productName)).toBe(true);

    await checkoutPage.finishPurchase();
    expect(await checkoutCompletePage.isOrderComplete()).toBe(true);
    expect(await checkoutCompletePage.getOrderConfirmationMessage()).toContain(
      'Your order has been dispatched'
    );

    await checkoutCompletePage.returnToInventory();
    await inventoryPage.waitForInventoryPage();
  });
});
