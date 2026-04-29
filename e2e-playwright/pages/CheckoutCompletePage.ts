import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  private readonly selectors = {
    successHeader: '.complete-header, [data-test="complete-header"]',
    successMessage: '.complete-text, [data-test="complete-text"]',
    backHomeButton: '[data-test="back-to-products"], #back-to-products',
  };

  constructor(page: Page) {
    super(page);
  }

  async isOrderComplete(): Promise<boolean> {
    return this.page.locator(this.selectors.successHeader).isVisible();
  }

  async getOrderConfirmationMessage(): Promise<string> {
    const messageLocator = this.page.locator(this.selectors.successMessage);
    await expect(messageLocator).toBeVisible({ timeout: 5000 });
    return messageLocator.innerText();
  }

  async returnToInventory(): Promise<void> {
    const backHomeButton = this.page.locator(this.selectors.backHomeButton);
    await expect(backHomeButton).toBeVisible({ timeout: 5000 });
    await backHomeButton.click();
    await this.page.waitForURL('**/inventory.html', { timeout: 5000 });
  }
}
