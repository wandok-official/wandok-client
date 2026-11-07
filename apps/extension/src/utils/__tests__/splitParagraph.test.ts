import { afterEach,beforeEach, describe, expect, it } from 'vitest';

import { splitParagraph } from '../splitParagraph';

describe('splitParagraph', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('선택된 요소를 기준으로 문단을 분리해야 한다', () => {
      const html = '<p><span class="s1">첫번째</span>' +
        '<span class="s2">두번째</span><span class="s3">세번째</span></p>';
      container.innerHTML = html;
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('첫번째');
      expect(paragraphs[1].textContent).toBe('두번째세번째');
      expect(paragraphs[1].classList.contains('wandok-split-paragraph')).toBe(true);
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('부모가 없는 요소는 분리하지 않아야 한다', () => {
      const orphanElement = document.createElement('span');
      orphanElement.textContent = 'orphan';

      splitParagraph(orphanElement);

      expect(container.children.length).toBe(0);
    });

    it('부모가 body인 요소는 분리하지 않아야 한다', () => {
      const spanInBody = document.createElement('span');
      spanInBody.textContent = 'in body';
      document.body.appendChild(spanInBody);

      splitParagraph(spanInBody);

      expect(document.body.querySelectorAll('p').length).toBe(0);

      document.body.removeChild(spanInBody);
    });

    it('블록의 직접 자식이 아닌 문장도 블록 기준으로 분리해야 한다', () => {
      container.innerHTML =
        '<p>' +
        '<span class="wandok-text-wrapper"><span class="nested-target">A</span></span>' +
        '<span>B</span>' +
        '</p>';
      const nestedTarget = container.querySelector('.nested-target') as HTMLElement;

      splitParagraph(nestedTarget);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('');
      expect(paragraphs[1].textContent).toBe('AB');
    });

    it('첫번째 자식 요소를 선택하면 원본은 비워야 한다', () => {
      container.innerHTML = '<p><span class="first">First</span><span>Second</span></p>';
      const firstElement = container.querySelector('.first') as HTMLElement;

      splitParagraph(firstElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('');
      expect(paragraphs[1].textContent).toBe('FirstSecond');
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('새 문단에서 id 속성을 제거해야 한다', () => {
      container.innerHTML = '<p id="unique"><span class="s1">A</span><span class="s2">B</span></p>';
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs[0].id).toBe('unique');
      expect(paragraphs[1].id).toBe('');
      expect(paragraphs[1].hasAttribute('id')).toBe(false);
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('연속 분리 및 복잡한 시나리오', () => {
    it('인라인 요소 안의 문장에서 문단을 분리해야 한다', () => {
      container.innerHTML =
        '<p><strong><span class="s1">A</span><span class="s2">B</span></strong>' +
        '<span class="s3">C</span></p>';
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('A');
      expect(paragraphs[0].querySelector('strong')?.textContent).toBe('A');
      expect(paragraphs[1].textContent).toBe('BC');
      expect(paragraphs[1].classList.contains('wandok-split-paragraph')).toBe(true);
      expect(paragraphs[1].querySelector('strong')?.textContent).toBe('B');
    });

    it('인라인 요소를 나누더라도 원본 id는 유지해야 한다', () => {
      container.innerHTML =
        '<p><em id="emphasis"><span class="s1">A</span><span class="s2">B</span></em></p>';
      const selectedElement = container.querySelector('.s2') as HTMLElement;

      splitParagraph(selectedElement);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs[0].querySelector('em')?.id).toBe('emphasis');
      expect(paragraphs[1].querySelector('em')?.id).toBe('');
      expect(paragraphs[1].querySelector('em')?.hasAttribute('id')).toBe(false);
    });

    it('이미 분리된 문단을 다시 분리할 수 있어야 한다', () => {
      const html = '<p><span class="s1">A</span>' +
        '<span class="s2">B</span><span class="s3">C</span></p>';
      container.innerHTML = html;

      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);

      expect(container.querySelectorAll('p').length).toBe(2);

      const s3 = container.querySelector('.s3') as HTMLElement;
      splitParagraph(s3);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0].textContent).toBe('A');
      expect(paragraphs[1].textContent).toBe('B');
      expect(paragraphs[2].textContent).toBe('C');
    });
  });
});
