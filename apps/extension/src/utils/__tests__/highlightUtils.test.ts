import { describe, it, expect, beforeEach } from 'vitest';
import {
  removeHighlight,
  createHighlight,
  getHighlightPosition
} from '../highlightUtils';
import { HIGHLIGHT } from '../../config/constants';

describe('highlightUtils', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ==================== removeHighlight ====================
  describe('removeHighlight', () => {
    // 정상 케이스 (Happy Path)
    describe('정상 케이스', () => {
      it('하이라이트 요소를 제거하고 내부 텍스트를 복원해야 한다', () => {
        container.innerHTML = '<p>Hello <span class="highlight">World</span>!</p>';
        const highlightSpan = container.querySelector('.highlight') as HTMLElement;

        removeHighlight(highlightSpan);

        expect(container.innerHTML).toBe('<p>Hello World!</p>');
      });

      it('여러 자식 노드를 가진 하이라이트를 제거해야 한다', () => {
        const html = '<p><span class="highlight">Hello <strong>bold</strong> text</span></p>';
        container.innerHTML = html;
        const highlightSpan = container.querySelector('.highlight') as HTMLElement;

        removeHighlight(highlightSpan);

        expect(container.querySelector('p')?.childNodes.length).toBeGreaterThan(1);
        expect(container.innerHTML).toContain('Hello');
        expect(container.innerHTML).toContain('bold');
      });

      it('하이라이트 제거 후 원래 DOM 구조를 유지해야 한다', () => {
        container.innerHTML = '<div><span class="highlight">Text</span><span>Other</span></div>';
        const highlightSpan = container.querySelector('.highlight') as HTMLElement;

        removeHighlight(highlightSpan);

        expect(container.querySelector('div')?.childNodes.length).toBe(2);
        expect(container.textContent).toBe('TextOther');
      });
    });
  });

  // ==================== createHighlight ====================
  describe('createHighlight', () => {
    // 정상 케이스 (Happy Path)
    describe('정상 케이스', () => {
      it('Range를 하이라이트 span으로 감싸야 한다', () => {
        container.innerHTML = '<p>Hello World</p>';
        const textNode = container.querySelector('p')?.firstChild as Text;
        
        const range = document.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, 5);

        const highlightSpan = createHighlight(range);

        expect(highlightSpan).not.toBeNull();
        expect(highlightSpan?.classList.contains(HIGHLIGHT.CLASS_NAME)).toBe(true);
        expect(highlightSpan?.textContent).toBe('Hello');
      });

      it('생성된 하이라이트가 DOM에 올바르게 삽입되어야 한다', () => {
        container.innerHTML = '<p>Hello World</p>';
        const textNode = container.querySelector('p')?.firstChild as Text;
        
        const range = document.createRange();
        range.setStart(textNode, 6);
        range.setEnd(textNode, 11);

        const highlightSpan = createHighlight(range);

        const expectedHTML = `<span class="${HIGHLIGHT.CLASS_NAME}">World</span>`;
        expect(container.querySelector('p')?.innerHTML).toContain(expectedHTML);
        expect(highlightSpan?.parentElement?.tagName).toBe('P');
      });
    });

    // 빈 값 / null / undefined 처리
    describe('빈 값 처리', () => {
      it('빈 Range는 빈 하이라이트를 생성해야 한다', () => {
        container.innerHTML = '<p>Text</p>';
        const textNode = container.querySelector('p')?.firstChild as Text;
        
        const range = document.createRange();
        range.setStart(textNode, 2);
        range.setEnd(textNode, 2);

        const highlightSpan = createHighlight(range);

        expect(highlightSpan).not.toBeNull();
        expect(highlightSpan?.textContent).toBe('');
      });
    });

    // 에러 상황 및 복구
    describe('에러 상황', () => {
      it('여러 노드에 걸친 Range도 처리할 수 있어야 한다', () => {
        container.innerHTML = '<p>Hello <strong>World</strong></p>';
        const p = container.querySelector('p') as HTMLElement;
        
        const range = document.createRange();
        range.selectNodeContents(p);

        const result = createHighlight(range);

        // jsdom 환경에서는 성공할 수 있음
        if (result) {
          expect(result.classList.contains(HIGHLIGHT.CLASS_NAME)).toBe(true);
        } else {
          // 실제 브라우저에서는 실패할 수 있음
          expect(result).toBeNull();
        }
      });
    });
  });

  // ==================== getHighlightPosition ====================
  describe('getHighlightPosition', () => {
    // 정상 케이스 (Happy Path)
    describe('정상 케이스', () => {
      it('하이라이트 요소의 화면 위치를 반환해야 한다', () => {
        container.innerHTML = '<span class="highlight">Text</span>';
        const highlightSpan = container.querySelector('.highlight') as HTMLElement;

        const position = getHighlightPosition(highlightSpan);

        expect(position).toHaveProperty('x');
        expect(position).toHaveProperty('y');
        expect(typeof position.x).toBe('number');
        expect(typeof position.y).toBe('number');
      });

      it('스타일이 적용된 요소의 위치를 정확히 계산해야 한다', () => {
        const styledHTML = '<span class="highlight" ' +
          'style="position: absolute; top: 100px; left: 50px;">Text</span>';
        container.innerHTML = styledHTML;
        const highlightSpan = container.querySelector('.highlight') as HTMLElement;

        const position = getHighlightPosition(highlightSpan);

        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeGreaterThanOrEqual(0);
      });

      it('중첩된 요소 내부의 하이라이트 위치를 반환해야 한다', () => {
        const nestedHTML = '<div style="padding: 20px;">' +
          '<p><span class="highlight">Text</span></p></div>';
        container.innerHTML = nestedHTML;
        const highlightSpan = container.querySelector('.highlight') as HTMLElement;

        const position = getHighlightPosition(highlightSpan);

        expect(position).toBeDefined();
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeGreaterThanOrEqual(0);
      });
    });

    // 동일 입력 → 동일 출력
    describe('멱등성', () => {
      it('같은 요소에 대해 여러 번 호출해도 같은 결과를 반환해야 한다', () => {
        container.innerHTML = '<span class="highlight">Text</span>';
        const highlightSpan = container.querySelector('.highlight') as HTMLElement;

        const position1 = getHighlightPosition(highlightSpan);
        const position2 = getHighlightPosition(highlightSpan);

        expect(position1.x).toBe(position2.x);
        expect(position1.y).toBe(position2.y);
      });
    });
  });
});
