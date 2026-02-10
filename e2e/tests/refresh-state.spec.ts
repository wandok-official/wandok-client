import { activateExtension, expect, test } from '../fixtures/extension';
import { waitForShadowHost } from '../helpers/shadow-dom';

test.describe('새로고침 시 상태 유지', () => {
  test('활성화 상태에서 새로고침하면 badge가 ON으로 유지되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    // 새로고침
    await page.reload({ waitUntil: 'load' });
    await waitForShadowHost(page);
    await page.waitForTimeout(1000);

    // service worker에서 active tab의 badge 확인
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const badgeText = await background.evaluate(async () => {
      const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!activeTab?.id) return null;
      return chrome.action.getBadgeText({ tabId: activeTab.id });
    });

    expect(badgeText).toBe('ON');
  });

  test('활성화 상태에서 새로고침하면 블러 기능이 정상 동작해야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    // 새로고침
    await page.reload({ waitUntil: 'load' });
    await waitForShadowHost(page);
    await page.waitForTimeout(1000);

    // 블러 기능 확인
    await page.evaluate(() => {
      const wrapper = document.querySelector('#paragraph-1 .wandok-text-wrapper');
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      }
    });

    await page.waitForTimeout(200);

    const secondParagraphFilter = await page.evaluate(() => {
      const el = document.getElementById('paragraph-2');
      return el ? window.getComputedStyle(el).filter : '';
    });

    expect(secondParagraphFilter).toContain('blur');
  });
});
