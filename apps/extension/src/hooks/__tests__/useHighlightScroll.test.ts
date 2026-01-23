import { fireEvent } from '@test/helpers/test-utils';
import { createMockElement } from '@test/mocks/dom';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Position } from '../../types/position';
import { useHighlightScroll } from '../useHighlightScroll';

// getHighlightPosition mock
vi.mock('../../utils/highlightUtils', () => ({
  getHighlightPosition: vi.fn((element: HTMLElement): Position => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
    };
  }),
}));

describe('useHighlightScroll', () => {
  let highlightElement: HTMLElement;
  let mockCallback: ReturnType<typeof vi.fn<(position: Position) => void>>;

  beforeEach(() => {
    highlightElement = createMockElement('span', {
      top: 100,
      left: 50,
      width: 200,
      height: 20,
    });
    document.body.appendChild(highlightElement);

    mockCallback = vi.fn<(position: Position) => void>();
  });

  afterEach(() => {
    if (highlightElement.parentElement) {
      document.body.removeChild(highlightElement);
    }
    vi.clearAllMocks();
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('스크롤 이벤트 발생 시 콜백이 호출되어야 한다', () => {
      renderHook(() =>
        useHighlightScroll(true, highlightElement, mockCallback),
      );

      fireEvent.scroll(window);

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith({
        x: 50,
        y: 100,
      });
    });

    it('여러 번 스크롤 시 매번 콜백이 호출되어야 한다', () => {
      renderHook(() =>
        useHighlightScroll(true, highlightElement, mockCallback),
      );

      fireEvent.scroll(window);
      fireEvent.scroll(window);
      fireEvent.scroll(window);

      expect(mockCallback).toHaveBeenCalledTimes(3);
    });

    it('하이라이트 요소의 위치 정보를 콜백에 전달해야 한다', () => {
      renderHook(() =>
        useHighlightScroll(true, highlightElement, mockCallback),
      );

      fireEvent.scroll(window);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          x: expect.any(Number),
          y: expect.any(Number),
        }),
      );
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('isEnabled가 false면 스크롤 이벤트를 무시해야 한다', () => {
      renderHook(() =>
        useHighlightScroll(false, highlightElement, mockCallback),
      );

      fireEvent.scroll(window);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('highlightElement가 null이면 스크롤 이벤트를 무시해야 한다', () => {
      renderHook(() => useHighlightScroll(true, null, mockCallback));

      fireEvent.scroll(window);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('isEnabled와 highlightElement가 모두 false/null이면 무시해야 한다', () => {
      renderHook(() => useHighlightScroll(false, null, mockCallback));

      fireEvent.scroll(window);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('동일한 위치에서 스크롤 시 동일한 위치 정보를 반환해야 한다', () => {
      renderHook(() =>
        useHighlightScroll(true, highlightElement, mockCallback),
      );

      fireEvent.scroll(window);
      const firstCall = mockCallback.mock.calls[0][0];

      fireEvent.scroll(window);
      const secondCall = mockCallback.mock.calls[1][0];

      expect(firstCall).toEqual(secondCall);
    });

    it('하이라이트 요소가 변경되지 않으면 일관된 결과를 제공해야 한다', () => {
      const { rerender } = renderHook(
        ({ element }) => useHighlightScroll(true, element, mockCallback),
        { initialProps: { element: highlightElement } },
      );

      fireEvent.scroll(window);
      const firstPosition = mockCallback.mock.calls[0][0];

      rerender({ element: highlightElement });
      fireEvent.scroll(window);
      const secondPosition = mockCallback.mock.calls[1][0];

      expect(firstPosition).toEqual(secondPosition);
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('에러 상황', () => {
    it('훅 unmount 시 이벤트 리스너가 제거되어야 한다', () => {
      const { unmount } = renderHook(() =>
        useHighlightScroll(true, highlightElement, mockCallback),
      );

      unmount();
      fireEvent.scroll(window);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('isEnabled 변경 시 리스너가 재등록되어야 한다', () => {
      const { rerender } = renderHook(
        ({ enabled }) =>
          useHighlightScroll(enabled, highlightElement, mockCallback),
        { initialProps: { enabled: false } },
      );

      // 비활성 상태
      fireEvent.scroll(window);
      expect(mockCallback).not.toHaveBeenCalled();

      // 활성화
      rerender({ enabled: true });
      fireEvent.scroll(window);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('highlightElement 변경 시 새 요소를 추적해야 한다', () => {
      const newElement = createMockElement('div', {
        top: 200,
        left: 100,
        width: 150,
        height: 30,
      });
      document.body.appendChild(newElement);

      const { rerender } = renderHook(
        ({ element }) => useHighlightScroll(true, element, mockCallback),
        { initialProps: { element: highlightElement } },
      );

      fireEvent.scroll(window);
      expect(mockCallback).toHaveBeenCalledWith({ x: 50, y: 100 });

      // 요소 변경
      rerender({ element: newElement });
      mockCallback.mockClear();

      fireEvent.scroll(window);
      expect(mockCallback).toHaveBeenCalledWith({ x: 100, y: 200 });

      document.body.removeChild(newElement);
    });
  });

  // ==================== 복잡한 시나리오 ====================
  describe('복잡한 시나리오', () => {
    it('capture phase에서 스크롤 이벤트를 감지해야 한다', () => {
      const scrollableDiv = document.createElement('div');
      scrollableDiv.style.overflow = 'auto';
      scrollableDiv.style.height = '100px';
      document.body.appendChild(scrollableDiv);

      renderHook(() =>
        useHighlightScroll(true, highlightElement, mockCallback),
      );

      // 자식 요소의 스크롤도 capture phase에서 감지
      fireEvent.scroll(scrollableDiv);

      expect(mockCallback).toHaveBeenCalled();

      document.body.removeChild(scrollableDiv);
    });

    it('빠르게 연속으로 스크롤해도 모든 이벤트를 처리해야 한다', () => {
      renderHook(() =>
        useHighlightScroll(true, highlightElement, mockCallback),
      );

      for (let i = 0; i < 10; i++) {
        fireEvent.scroll(window);
      }

      expect(mockCallback).toHaveBeenCalledTimes(10);
    });

    it('하이라이트 요소가 null에서 유효한 요소로 변경되면 추적을 시작해야 한다', () => {
      const { rerender } = renderHook(
        ({ element }) => useHighlightScroll(true, element, mockCallback),
        { initialProps: { element: null } },
      );

      fireEvent.scroll(window);
      expect(mockCallback).not.toHaveBeenCalled();

      // 요소 설정
      rerender({ element: highlightElement });
      fireEvent.scroll(window);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('콜백 함수가 변경되면 새 콜백을 사용해야 한다', () => {
      const newCallback = vi.fn<(position: Position) => void>();

      const { rerender } = renderHook(
        ({ callback }) =>
          useHighlightScroll(true, highlightElement, callback),
        { initialProps: { callback: mockCallback } },
      );

      fireEvent.scroll(window);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(newCallback).not.toHaveBeenCalled();

      // 콜백 변경
      rerender({ callback: newCallback });
      fireEvent.scroll(window);
      expect(newCallback).toHaveBeenCalledTimes(1);
    });
  });
});
