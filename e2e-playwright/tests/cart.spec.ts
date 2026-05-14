import { test } from '@fixtures/index';
import { loginAsStandardUser, addProductToCart } from '@flows/index';
import { CartPage } from '@pages/index';
import { products } from '@utils/testData';

/**
 * CART COMPONENT TESTS - Isolated Testing Pattern
 *
 * IMPROVEMENTS:
 * 1. Tests ONE component in isolation (CartPage)
 * 2. Uses flows for setup (login, add to cart)
 * 3. Focused assertions on cart-specific behavior
 * 4. Reusable test data
 * 5. Clear intent - each test has one business purpose
 *
 * DESIGN PATTERN:
 * - Setup via flows (not inline in test)
 * - Act via page object method
 * - Assert using page object assertion method
 * - Each test is atomic and independent
 */

test.describe('Shopping Cart @regression', () => {
  // ============================================
  // SETUP - Consistent state for cart tests
  // ============================================
  test.beforeEach(async ({ page }) => {
    // All cart tests assume user is logged in
    await loginAsStandardUser(page);
  });

  // ============================================
  // CART VERIFICATION TESTS
  // ============================================
  test.describe('Cart Product Display', () => {
    test('should display product in cart after add-to-cart action', async ({ page }) => {
      // GIVEN: Logged-in user
      // WHEN: User adds product to cart and navigates to cart
      // THEN: Product should be visible in cart
      const { inventoryPage, cartPage } = await addProductToCart(page, products.backpack);

      await inventoryPage.goToCart();
      await cartPage.waitForCartPage();
      await cartPage.assertProductInCart(products.backpack);
    });

    test('should verify multiple products in cart', async ({ page }) => {
      // GIVEN: Logged-in user on inventory
      // WHEN: User adds multiple products
      // THEN: All products should be visible
      const { inventoryPage, cartPage } = await addProductToCart(page, products.backpack);
      const inventoryPage2 = (await addProductToCart(page, products.bikeLight)).inventoryPage;

      await inventoryPage2.goToCart();
      await cartPage.waitForCartPage();
      await cartPage.assertProductInCart(products.backpack);
      await cartPage.assertProductInCart(products.bikeLight);
    });

    test('should not display product if not added to cart', async ({ page }) => {
      // GIVEN: Logged-in user
      // WHEN: User navigates to empty cart (no products added)
      // THEN: Cart should be empty
      await page.goto('/cart.html');
      // Wait for cart page to load (URL check is sufficient for empty cart)
      await page.waitForURL('**/cart.html', { timeout: 5000 });
      // Verify cart is empty (no cart items present)
      const cartPage = new CartPage(page);
      await cartPage.assertCartEmpty();
    });
  });

  // ============================================
  // CART CHECKOUT FLOW TESTS
  // ============================================
  test.describe('Checkout Navigation', () => {
    test('should proceed to checkout when button is clicked', async ({ page }) => {
      // GIVEN: User has items in cart
      // WHEN: User clicks checkout button
      // THEN: Should navigate to checkout step-one page
      const { inventoryPage, cartPage } = await addProductToCart(page, products.backpack);

      await inventoryPage.goToCart();
      await cartPage.waitForCartPage();
      await cartPage.proceedToCheckout();

      // Verify URL changed (proceedToCheckout handles navigation wait)
      // This test is more about button functionality than flow
      await page.waitForURL('**/checkout-step-one.html', { timeout: 5000 });
    });
  });

  // ============================================
  // CART BADGE / COUNTER TESTS
  // ============================================
  test.describe('Cart Badge Counter', () => {
    test('should display correct count in cart badge after adding product', async ({ page }) => {
      // GIVEN: Logged-in user on inventory
      // WHEN: User adds product
      // THEN: Cart badge should show count = 1
      const { inventoryPage } = await addProductToCart(page, products.backpack);

      await inventoryPage.assertCartHasItems();
      await inventoryPage.assertCartItemCount(1);
    });

    test('should increment cart badge when adding another product', async ({ page }) => {
      // GIVEN: One product in cart
      // WHEN: User adds another product
      // THEN: Badge should show count = 2
      const firstAdd = await addProductToCart(page, products.backpack);
      const { inventoryPage } = await addProductToCart(page, products.bikeLight);

      await inventoryPage.assertCartItemCount(2);
    });
  });

  // ============================================
  // CART STATE TESTS
  // ============================================
  test.describe('Cart Persistence', () => {
    test('should maintain cart state when navigating away and back', async ({
      page,
      cartPage,
      inventoryPage,
    }) => {
      // GIVEN: Product in cart
      // WHEN: User navigates away and back to cart
      // THEN: Product should still be there
      const { inventoryPage: inv1, cartPage: cart1 } = await addProductToCart(
        page,
        products.backpack
      );

      // Navigate away
      await inv1.goToCart();
      await cart1.waitForCartPage();
      await cart1.assertProductInCart(products.backpack);

      // Navigate back to inventory and cart
      await page.goto('https://www.saucedemo.com/inventory.html');
      await inv1.waitForInventoryPage();
      await inv1.goToCart();

      // Verify product still there
      await cart1.waitForCartPage();
      await cart1.assertProductInCart(products.backpack);
    });
  });
});
