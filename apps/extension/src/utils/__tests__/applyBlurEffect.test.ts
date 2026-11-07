import { afterEach,beforeEach, describe, expect, it } from 'vitest';

import { applyBlurEffect } from '../applyBlurEffect';

describe('applyBlurEffect', () => {
  let container: HTMLElement;
  let block1: HTMLElement;
  let block2: HTMLElement;
  let block3: HTMLElement;
  let allBlocks: Set<HTMLElement>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    container.innerHTML = `
      <p class="block1">첫 번째 문단</p>
      <p class="block2">두 번째 문단</p>
      <p class="block3">세 번째 문단</p>
    `;

    block1 = container.querySelector('.block1') as HTMLElement;
    block2 = container.querySelector('.block2') as HTMLElement;
    block3 = container.querySelector('.block3') as HTMLElement;

    allBlocks = new Set([block1, block2, block3]);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('마우스 진입 시 타겟 외 블록에 blur 클래스를 추가해야 한다', () => {
      applyBlurEffect(block2, allBlocks, true);

      expect(block1.classList.contains('wandok-blur')).toBe(true);
      expect(block2.classList.contains('wandok-blur')).toBe(false);
      expect(block3.classList.contains('wandok-blur')).toBe(true);
    });

    it('마우스 나갈 때 모든 blur 클래스를 제거해야 한다', () => {
      applyBlurEffect(block2, allBlocks, true);
      applyBlurEffect(block2, allBlocks, false);

      expect(block1.classList.contains('wandok-blur')).toBe(false);
      expect(block2.classList.contains('wandok-blur')).toBe(false);
      expect(block3.classList.contains('wandok-blur')).toBe(false);
    });

    it('다른 블록으로 이동 시 blur가 올바르게 갱신되어야 한다', () => {
      applyBlurEffect(block2, allBlocks, true);
      expect(block1.classList.contains('wandok-blur')).toBe(true);
      expect(block2.classList.contains('wandok-blur')).toBe(false);
      expect(block3.classList.contains('wandok-blur')).toBe(true);

      applyBlurEffect(block3, allBlocks, true);
      expect(block1.classList.contains('wandok-blur')).toBe(true);
      expect(block2.classList.contains('wandok-blur')).toBe(true);
      expect(block3.classList.contains('wandok-blur')).toBe(false);
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('DOM에서 떨어진 블록은 블러 대상에서 제거해야 한다', () => {
      const detached = document.createElement('p');
      detached.classList.add('wandok-blur');
      allBlocks.add(detached);

      applyBlurEffect(block2, allBlocks, true);

      expect(allBlocks.has(detached)).toBe(false);
      expect(block1.classList.contains('wandok-blur')).toBe(true);
      expect(block2.classList.contains('wandok-blur')).toBe(false);
    });

    it('마우스가 나갈 때도 떨어진 블록을 제거해야 한다', () => {
      const detached = document.createElement('p');
      allBlocks.add(detached);

      applyBlurEffect(block1, allBlocks, false);

      expect(allBlocks.has(detached)).toBe(false);
      expect(allBlocks.size).toBe(3);
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('중첩 구조 및 복잡한 시나리오', () => {
    beforeEach(() => {
      container.innerHTML = `
        <div class="parent">
          <p class="child1">자식 1</p>
          <p class="child2">자식 2</p>
        </div>
        <p class="sibling">형제</p>
      `;

      const parent = container.querySelector('.parent') as HTMLElement;
      const child1 = container.querySelector('.child1') as HTMLElement;
      const child2 = container.querySelector('.child2') as HTMLElement;
      const sibling = container.querySelector('.sibling') as HTMLElement;

      allBlocks = new Set([parent, child1, child2, sibling]);
    });

    it('부모 요소가 타겟이면 자식은 blur되지 않아야 한다', () => {
      const parent = container.querySelector('.parent') as HTMLElement;
      const child1 = container.querySelector('.child1') as HTMLElement;

      applyBlurEffect(parent, allBlocks, true);

      expect(parent.classList.contains('wandok-blur')).toBe(false);
      expect(child1.classList.contains('wandok-blur')).toBe(false);
    });

    it('자식 요소가 타겟이면 부모는 blur되지 않아야 한다', () => {
      const parent = container.querySelector('.parent') as HTMLElement;
      const child1 = container.querySelector('.child1') as HTMLElement;

      applyBlurEffect(child1, allBlocks, true);

      expect(child1.classList.contains('wandok-blur')).toBe(false);
      expect(parent.classList.contains('wandok-blur')).toBe(false);
    });
  });
});
