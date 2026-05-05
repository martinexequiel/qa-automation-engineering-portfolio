import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * InventoryPage - Enhanced Page Object Model for Product Listing
 * 
 * DESIGN PRINCIPLES:
 * - Actions: Add to cart, navigate, search
 * - Assertions: Verify products visible, cart count, product exists
 * - Encapsulation: Private locator methods for selector management
 * 
 * Separation ensures clean, maintainable tests with explicit expectations.
 */
export class InventoryPage extends BasePage {
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
  private getProductCard(productName: string) {
    return this.page.locator('[class="inventory_item"]', { hasText: productName });
  }

  private getAddToCartButton(productCard: any) {
    return productCard.getByRole('button', { name: /add to cart/i }).or(
      productCard.locator('button[data-test^="add-to-cart"]')
    );
  }

  private getCartIcon() {
    return this.page.getByRole('link', { name: /cart/i }).or(
      this.page.locator('[data-test="shopping-cart-link"]')
    );
  }

  private getCartBadgeElement() {
    return this.page.locator('[class="shopping_cart_badge"]');
  }

  // ============================================
  // ACTION METHODS - User Interactions
  // ============================================
  /**
   * Wait for inventory page to load.
   * Does not assert - just verifies page is ready for interaction.
   */
  async waitForInventoryPage(): Promise<void> {
    await this.waitForUrl('**/inventory.html');
    // Wait for at least one product to be visible
    await expect(this.page.locator('[class="inventory_item"]').first()).toBeVisible({
      timeout: this.timeouts.medium,
    });
  }

  /**
   * Add a specific product to cart by name.
   */
  async addProductToCart(productName: string): Promise<void> {
    const productCard = this.getProductCard(productName);
    await expect(productCard).toBeVisible({ timeout: this.timeouts.medium });

    const addButton = this.getAddToCartButton(productCard);
    await expect(addButton).toBeVisible({ timeout: this.timeouts.medium });
    await addButton.click();
  }

  /**
   * Navigate to the shopping cart.
   */
  async goToCart(): Promise<void> {
    const cartIcon = this.getCartIcon();
    await expect(cartIcon).toBeVisible({ timeout: this.timeouts.medium });
    await cartIcon.click();
    await this.waitForUrl('**/cart.html');
  }

  /**
   * Verify that a product is displayed on the page.
   */
  async assertProductVisible(productName: string): Promise<void> {
    const productCard = this.getProductCard(productName);
    await expect(productCard).toBeVisible({ timeout: this.timeouts.medium });
  }

  /**
   * Verify that cart badge shows the correct count.
   */
  async assertCartItemCount(expectedCount: number): Promise<void> {
    const badge = this.getCartBadgeElement();
    if (expectedCount === 0) {
      expect(await badge.count()).toBe(0);
    } else {
      await expect(badge).toContainText(expectedCount.toString());
    }
  }

  /**
   * Verify that cart badge is visible (has items).
   */
  async assertCartHasItems(): Promise<void> {
    const badge = this.getCartBadgeElement();
    await expect(badge).toBeVisible();
    const count = parseInt(await badge.innerText());
    expect(count).toBeGreaterThan(0);
  }

  // ============================================
  // UTILITY METHODS - For flexible test scenarios
  // ============================================
  /**
   * Get current cart item count (for debugging).
   * Use assertCartItemCount() for assertions in tests.
   */
  async getCartBadgeCount(): Promise<number> {
    const badge = this.getCartBadgeElement();
    if ((await badge.count()) === 0) {
      return 0;
    }
    return Number(await badge.innerText()) || 0;
  }
}
