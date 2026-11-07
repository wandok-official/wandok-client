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

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('단순 텍스트 노드를 추출해야 한다.', () => {
      container.innerHTML = '<p>Hello World!</p>';

      const result = extractTextNodes(container);

      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Hello World!');
    });

    it('여러 텍스트 노드를 추출해야 한다.', () => {
      container.innerHTML = '<h1>First</h1><p>Second</p><span>Third</span>';

      const result = extractTextNodes(container);

      expect(result).toHaveLength(3);
      expect(result[0].textContent).toBe('First');
      expect(result[1].textContent).toBe('Second');
      expect(result[2].textContent).toBe('Third');
    });

    it('excludeTags로 지정해 놓은 태그 내부의 텍스트는 텍스트 노드 추출에서 제외해야 한다.', () => {
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

    it('BUTTON, A, LABEL, SUMMARY 태그 내부의 텍스트는 추출에서 제외해야 한다', () => {
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
  });

  // ==================== 빈 값 / null / undefined 처리 ====================

  describe('빈 값 / null / undefined 처리', () => {
    it('공백만 있는 텍스트 노드는 제외해야 한다.', () => {
      container.innerHTML = '<p>   </p><p>Hello</p>';

      const result = extractTextNodes(container);

      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('Hello');
    });

    it('빈 컨테이너에서는 빈 배열을 반환해야 한다', () => {
      container.innerHTML = '';

      const result = extractTextNodes(container);

      expect(result).toEqual([]);
    });

    it('null 또는 undefined일 때 빈 배열을 반환해야 한다.', () => {
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(extractTextNodes(null)).toEqual([]);
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(extractTextNodes(undefined)).toEqual([]);
    });
  });

  describe('중첩 구조 케이스', () => {
    it('wandok-text-wrapper 클래스가 있는 요소 안의 텍스트는 제외해야 한다', () => {
      container.innerHTML = `
        <p>일반 텍스트</p>
        <p><span class="wandok-text-wrapper">이미 처리된 텍스트</span></p>
      `;

      const result = extractTextNodes(container);

      expect(result).toHaveLength(1);
      expect(result[0].textContent).toBe('일반 텍스트');
    });
  });
});
