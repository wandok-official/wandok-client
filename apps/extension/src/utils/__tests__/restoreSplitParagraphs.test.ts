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
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
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

    it('자식이 없는 빈 wandok-split-paragraph도 제거되어야 한다', () => {
      container.innerHTML = '<p><span>A</span></p><p class="wandok-split-paragraph"></p>';
      const splitP = container.querySelector('.wandok-split-paragraph') as HTMLElement;
      allBlockElements.add(splitP);

      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('.wandok-split-paragraph').length).toBe(0);
      expect(allBlockElements.has(splitP)).toBe(false);
    });
  });

  describe('복잡한 시나리오', () => {
    it('인라인 요소 안에서 분리한 문단도 텍스트 순서를 복원해야 한다', () => {
      container.innerHTML =
        '<p><strong><span class="s1">A</span><span class="s2">B</span></strong>' +
        '<span class="s3">C</span></p>';
      const originalP = container.querySelector('p') as HTMLElement;
      allBlockElements.add(originalP);

      const selected = container.querySelector('.s2') as HTMLElement;
      splitParagraph(selected);
      allBlockElements.add(container.querySelector('.wandok-split-paragraph') as HTMLElement);

      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelector('p')?.textContent).toBe('ABC');
      expect(container.querySelectorAll('.wandok-split-paragraph').length).toBe(0);
    });

    it('비인접 분리 문단이 있어도 올바르게 복원해야 한다', () => {
      // A의 분리 | 일반 문단 | B의 분리 구조
      container.innerHTML =
        '<p><span>A</span></p>' +
        '<p class="wandok-split-paragraph"><span>A-split</span></p>' +
        '<p><span>Normal</span></p>' +
        '<p class="wandok-split-paragraph"><span>Normal-split</span></p>';

      const splitPs = container.querySelectorAll<HTMLElement>('.wandok-split-paragraph');
      splitPs.forEach((p) => allBlockElements.add(p));

      restoreSplitParagraphs(allBlockElements);

      expect(container.querySelectorAll('.wandok-split-paragraph').length).toBe(0);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toBe('AA-split');
      expect(paragraphs[1].textContent).toBe('NormalNormal-split');
    });
  });
});
