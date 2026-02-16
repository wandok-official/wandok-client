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

    it('타겟 블록 자체는 blur되지 않아야 한다', () => {
      applyBlurEffect(block1, allBlocks, true);

      expect(block1.classList.contains('wandok-blur')).toBe(false);
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
    it('빈 블록 Set에서도 오류 없이 동작해야 한다', () => {
      const emptySet = new Set<HTMLElement>();

      expect(() => {
        applyBlurEffect(block1, emptySet, true);
      }).not.toThrow();
    });

    it('단일 블록 Set에서는 blur가 적용되지 않아야 한다', () => {
      const singleSet = new Set([block1]);

      applyBlurEffect(block1, singleSet, true);

      expect(block1.classList.contains('wandok-blur')).toBe(false);
    });

    it('타겟이 Set에 없어도 다른 블록들은 blur 처리되어야 한다', () => {
      const outsideBlock = document.createElement('p');
      outsideBlock.textContent = '외부 블록';
      container.appendChild(outsideBlock);

      applyBlurEffect(outsideBlock, allBlocks, true);

      expect(block1.classList.contains('wandok-blur')).toBe(true);
      expect(block2.classList.contains('wandok-blur')).toBe(true);
      expect(block3.classList.contains('wandok-blur')).toBe(true);
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('같은 블록을 반복 호버해도 상태가 유지되어야 한다', () => {
      applyBlurEffect(block2, allBlocks, true);
      applyBlurEffect(block2, allBlocks, true);

      expect(block1.classList.contains('wandok-blur')).toBe(true);
      expect(block2.classList.contains('wandok-blur')).toBe(false);
      expect(block3.classList.contains('wandok-blur')).toBe(true);
    });

    it('enter → leave → enter 순서로 올바르게 동작해야 한다', () => {
      applyBlurEffect(block2, allBlocks, true);
      expect(block1.classList.contains('wandok-blur')).toBe(true);

      applyBlurEffect(block2, allBlocks, false);
      expect(block1.classList.contains('wandok-blur')).toBe(false);

      applyBlurEffect(block2, allBlocks, true);
      expect(block1.classList.contains('wandok-blur')).toBe(true);
    });

    it('여러 블록을 순차적으로 호버해도 일관성 있게 동작해야 한다', () => {
      applyBlurEffect(block1, allBlocks, true);
      expect(block2.classList.contains('wandok-blur')).toBe(true);

      applyBlurEffect(block1, allBlocks, false);
      expect(block2.classList.contains('wandok-blur')).toBe(false);

      applyBlurEffect(block3, allBlocks, true);
      expect(block2.classList.contains('wandok-blur')).toBe(true);
      expect(block3.classList.contains('wandok-blur')).toBe(false);
    });

    it('기존 클래스를 유지하면서 blur 클래스를 추가해야 한다', () => {
      block1.classList.add('custom-class', 'another-class');

      applyBlurEffect(block2, allBlocks, true);

      expect(block1.classList.contains('custom-class')).toBe(true);
      expect(block1.classList.contains('another-class')).toBe(true);
      expect(block1.classList.contains('wandok-blur')).toBe(true);
    });

    it('blur 제거 시 다른 클래스는 유지되어야 한다', () => {
      block1.classList.add('custom-class');
      
      applyBlurEffect(block2, allBlocks, true);
      applyBlurEffect(block2, allBlocks, false);

      expect(block1.classList.contains('custom-class')).toBe(true);
      expect(block1.classList.contains('wandok-blur')).toBe(false);
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

    it('관련 없는 형제 요소는 blur 처리되어야 한다', () => {
      const child1 = container.querySelector('.child1') as HTMLElement;
      const child2 = container.querySelector('.child2') as HTMLElement;
      const sibling = container.querySelector('.sibling') as HTMLElement;

      applyBlurEffect(child1, allBlocks, true);

      expect(child2.classList.contains('wandok-blur')).toBe(true);
      expect(sibling.classList.contains('wandok-blur')).toBe(true);
    });
  });
});
