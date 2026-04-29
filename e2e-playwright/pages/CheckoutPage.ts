import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  private readonly selectors = {
    firstName: '[data-test="firstName"], #first-name',
    lastName: '[data-test="lastName"], #last-name',
    postalCode: '[data-test="postalCode"], #postal-code',
    continueButton: '[data-test="continue"], #continue',
    finishButton: '[data-test="finish"], #finish',
    cartItem: '.cart_item',
  };

  constructor(page: Page) {
    super(page);
  }

  async fillCustomerInformation(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await expect(this.page.locator(this.selectors.firstName)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.selectors.firstName).fill(firstName);

    await expect(this.page.locator(this.selectors.lastName)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.selectors.lastName).fill(lastName);

    await expect(this.page.locator(this.selectors.postalCode)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.selectors.postalCode).fill(postalCode);
  }

  async continueToOverview(): Promise<void> {
    const continueButton = this.page.locator(this.selectors.continueButton);
    await expect(continueButton).toBeVisible({ timeout: 5000 });
    await continueButton.click();
    await this.waitForUrl('**/checkout-step-two.html');
  }

  async isProductVisibleInOverview(productName: string): Promise<boolean> {
    return this.page.locator(this.selectors.cartItem, { hasText: productName }).isVisible();
  }

  async finishPurchase(): Promise<void> {
    const finishButton = this.page.locator(this.selectors.finishButton);
    await expect(finishButton).toBeVisible({ timeout: 5000 });
    await finishButton.click();
    await this.waitForUrl('**/checkout-complete.html');
  }
}
