import { activateExtension,expect, test } from '../fixtures/extension';
import { waitForShadowHost } from '../helpers/shadow-dom';

test.describe('Focus Mode (블러)', () => {
  test('문단에 마우스를 올리면 다른 문단들이 블러 처리되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    // 직접 mouseenter 이벤트 발생
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

  test('마우스가 문단을 벗어나면 블러가 해제되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    // mouseenter로 블러 적용
    await page.evaluate(() => {
      const wrapper = document.querySelector('#paragraph-1 .wandok-text-wrapper');
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      }
    });

    await page.waitForTimeout(200);

    // 블러가 실제로 적용되었는지 먼저 확인 (false pass 방지)
    const blurApplied = await page.evaluate(() => {
      const el = document.getElementById('paragraph-2');
      return el ? window.getComputedStyle(el).filter : '';
    });
    expect(blurApplied).toContain('blur');

    // mouseleave로 블러 해제
    await page.evaluate(() => {
      const wrapper = document.querySelector('#paragraph-1 .wandok-text-wrapper');
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      }
    });

    await page.waitForTimeout(200);

    const secondParagraphFilter = await page.evaluate(() => {
      const el = document.getElementById('paragraph-2');
      return el ? window.getComputedStyle(el).filter : '';
    });

    expect(secondParagraphFilter).not.toContain('blur');
  });

  test('마우스가 올라간 문단은 선명하게 유지되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    await page.evaluate(() => {
      const wrapper = document.querySelector('#paragraph-1 .wandok-text-wrapper');
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      }
    });

    await page.waitForTimeout(200);

    // 다른 문단에 블러가 적용되었는지 확인 (false pass 방지)
    const secondParagraphFilter = await page.evaluate(() => {
      const el = document.getElementById('paragraph-2');
      return el ? window.getComputedStyle(el).filter : '';
    });
    expect(secondParagraphFilter).toContain('blur');

    // 마우스가 올라간 문단은 선명해야 함
    const firstParagraphFilter = await page.evaluate(() => {
      const el = document.getElementById('paragraph-1');
      return el ? window.getComputedStyle(el).filter : '';
    });

    expect(firstParagraphFilter).not.toContain('blur');
  });
});
