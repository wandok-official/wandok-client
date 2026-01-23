import { fireEvent } from '@test/helpers/test-utils';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useClickOutsideClassName } from '../useClickOutsideClassName';

describe('useClickOutsideClassName', () => {
  let container: HTMLElement;
  let targetElement: HTMLElement;
  let outsideElement: HTMLElement;
  let mockCallback: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    // 테스트용 DOM 구조 생성
    container = document.createElement('div');
    document.body.appendChild(container);

    targetElement = document.createElement('div');
    targetElement.className = 'test-target';
    targetElement.textContent = 'Target';

    outsideElement = document.createElement('div');
    outsideElement.className = 'outside';
    outsideElement.textContent = 'Outside';

    container.appendChild(targetElement);
    container.appendChild(outsideElement);

    mockCallback = vi.fn<() => void>();
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('타겟 클래스 외부 클릭 시 콜백이 호출되어야 한다', () => {
      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(outsideElement);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('타겟 클래스 내부 클릭 시 콜백이 호출되지 않아야 한다', () => {
      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(targetElement);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('타겟 클래스를 가진 자식 요소 클릭 시 콜백이 호출되지 않아야 한다', () => {
      const childElement = document.createElement('span');
      childElement.textContent = 'Child';
      targetElement.appendChild(childElement);

      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(childElement);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('document 전체에 클릭 시 콜백이 호출되어야 한다', () => {
      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(document.body);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('isEnabled가 false면 콜백이 호출되지 않아야 한다', () => {
      renderHook(() =>
        useClickOutsideClassName(false, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(outsideElement);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('존재하지 않는 클래스명으로 모든 클릭이 외부로 간주되어야 한다', () => {
      renderHook(() =>
        useClickOutsideClassName(true, 'non-existent', mockCallback),
      );

      fireEvent.mouseDown(targetElement);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('빈 문자열 클래스명으로 모든 클릭이 외부로 간주되어야 한다', () => {
      renderHook(() => useClickOutsideClassName(true, '', mockCallback));

      fireEvent.mouseDown(targetElement);

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('동일한 타겟에 여러 번 클릭해도 일관되게 동작해야 한다', () => {
      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(targetElement);
      fireEvent.mouseDown(targetElement);
      fireEvent.mouseDown(targetElement);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('외부를 여러 번 클릭하면 매번 콜백이 호출되어야 한다', () => {
      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(outsideElement);
      fireEvent.mouseDown(outsideElement);
      fireEvent.mouseDown(outsideElement);

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('에러 상황', () => {
    it('훅 unmount 시 이벤트 리스너가 제거되어야 한다', () => {
      const { unmount } = renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      unmount();
      fireEvent.mouseDown(outsideElement);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('isEnabled 변경 시 리스너가 재등록되어야 한다', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useClickOutsideClassName(enabled, 'test-target', mockCallback),
        { initialProps: { enabled: false } },
      );

      // 비활성 상태에서는 호출되지 않음
      fireEvent.mouseDown(outsideElement);
      expect(mockCallback).not.toHaveBeenCalled();

      // 활성화
      rerender({ enabled: true });
      fireEvent.mouseDown(outsideElement);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 복잡한 시나리오 ====================
  describe('복잡한 시나리오', () => {
    it('중첩된 타겟 클래스 구조에서도 올바르게 동작해야 한다', () => {
      const parent = document.createElement('div');
      parent.className = 'test-target';

      const child = document.createElement('div');
      child.className = 'test-target';

      parent.appendChild(child);
      container.appendChild(parent);

      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      // 부모 클릭
      fireEvent.mouseDown(parent);
      expect(mockCallback).not.toHaveBeenCalled();

      // 자식 클릭
      fireEvent.mouseDown(child);
      expect(mockCallback).not.toHaveBeenCalled();

      // 외부 클릭
      fireEvent.mouseDown(outsideElement);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('여러 클래스를 가진 요소에서도 올바르게 동작해야 한다', () => {
      const multiClassElement = document.createElement('div');
      multiClassElement.className = 'test-target other-class another-class';
      container.appendChild(multiClassElement);

      renderHook(() =>
        useClickOutsideClassName(true, 'test-target', mockCallback),
      );

      fireEvent.mouseDown(multiClassElement);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('className이 변경되면 새로운 클래스를 추적해야 한다', () => {
      const { rerender } = renderHook(
        ({ className }) =>
          useClickOutsideClassName(true, className, mockCallback),
        { initialProps: { className: 'test-target' } },
      );

      // 초기 클래스 테스트
      fireEvent.mouseDown(targetElement);
      expect(mockCallback).not.toHaveBeenCalled();

      // 클래스 변경
      rerender({ className: 'different-class' });
      fireEvent.mouseDown(targetElement);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });
});
