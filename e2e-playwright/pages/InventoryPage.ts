import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  private readonly selectors = {
    productCard: '.inventory_item',
    addToCartButton: 'button[data-test^="add-to-cart"], button[id^="add-to-cart"]',
    cartIcon: '[data-test="shopping-cart-link"], .shopping_cart_link',
    cartBadge: '.shopping_cart_badge',
  };

  constructor(page: Page) {
    super(page);
  }

  async waitForInventoryPage(): Promise<void> {
    await this.waitForUrl('**/inventory.html');
    await expect(this.page.locator(this.selectors.productCard).first()).toBeVisible({ timeout: 5000 });
  }

  async addProductToCart(productName: string): Promise<void> {
    const productCard = this.page.locator(this.selectors.productCard, { hasText: productName });
    await expect(productCard).toBeVisible({ timeout: 5000 });

    const addButton = productCard.locator(this.selectors.addToCartButton);
    await expect(addButton).toBeVisible({ timeout: 5000 });
    await addButton.click();
  }

  async goToCart(): Promise<void> {
    const cartIcon = this.page.locator(this.selectors.cartIcon);
    await expect(cartIcon).toBeVisible({ timeout: 5000 });
    await cartIcon.click();
    await this.waitForUrl('**/cart.html');
  }

  async getCartBadgeCount(): Promise<number> {
    const badge = this.page.locator(this.selectors.cartBadge);
    if ((await badge.count()) === 0) {
      return 0;
    }

    return Number(await badge.innerText()) || 0;
  }
}
