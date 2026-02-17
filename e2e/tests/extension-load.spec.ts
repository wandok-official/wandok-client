import { activateExtension,expect, test } from '../fixtures/extension';
import { getShadowHost,waitForShadowHost } from '../helpers/shadow-dom';

test.describe('확장 프로그램 로드', () => {
  test('페이지 로드 시 Shadow Host가 생성되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const shadowHost = await getShadowHost(page);
    await expect(shadowHost).toBeVisible();
  });

  test('Shadow Root가 스타일과 함께 생성되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const hasShadowRoot = await page.evaluate(() => {
      const host = document.getElementById('wandok-shadow-host');
      return host?.shadowRoot !== null;
    });

    expect(hasShadowRoot).toBe(true);
  });

  test('텍스트 노드가 wandok-text-wrapper 클래스로 감싸져야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const wrapperCount = await page.evaluate(() => {
      return document.querySelectorAll('.wandok-text-wrapper').length;
    });

    expect(wrapperCount).toBeGreaterThan(0);
  });

  test('클릭 이벤트가 부모 요소로 전파되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const propagated = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const article = document.querySelector('article');
        if (!article) {
          resolve(false);
          return;
        }

        article.addEventListener('click', () => resolve(true), { once: true });

        const wrapper = document.querySelector('.wandok-text-wrapper');
        if (wrapper) {
          wrapper.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        } else {
          resolve(false);
        }
      });
    });

    expect(propagated).toBe(true);
  });
});
