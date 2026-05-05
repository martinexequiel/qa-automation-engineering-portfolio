import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CartPage - Enhanced Page Object Model for Shopping Cart
 * 
 * DESIGN: Actions (proceedToCheckout) vs Assertions (assertProductInCart, etc.)
 */
export class CartPage extends BasePage {
  private readonly timeouts = {
    short: 2000,
    medium: 5000,
  };

  constructor(page: Page) {
    super(page);
  }

  // ============================================
  // PRIVATE LOCATOR METHODS
  // ============================================
  private getCartItem(productName?: string) {
    if (productName) {
      return this.page.locator('[class="cart_item"]', { hasText: productName });
    }
    return this.page.locator('[class="cart_item"]');
  }

  private getCheckoutButton() {
    return this.page.getByRole('button', { name: /checkout/i }).or(
      this.page.locator('[data-test="checkout"]')
    );
  }

  // ============================================
  // ACTION METHODS
  // ============================================
  async waitForCartPage(): Promise<void> {
    await this.waitForUrl('**/cart.html');
    await expect(this.getCartItem().first()).toBeVisible({ timeout: this.timeouts.medium });
  }

  async proceedToCheckout(): Promise<void> {
    const checkoutButton = this.getCheckoutButton();
    await expect(checkoutButton).toBeVisible({ timeout: this.timeouts.medium });
    await checkoutButton.click();
    await this.waitForUrl('**/checkout-step-one.html');
  }

  // ============================================
  // ASSERTION METHODS
  // ============================================
  async assertProductInCart(productName: string): Promise<void> {
    const cartItem = this.getCartItem(productName);
    await expect(cartItem).toBeVisible({ timeout: this.timeouts.medium });
  }

  async assertProductNotInCart(productName: string): Promise<void> {
    const cartItem = this.getCartItem(productName);
    expect(await cartItem.count()).toBe(0);
  }

  async assertCartEmpty(): Promise<void> {
    expect(await this.getCartItem().count()).toBe(0);
  }
}
