import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { restoreTextWrappers } from '../restoreTextWrappers';

describe('restoreTextWrappers', () => {
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
    it('래퍼 span을 원래 텍스트 노드로 복원해야 한다', () => {
      container.innerHTML =
        '<p><span class="wandok-text-wrapper">첫 번째 문장입니다.</span>' +
        '<span class="wandok-text-wrapper">두 번째 문장입니다.</span></p>';

      restoreTextWrappers();

      expect(container.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
      expect(container.querySelector('p')?.textContent).toBe(
        '첫 번째 문장입니다.두 번째 문장입니다.',
      );
    });

    it('복원 후 인접 텍스트 노드가 normalize로 병합되어야 한다', () => {
      container.innerHTML =
        '<p><span class="wandok-text-wrapper">A</span>' +
        '<span class="wandok-text-wrapper">B</span></p>';

      restoreTextWrappers();

      const p = container.querySelector('p') as HTMLElement;
      // normalize로 인접 텍스트 노드가 병합되어 하나의 텍스트 노드만 남아야 함
      expect(p.childNodes.length).toBe(1);
      expect(p.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
      expect(p.textContent).toBe('AB');
    });

    it('여러 문단의 래퍼를 모두 복원해야 한다', () => {
      container.innerHTML =
        '<p><span class="wandok-text-wrapper">A</span></p>' +
        '<p><span class="wandok-text-wrapper">B</span></p>';

      restoreTextWrappers();

      expect(container.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs[0].textContent).toBe('A');
      expect(paragraphs[1].textContent).toBe('B');
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('래퍼가 없으면 아무것도 변경하지 않아야 한다', () => {
      container.innerHTML = '<p>일반 텍스트입니다.</p>';
      const originalHTML = container.innerHTML;

      restoreTextWrappers();

      expect(container.innerHTML).toBe(originalHTML);
    });

    it('빈 래퍼 span도 제거되어야 한다', () => {
      container.innerHTML = '<p><span class="wandok-text-wrapper"></span></p>';

      restoreTextWrappers();

      expect(container.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
    });
  });

  // ==================== 중첩 구조 ====================
  describe('중첩 구조', () => {
    it('래퍼와 일반 요소가 섞인 구조에서 래퍼만 복원해야 한다', () => {
      container.innerHTML =
        '<p><strong>강조</strong><span class="wandok-text-wrapper">래핑된 텍스트</span></p>';

      restoreTextWrappers();

      expect(container.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
      expect(container.querySelector('strong')?.textContent).toBe('강조');
      expect(container.querySelector('p')?.textContent).toBe('강조래핑된 텍스트');
    });

    it('래퍼 사이에 다른 요소가 있는 구조도 올바르게 복원해야 한다', () => {
      container.innerHTML =
        '<p><span class="wandok-text-wrapper">A</span>' +
        '<em>중간</em>' +
        '<span class="wandok-text-wrapper">B</span></p>';

      restoreTextWrappers();

      expect(container.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
      expect(container.querySelector('em')?.textContent).toBe('중간');
      expect(container.querySelector('p')?.textContent).toBe('A중간B');
    });
  });

  // ==================== 멱등성 및 일관성 ====================
  describe('멱등성 및 일관성', () => {
    it('복원을 두 번 호출해도 안전해야 한다', () => {
      container.innerHTML =
        '<p><span class="wandok-text-wrapper">A</span>' +
        '<span class="wandok-text-wrapper">B</span></p>';

      restoreTextWrappers();
      restoreTextWrappers();

      expect(container.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
      expect(container.querySelector('p')?.textContent).toBe('AB');
    });

    it('래퍼가 없는 상태에서 호출해도 DOM이 변경되지 않아야 한다', () => {
      container.innerHTML = '<p>텍스트</p>';

      restoreTextWrappers();
      const firstHTML = container.innerHTML;

      restoreTextWrappers();
      expect(container.innerHTML).toBe(firstHTML);
    });
  });
});
