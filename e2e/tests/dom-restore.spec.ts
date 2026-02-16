import { activateExtension, expect, test } from '../fixtures/extension';
import { waitForShadowHost } from '../helpers/shadow-dom';

async function deactivateExtension(
  context: Parameters<typeof activateExtension>[0],
  page: Parameters<typeof activateExtension>[1],
): Promise<void> {
  let [background] = context.serviceWorkers();

  if (!background) {
    background = await context.waitForEvent('serviceworker');
  }

  await background.evaluate(async () => {
    await chrome.storage.local.set({ wandokEnabled: false });
  });

  await page.waitForTimeout(500);
}

test.describe('DOM 복원', () => {
  test('비활성화 시 wandok-text-wrapper가 모두 제거되고 원본 텍스트가 복원되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const wrappersBeforeCount = await page.evaluate(() =>
      document.querySelectorAll('.wandok-text-wrapper').length,
    );
    expect(wrappersBeforeCount).toBeGreaterThan(0);

    await deactivateExtension(context, page);

    const wrappersAfterCount = await page.evaluate(() =>
      document.querySelectorAll('.wandok-text-wrapper').length,
    );
    expect(wrappersAfterCount).toBe(0);

    const paragraphText = await page.evaluate(() => {
      const el = document.getElementById('paragraph-1');
      return el?.textContent?.trim() ?? '';
    });
    expect(paragraphText).toContain('첫 번째 문단입니다.');
    expect(paragraphText).toContain('여러 문장이 포함되어 있습니다.');
  });
});
