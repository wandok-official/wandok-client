import { activateExtension,expect, test } from '../fixtures/extension';
import { waitForShadowHost } from '../helpers/shadow-dom';

test.describe('문단 분리', () => {
  test('문장을 클릭하면 문단이 두 개로 분리되어야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const initialParagraphCount = await page.evaluate(() => {
      return document.querySelectorAll('p').length;
    });

    const sentenceCount = await page.evaluate(() => {
      return document.querySelectorAll('#paragraph-1 .wandok-text-wrapper').length;
    });

    expect(sentenceCount).toBeGreaterThan(1);

    // 두 번째 문장을 클릭하여 문단 분리
    await page.evaluate(() => {
      const sentences = document.querySelectorAll('#paragraph-1 .wandok-text-wrapper');
      sentences[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(200);

    const newParagraphCount = await page.evaluate(() => {
      return document.querySelectorAll('p').length;
    });

    expect(newParagraphCount).toBe(initialParagraphCount + 1);
  });

  test('분리된 문단들도 독립적으로 블러가 동작해야 한다', async ({ context }) => {
    const page = await context.newPage();
    await page.goto('http://localhost:3333/test-page.html');

    await activateExtension(context, page);
    await waitForShadowHost(page);

    const sentenceCount = await page.evaluate(() => {
      return document.querySelectorAll('#paragraph-1 .wandok-text-wrapper').length;
    });

    expect(sentenceCount).toBeGreaterThan(1);

    // 문단 분리
    await page.evaluate(() => {
      const sentences = document.querySelectorAll('#paragraph-1 .wandok-text-wrapper');
      sentences[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(200);

    // 첫 번째 문단에 mouseenter
    await page.evaluate(() => {
      const wrapper = document.querySelector('p .wandok-text-wrapper');
      if (wrapper) {
        wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      }
    });

    await page.waitForTimeout(200);

    const secondParagraphFilter = await page.evaluate(() => {
      const paragraphs = document.querySelectorAll('p');
      if (paragraphs[1]) {
        return window.getComputedStyle(paragraphs[1]).filter;
      }
      return '';
    });

    expect(secondParagraphFilter).toContain('blur');
  });
});
