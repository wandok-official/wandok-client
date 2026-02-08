import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { restoreSplitParagraphs } from '../restoreSplitParagraphs';
import { splitParagraph } from '../splitParagraph';

describe('restoreSplitParagraphs', () => {
  let container: HTMLElement;
  let allBlockElements: Set<HTMLElement>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    allBlockElements = new Set();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('분리된 문단을 원래 상태로 복원해야 한다', () => {
      container.innerHTML =
        '<p><span class="s1">첫번째</span><span class="s2">두번째</span><span class="s3">세번째</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);

      expect(container.querySelectorAll('p').length).toBe(2);

      const splitP = container.querySelector('.wandok-split-paragraph') as HTMLElement;
      allBlockElements.add(splitP);

      restoreSplitParagraphs(allBlockElements);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0].textContent).toBe('첫번째두번째세번째');
    });

    it('여러 번 분리된 문단을 모두 복원해야 한다', () => {
      container.innerHTML =
        '<p><span class="s1">A</span><span class="s2">B</span><span class="s3">C</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      // 첫 번째 분리: A | B C
      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);
      allBlockElements.add(container.querySelectorAll('p')[1]);

      // 두 번째 분리: A | B | C
      const s3 = container.querySelector('.s3') as HTMLElement;
      splitParagraph(s3);
      allBlockElements.add(container.querySelectorAll('p')[2]);

      expect(container.querySelectorAll('p').length).toBe(3);

      restoreSplitParagraphs(allBlockElements);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0].textContent).toBe('ABC');
    });

    it('복원 후 allBlockElements에서 분리된 문단을 제거해야 한다', () => {
      container.innerHTML =
        '<p><span class="s1">A</span><span class="s2">B</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);

      const splitP = container.querySelector('.wandok-split-paragraph') as HTMLElement;
      allBlockElements.add(splitP);

      expect(allBlockElements.size).toBe(2);

      restoreSplitParagraphs(allBlockElements);

      expect(allBlockElements.size).toBe(1);
      expect(allBlockElements.has(originalP)).toBe(true);
      expect(allBlockElements.has(splitP)).toBe(false);
    });

    it('분리된 문단의 자식 순서가 올바르게 복원되어야 한다', () => {
      container.innerHTML =
        '<p><span class="s1">A</span><span class="s2">B</span>' +
        '<span class="s3">C</span><span class="s4">D</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      const s3 = container.querySelector('.s3') as HTMLElement;
      splitParagraph(s3);
      allBlockElements.add(container.querySelectorAll('p')[1]);

      restoreSplitParagraphs(allBlockElements);

      const spans = container.querySelectorAll('span');
      expect(spans.length).toBe(4);
      expect(spans[0].textContent).toBe('A');
      expect(spans[1].textContent).toBe('B');
      expect(spans[2].textContent).toBe('C');
      expect(spans[3].textContent).toBe('D');
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('분리된 문단이 없으면 아무것도 변경하지 않아야 한다', () => {
      container.innerHTML = '<p><span>A</span><span>B</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('p')?.textContent).toBe('AB');
      expect(allBlockElements.size).toBe(1);
    });

    it('allBlockElements가 비어 있어도 DOM 복원이 동작해야 한다', () => {
      container.innerHTML =
        '<p><span class="s1">A</span><span class="s2">B</span></p>';

      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);

      expect(container.querySelectorAll('p').length).toBe(2);

      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('p')?.textContent).toBe('AB');
    });

    it('previousElementSibling이 없는 분리 문단은 건너뛰어야 한다', () => {
      // wandok-split-paragraph이지만 이전 형제가 없는 비정상 케이스
      container.innerHTML = '<p class="wandok-split-paragraph"><span>A</span></p>';
      const splitP = container.querySelector('.wandok-split-paragraph') as HTMLElement;
      allBlockElements.add(splitP);

      restoreSplitParagraphs(allBlockElements);

      // 이전 형제가 없으므로 그대로 유지
      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('p')?.textContent).toBe('A');
    });
  });

  // ==================== 멱등성 및 일관성 ====================
  describe('멱등성 및 일관성', () => {
    it('복원을 두 번 호출해도 안전해야 한다', () => {
      container.innerHTML =
        '<p><span class="s1">A</span><span class="s2">B</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);
      allBlockElements.add(container.querySelector('.wandok-split-paragraph') as HTMLElement);

      restoreSplitParagraphs(allBlockElements);
      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('p')?.textContent).toBe('AB');
    });

    it('분리 후 복원을 반복해도 원래 상태를 유지해야 한다', () => {
      container.innerHTML =
        '<p><span class="s1">A</span><span class="s2">B</span><span class="s3">C</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      // 1차: 분리 → 복원
      const s2 = container.querySelector('.s2') as HTMLElement;
      splitParagraph(s2);
      allBlockElements.add(container.querySelector('.wandok-split-paragraph') as HTMLElement);
      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('p')?.textContent).toBe('ABC');

      // 2차: 다시 분리 → 복원
      const s3 = container.querySelector('.s3') as HTMLElement;
      splitParagraph(s3);
      allBlockElements.add(container.querySelector('.wandok-split-paragraph') as HTMLElement);
      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('p')?.textContent).toBe('ABC');
    });
  });

  // ==================== 복잡한 시나리오 ====================
  describe('복잡한 시나리오', () => {
    it('여러 독립 문단에서 각각 분리된 것을 모두 복원해야 한다', () => {
      container.innerHTML =
        '<p><span class="a1">A</span><span class="a2">B</span></p>' +
        '<p><span class="b1">C</span><span class="b2">D</span></p>';

      const paragraphs = container.querySelectorAll('p');
      allBlockElements.add(paragraphs[0]);
      allBlockElements.add(paragraphs[1]);

      // 첫 번째 문단 분리
      const a2 = container.querySelector('.a2') as HTMLElement;
      splitParagraph(a2);
      allBlockElements.add(container.querySelector('.wandok-split-paragraph') as HTMLElement);

      // 두 번째 문단 분리
      const b2 = container.querySelector('.b2') as HTMLElement;
      splitParagraph(b2);
      const splitParagraphsList =
        container.querySelectorAll<HTMLElement>('.wandok-split-paragraph');
      allBlockElements.add(splitParagraphsList[1]);

      expect(container.querySelectorAll('p').length).toBe(4);

      restoreSplitParagraphs(allBlockElements);

      const restored = container.querySelectorAll('p');
      expect(restored.length).toBe(2);
      expect(restored[0].textContent).toBe('AB');
      expect(restored[1].textContent).toBe('CD');
    });

    it('중첩된 구조가 있는 문단도 올바르게 복원해야 한다', () => {
      container.innerHTML =
        '<p><span>A</span><span class="selected"><strong>B</strong><em>C</em></span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      const selected = container.querySelector('.selected') as HTMLElement;
      splitParagraph(selected);
      allBlockElements.add(container.querySelector('.wandok-split-paragraph') as HTMLElement);

      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('strong')?.textContent).toBe('B');
      expect(container.querySelector('em')?.textContent).toBe('C');
    });
  });
});
