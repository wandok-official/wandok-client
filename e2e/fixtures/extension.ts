/* eslint-disable react-hooks/rules-of-hooks */
import { type BrowserContext, chromium, type Page,test as base } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, '../../apps/extension/dist');

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({ }, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export const expect = base.expect;

/**
 * 확장 프로그램을 활성화하는 헬퍼 함수
 * 페이지에서 직접 chrome API를 호출하여 콘텐츠 스크립트를 주입합니다
 */
export async function activateExtension(context: BrowserContext, page: Page): Promise<void> {
  let [background] = context.serviceWorkers();
  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }

  await background.evaluate(async () => {
    // tabs 권한 없이도 active tab은 id로 접근 가능
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    if (!activeTab?.id) {
      console.error('Active tab not found');
      return;
    }

    await chrome.action.setBadgeText({
      tabId: activeTab.id,
      text: 'ON',
    });

    try {
      await chrome.scripting.insertCSS({
        target: { tabId: activeTab.id },
        files: ['content.css'],
      });
    } catch (e) {
      console.error('CSS injection failed:', e);
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['content.js'],
      });
    } catch (e) {
      console.error('Script injection failed:', e);
    }

    await chrome.storage.local.set({ wandokEnabled: true });
  });

  await page.waitForTimeout(1000);
}
