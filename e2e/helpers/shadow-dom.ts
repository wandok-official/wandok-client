import type { Locator,Page } from '@playwright/test';

export const SHADOW_HOST_ID = 'wandok-shadow-host';

export async function getShadowHost(page: Page): Promise<Locator> {
  return page.locator(`#${SHADOW_HOST_ID}`);
}

export async function getShadowRoot(page: Page): Promise<Locator> {
  const shadowHost = await getShadowHost(page);
  return shadowHost.locator('> *');
}

export async function waitForShadowHost(page: Page, timeout = 5000): Promise<void> {
  await page.waitForSelector(`#${SHADOW_HOST_ID}`, { timeout });
}

export async function getProgressBar(page: Page): Promise<Locator> {
  const shadowHost = await getShadowHost(page);
  return shadowHost.locator('div[class*="progress"]').first();
}

export async function queryShadowDom(
  page: Page,
  selector: string,
): Promise<Locator> {
  const shadowHost = await getShadowHost(page);
  return shadowHost.locator(selector);
}
