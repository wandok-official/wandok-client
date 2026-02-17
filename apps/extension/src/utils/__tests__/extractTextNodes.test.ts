import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { extractTextNodes } from '../extractTextNodes';

describe('extractTextNodes', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('텍스트 노드 추출', () => {
    it('단순 텍스트 노드를 추출해야 한다', () => {
      container.innerHTML = '<p>Hello World!</p>';

      const result = extractTextNodes(container);

      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Hello World!');
    });

    it('여러 텍스트 노드를 문서 순서대로 추출해야 한다', () => {
      container.innerHTML = '<h1>First</h1><p>Second</p><span>Third</span>';

      const result = extractTextNodes(container);

      expect(result).toHaveLength(3);
      expect(result[0].textContent).toBe('First');
      expect(result[1].textContent).toBe('Second');
      expect(result[2].textContent).toBe('Third');
    });

    it('공백만 있는 텍스트 노드는 제외해야 한다', () => {
      container.innerHTML = '<p>   </p><p>Hello</p>';

      const result = extractTextNodes(container);

      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Hello');
    });
  });

  describe('태그 필터링', () => {
    it('기본 제외 태그(SCRIPT, STYLE 등) 내부의 텍스트는 제외해야 한다', () => {
      container.innerHTML = `
        <p>Visible</p>
        <script>console.log("hidden")</script>
        <style>.hidden { display: none; }</style>
        <noscript>JavaScript is disabled</noscript>
        <textarea>Input text</textarea>
        <input value="Input value" />
      `;

      const result = extractTextNodes(container);

      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Visible');
    });

    it('인터랙티브 요소(BUTTON, A, LABEL, SUMMARY) 내부의 텍스트는 제외해야 한다', () => {
      container.innerHTML = `
        <p>Visible</p>
        <button>Click me</button>
        <a href="#">Link text</a>
        <label>Label text</label>
        <summary>Summary text</summary>
      `;

      const result = extractTextNodes(container);

      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Visible');
    });

    it('커스텀 excludeTags를 전달하면 해당 태그만 제외해야 한다', () => {
      container.innerHTML = `
        <p>Visible</p>
        <span>Also visible</span>
        <code>Excluded</code>
      `;

      const result = extractTextNodes(container, ['CODE']);

      expect(result).toHaveLength(2);
      expect(result[0].textContent).toBe('Visible');
      expect(result[1].textContent).toBe('Also visible');
    });
  });

  describe('빈 입력 처리', () => {
    it('빈 컨테이너에서는 빈 배열을 반환해야 한다', () => {
      container.innerHTML = '';

      const result = extractTextNodes(container);

      expect(result).toEqual([]);
    });

    it('root가 null이면 빈 배열을 반환해야 한다', () => {
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      const result = extractTextNodes(null);

      expect(result).toEqual([]);
    });
  });
});
