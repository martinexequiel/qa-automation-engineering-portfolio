import { expect, test } from '@fixtures/index';
import { completePurchaseAsStandardUser } from '@flows/index';
import { products } from '@utils/testData';

/**
 * PURCHASE FLOW E2E TEST - REFACTORED
 *
 * IMPROVEMENTS:
 * 1. Uses completePurchaseAsStandardUser() flow - encapsulates entire business flow
 * 2. Explicit assertions - assertOrderComplete() instead of checking boolean
 * 3. Atomic tests - separated positive/negative/edge cases
 * 4. Cleaner code - less manual orchestration in test
 * 5. More maintainable - flow changes don't break multiple tests
 *
 * ARCHITECTURE:
 * - completePurchaseAsStandardUser() orchestrates entire purchase workflow
 * - Flow returns all page objects for flexible assertions
 * - Tests focus on verifying business outcomes
 * - Page objects handle interaction details
 */

test.describe('Purchase Flow @regression', () => {
  const customerInfo = {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '12345',
  };

  // ============================================
  // POSITIVE SCENARIOS - Successful Purchase
  // ============================================
  test('should complete purchase with standard user for Backpack', async ({ page }) => {
    // GIVEN: We have a standard user and Backpack product
    // WHEN: We complete the full purchase flow
    // THEN: Order should be confirmed successfully
    const { checkoutCompletePage } = await completePurchaseAsStandardUser(
      page,
      products.backpack,
      customerInfo
    );

    // Use explicit assertion method instead of checking return values
    await checkoutCompletePage.assertOrderComplete();
    await checkoutCompletePage.assertSuccessMessage('Your order has been dispatched');
  });

  test('should complete purchase with standard user for Bolt T-Shirt', async ({ page }) => {
    // GIVEN: Different product (Bolt T-Shirt)
    // WHEN: We complete the purchase flow
    // THEN: Order should succeed regardless of product
    const { checkoutCompletePage, inventoryPage } = await completePurchaseAsStandardUser(
      page,
      products.boltTShirt,
      customerInfo
    );

    // Verify order completion
    await checkoutCompletePage.assertOrderComplete();

    // Navigate back and verify inventory page
    await checkoutCompletePage.returnToInventory();
    await inventoryPage.waitForInventoryPage();
  });

  // ============================================
  // EDGE CASES - Different Customer Info
  // ============================================
  test('should handle special characters in customer information', async ({ page }) => {
    // GIVEN: Customer info with special characters
    const specialCharInfo = {
      firstName: "O'Brien",
      lastName: "García-López",
      postalCode: '12345-6789',
    };

    // WHEN: We complete purchase with this info
    // THEN: Purchase should succeed despite special characters
    const { checkoutCompletePage } = await completePurchaseAsStandardUser(
      page,
      products.backpack,
      specialCharInfo
    );

    // Verify order was processed
    await checkoutCompletePage.assertOrderComplete();
  });

  test('should complete purchase with minimal customer information', async ({ page }) => {
    // GIVEN: Minimal required customer info
    const minimalInfo = {
      firstName: 'A',
      lastName: 'B',
      postalCode: '1',
    };

    // WHEN: We complete purchase with minimal info
    // THEN: Purchase should still succeed
    const { checkoutCompletePage } = await completePurchaseAsStandardUser(
      page,
      products.bikeLight,
      minimalInfo
    );

    await checkoutCompletePage.assertOrderComplete();
  });
});
