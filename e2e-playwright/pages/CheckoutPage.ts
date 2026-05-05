import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CheckoutPage - Enhanced Page Object Model for Checkout Flow
 * 
 * DESIGN: Actions (fill info, continue) vs Assertions (assertProductVisible, etc.)
 */
export class CheckoutPage extends BasePage {
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
  private getFirstNameField() {
    return this.page.getByRole('textbox', { name: /first/i }).or(
      this.page.locator('[data-test="firstName"]')
    );
  }

  private getLastNameField() {
    return this.page.getByRole('textbox', { name: /last/i }).or(
      this.page.locator('[data-test="lastName"]')
    );
  }

  private getPostalCodeField() {
    return this.page.getByRole('textbox', { name: /zip/i }).or(
      this.page.locator('[data-test="postalCode"]')
    );
  }

  private getContinueButton() {
    return this.page.getByRole('button', { name: /continue/i }).or(
      this.page.locator('[data-test="continue"]')
    );
  }

  private getFinishButton() {
    return this.page.getByRole('button', { name: /finish/i }).or(
      this.page.locator('[data-test="finish"]')
    );
  }

  private getCartItem(productName?: string) {
    if (productName) {
      return this.page.locator('[class="cart_item"]', { hasText: productName });
    }
    return this.page.locator('[class="cart_item"]');
  }

  // ============================================
  // ACTION METHODS
  // ============================================
  async fillCustomerInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await expect(this.getFirstNameField()).toBeVisible({ timeout: this.timeouts.medium });
    await this.getFirstNameField().fill(firstName);

    await expect(this.getLastNameField()).toBeVisible({ timeout: this.timeouts.medium });
    await this.getLastNameField().fill(lastName);

    await expect(this.getPostalCodeField()).toBeVisible({ timeout: this.timeouts.medium });
    await this.getPostalCodeField().fill(postalCode);
  }

  async continueToOverview(): Promise<void> {
    const continueButton = this.getContinueButton();
    await expect(continueButton).toBeVisible({ timeout: this.timeouts.medium });
    await continueButton.click();
    await this.waitForUrl('**/checkout-step-two.html');
  }

  async finishPurchase(): Promise<void> {
    const finishButton = this.getFinishButton();
    await expect(finishButton).toBeVisible({ timeout: this.timeouts.medium });
    await finishButton.click();
    await this.waitForUrl('**/checkout-complete.html');
  }

  // ============================================
  // ASSERTION METHODS
  // ============================================
  async assertProductVisibleInOverview(productName: string): Promise<void> {
    const cartItem = this.getCartItem(productName);
    await expect(cartItem).toBeVisible({ timeout: this.timeouts.medium });
  }

  async assertCustomerFormVisible(): Promise<void> {
    await expect(this.getFirstNameField()).toBeVisible({ timeout: this.timeouts.medium });
    await expect(this.getLastNameField()).toBeVisible({ timeout: this.timeouts.medium });
    await expect(this.getPostalCodeField()).toBeVisible({ timeout: this.timeouts.medium });
  }
}
