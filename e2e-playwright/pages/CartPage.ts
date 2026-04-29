import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly selectors = {
    cartItem: '.cart_item',
    checkoutButton: '[data-test="checkout"], #checkout',
  };

  constructor(page: Page) {
    super(page);
  }

  async waitForCartPage(): Promise<void> {
    await this.waitForUrl('**/cart.html');
    await expect(this.page.locator(this.selectors.cartItem).first()).toBeVisible({ timeout: 5000 });
  }

  async isProductInCart(productName: string): Promise<boolean> {
    return this.page.locator(this.selectors.cartItem, { hasText: productName }).isVisible();
  }

  async proceedToCheckout(): Promise<void> {
    const checkoutButton = this.page.locator(this.selectors.checkoutButton);
    await expect(checkoutButton).toBeVisible({ timeout: 5000 });
    await checkoutButton.click();
    await this.waitForUrl('**/checkout-step-one.html');
  }
}
