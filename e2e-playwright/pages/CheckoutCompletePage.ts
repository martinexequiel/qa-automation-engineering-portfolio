import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CheckoutCompletePage - Enhanced Page Object Model for Order Confirmation
 * 
 * DESIGN: Assertions focused (isOrderComplete, assertSuccessMessage)
 */
export class CheckoutCompletePage extends BasePage {
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
  private getSuccessHeader() {
    return this.page.locator('[class="complete-header"]').or(
      this.page.locator('[data-test="complete-header"]')
    );
  }

  private getSuccessMessage() {
    return this.page.locator('[class="complete-text"]').or(
      this.page.locator('[data-test="complete-text"]')
    );
  }

  private getBackHomeButton() {
    return this.page.getByRole('button', { name: /back|home/i }).or(
      this.page.locator('[data-test="back-to-products"]')
    );
  }

  // ============================================
  // ASSERTION METHODS
  // ============================================
  async assertOrderComplete(): Promise<void> {
    await expect(this.getSuccessHeader()).toBeVisible({ timeout: this.timeouts.medium });
    await expect(this.getSuccessMessage()).toBeVisible({ timeout: this.timeouts.medium });
  }

  async assertSuccessMessage(expectedText: string): Promise<void> {
    const messageLocator = this.getSuccessMessage();
    await expect(messageLocator).toBeVisible({ timeout: this.timeouts.medium });
    await expect(messageLocator).toContainText(expectedText);
  }

  // ============================================
  // ACTION METHODS
  // ============================================
  async returnToInventory(): Promise<void> {
    const backHomeButton = this.getBackHomeButton();
    await expect(backHomeButton).toBeVisible({ timeout: this.timeouts.medium });
    await backHomeButton.click();
    await this.waitForUrl('**/inventory.html');
  }

  // ============================================
  // UTILITY METHODS - For backwards compatibility
  // ============================================
  async isOrderComplete(): Promise<boolean> {
    try {
      await expect(this.getSuccessHeader()).toBeVisible({ timeout: this.timeouts.short });
      return true;
    } catch {
      return false;
    }
  }

  async getOrderConfirmationMessage(): Promise<string> {
    const messageLocator = this.getSuccessMessage();
    await expect(messageLocator).toBeVisible({ timeout: this.timeouts.medium });
    return messageLocator.innerText();
  }
}
