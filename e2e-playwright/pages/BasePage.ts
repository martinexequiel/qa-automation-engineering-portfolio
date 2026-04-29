import { Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected locator(selector: string) {
    return this.page.locator(selector);
  }

  protected async waitForUrl(url: string): Promise<void> {
    await this.page.waitForURL(url, { timeout: 5000 });
  }
}
