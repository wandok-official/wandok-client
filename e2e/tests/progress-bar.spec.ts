import { activateExtension,expect, test } from '../fixtures/extension';
import { getShadowHost,waitForShadowHost } from '../helpers/shadow-dom';

test.describe('Progress Bar', () => {
  test('페이지 로드 시 Progress Bar가 표시되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    await getShadowHost(page);

    const hasProgressBar = await page.evaluate(() => {
      const host = document.getElementById('wandok-shadow-host');
      const shadowRoot = host?.shadowRoot;
      if (!shadowRoot) return false;

      // ProgressBar는 fixed, top-0, right-0 클래스를 가진 div
      const progressBar = shadowRoot.querySelector('.fixed.top-0.right-0');
      return progressBar !== null;
    });

    expect(hasProgressBar).toBe(true);
  });

  test('스크롤 시 Progress Bar 위치가 업데이트되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const getProgressBarHeight = async () => {
      return page.evaluate(() => {
        const host = document.getElementById('wandok-shadow-host');
        const shadowRoot = host?.shadowRoot;
        if (!shadowRoot) return null;

        // ProgressBar 내부의 amber 색 인디케이터 (height가 변하는 요소)
        const progressContainer = shadowRoot.querySelector('.fixed.top-0.right-0');
        const indicator = progressContainer?.querySelector('.bg-amber-500');
        if (!indicator) return null;

        const style = window.getComputedStyle(indicator);
        return style.height;
      });
    };

    const initialHeight = await getProgressBarHeight();

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });

    await page.waitForTimeout(200);

    const scrolledHeight = await getProgressBarHeight();

    expect(initialHeight).not.toBeNull();
    expect(scrolledHeight).not.toBeNull();
    expect(scrolledHeight).not.toBe(initialHeight);
  });

  test('페이지 하단으로 스크롤하면 Progress Bar가 끝까지 이동해야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await page.waitForTimeout(200);

    const indicatorHeightPercent = await page.evaluate(() => {
      const host = document.getElementById('wandok-shadow-host');
      const shadowRoot = host?.shadowRoot;
      if (!shadowRoot) return null;

      const progressContainer = shadowRoot.querySelector('.fixed.top-0.right-0');
      const indicator = progressContainer?.querySelector('.bg-amber-500');
      if (!indicator) return null;

      // inline style에서 height 퍼센트 값 추출 (e.g. "98.5%")
      const heightStyle = (indicator as HTMLElement).style.height;
      return parseFloat(heightStyle);
    });

    expect(indicatorHeightPercent).not.toBeNull();
    expect(indicatorHeightPercent!).toBeGreaterThan(90);
  });
});
