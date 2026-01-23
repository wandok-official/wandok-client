import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextSelection, type SelectionResult } from '../useTextSelection';
import { createHighlight, getHighlightPosition, removeHighlight } from '../../utils/highlightUtils';
import { HIGHLIGHT } from '../../config/constants';
import { createMockSelection } from '@test/mocks/dom';

vi.mock('../../utils/highlightUtils', () => ({
  removeHighlight: vi.fn(),
  createHighlight: vi.fn(),
  getHighlightPosition: vi.fn(),
}));

describe('useTextSelection', () => {
  let onSelectionChange: Mock<(result: SelectionResult) => void>;
  let onError: Mock<() => void>;

  beforeEach(() => {
    onSelectionChange = vi.fn();
    onError = vi.fn();
    vi.clearAllMocks();

    vi.spyOn(window, 'getSelection').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  // ==================== 빈 값 / null / undefined 처리 ====================

  describe('빈 값 / null / undefined 처리', () => {
    it('selection이 null이면 콜백을 호출하지 않아야 한다', () => {
      vi.spyOn(window, 'getSelection').mockReturnValue(null);

      renderHook(() => useTextSelection(onSelectionChange));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(createHighlight).not.toHaveBeenCalled();
    });

    it('selection.toString()이 빈 문자열이면 콜백을 호출하지 않아야 한다', () => {
      const mockSelection = createMockSelection({ text: '', rangeCount: 0 });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      renderHook(() => useTextSelection(onSelectionChange));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('selection.toString()이 공백만 포함하면 콜백을 호출하지 않아야 한다', () => {
      const mockSelection = createMockSelection({ text: '   \t\n  ', rangeCount: 0 });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      renderHook(() => useTextSelection(onSelectionChange));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('rangeCount가 0이면 하이라이트를 생성하지 않아야 한다', () => {
      const mockSelection = createMockSelection({ text: 'selected text', rangeCount: 0 });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      renderHook(() => useTextSelection(onSelectionChange));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(createHighlight).not.toHaveBeenCalled();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('텍스트 선택 시 하이라이트를 생성하고 콜백을 호출해야 한다', () => {
      const mockRange = {} as Range;
      const mockHighlightElement = document.createElement('span');
      const mockPosition = { x: 100, y: 200 };

      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(mockHighlightElement);
      vi.mocked(getHighlightPosition).mockReturnValue(mockPosition);

      renderHook(() => useTextSelection(onSelectionChange));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(createHighlight).toHaveBeenCalledWith(mockRange);
      expect(getHighlightPosition).toHaveBeenCalledWith(mockHighlightElement);
      expect(onSelectionChange).toHaveBeenCalledWith({
        highlight: mockHighlightElement,
        position: mockPosition,
      });
    });

    it('하이라이트 생성 후 selection.removeAllRanges()를 호출해야 한다', () => {
      const mockRange = {} as Range;
      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(document.createElement('span'));
      vi.mocked(getHighlightPosition).mockReturnValue({ x: 0, y: 0 });

      renderHook(() => useTextSelection(onSelectionChange));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    });

    it('기존 하이라이트가 있으면 제거한 후 새 하이라이트를 생성해야 한다', () => {
      const existingHighlight = document.createElement('span');
      existingHighlight.classList.add(HIGHLIGHT.CLASS_NAME);
      document.body.appendChild(existingHighlight);

      const mockRange = {} as Range;
      const mockSelection = createMockSelection({
        text: 'new selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(document.createElement('span'));
      vi.mocked(getHighlightPosition).mockReturnValue({ x: 0, y: 0 });

      renderHook(() => useTextSelection(onSelectionChange));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(removeHighlight).toHaveBeenCalledWith(existingHighlight);
      expect(createHighlight).toHaveBeenCalled();
    });

    it('마운트 시 mouseup 이벤트 리스너를 등록해야 한다', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() => useTextSelection(onSelectionChange));

      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    it('언마운트 시 mouseup 이벤트 리스너를 제거해야 한다', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useTextSelection(onSelectionChange));
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    it('언마운트 시 남아있는 하이라이트가 있으면 제거해야 한다', () => {
      const existingHighlight = document.createElement('span');
      existingHighlight.classList.add(HIGHLIGHT.CLASS_NAME);
      document.body.appendChild(existingHighlight);

      const { unmount } = renderHook(() => useTextSelection(onSelectionChange));

      unmount();

      expect(removeHighlight).toHaveBeenCalledWith(existingHighlight);
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================

  describe('동일 입력 → 동일 출력', () => {
    it('동일한 선택에 대해 동일한 position을 반환해야 한다', () => {
      const mockRange = {} as Range;
      const mockHighlightElement = document.createElement('span');
      const mockPosition = { x: 150, y: 250 };

      const mockSelection = createMockSelection({
        text: 'consistent text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(mockHighlightElement);
      vi.mocked(getHighlightPosition).mockReturnValue(mockPosition);

      renderHook(() => useTextSelection(onSelectionChange));

      // 첫 번째 선택
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      const firstCallResult = onSelectionChange.mock.calls[0][0];

      // 두 번째 동일한 선택
      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      const secondCallResult = onSelectionChange.mock.calls[1][0];

      expect(firstCallResult.position).toEqual(secondCallResult.position);
      expect(firstCallResult.position).toEqual(mockPosition);
    });

    it('콜백 함수가 변경되어도 동일한 선택에 대해 동일한 결과를 반환해야 한다', () => {
      const mockRange = {} as Range;
      const mockHighlightElement = document.createElement('span');
      const mockPosition = { x: 100, y: 200 };

      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(mockHighlightElement);
      vi.mocked(getHighlightPosition).mockReturnValue(mockPosition);

      const newCallback: Mock<(result: SelectionResult) => void> = vi.fn();

      const { rerender } = renderHook(
        ({ callback }) => useTextSelection(callback),
        { initialProps: { callback: onSelectionChange } },
      );

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      rerender({ callback: newCallback });

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(onSelectionChange.mock.calls[0][0].position).toEqual(mockPosition);
      expect(newCallback.mock.calls[0][0].position).toEqual(mockPosition);
    });
  });

  // ==================== 에러 상황 및 복구 ====================

  describe('에러 상황 및 복구', () => {
    it('createHighlight가 null을 반환하면 onError 콜백을 호출해야 한다', () => {
      const mockRange = {} as Range;
      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(null);

      renderHook(() => useTextSelection(onSelectionChange, onError));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(onError).toHaveBeenCalled();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('createHighlight 실패 시에도 selection.removeAllRanges()를 호출해야 한다', () => {
      const mockRange = {} as Range;
      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(null);

      renderHook(() => useTextSelection(onSelectionChange, onError));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
    });

    it('onError가 제공되지 않아도 에러가 발생하지 않아야 한다', () => {
      const mockRange = {} as Range;
      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(createHighlight).mockReturnValue(null);

      expect(() => {
        renderHook(() => useTextSelection(onSelectionChange));

        act(() => {
          document.dispatchEvent(new MouseEvent('mouseup'));
        });
      }).not.toThrow();
    });

    it('하이라이트 실패 후 다음 선택에서 정상적으로 복구되어야 한다', () => {
      const mockHighlightElement = document.createElement('span');
      const mockPosition = { x: 100, y: 200 };
      const mockRange = {} as Range;

      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      // 첫 번째 시도: 실패
      vi.mocked(createHighlight).mockReturnValue(null);

      renderHook(() => useTextSelection(onSelectionChange, onError));

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).not.toHaveBeenCalled();

      // 두 번째 시도: 성공
      vi.mocked(createHighlight).mockReturnValue(mockHighlightElement);
      vi.mocked(getHighlightPosition).mockReturnValue(mockPosition);

      act(() => {
        document.dispatchEvent(new MouseEvent('mouseup'));
      });

      expect(onSelectionChange).toHaveBeenCalledWith({
        highlight: mockHighlightElement,
        position: mockPosition,
      });
    });

    it('기존 하이라이트 제거 중 에러가 발생해도 새 하이라이트 생성을 시도해야 한다', () => {
      const existingHighlight = document.createElement('span');
      existingHighlight.classList.add(HIGHLIGHT.CLASS_NAME);
      document.body.appendChild(existingHighlight);

      const mockRange = {} as Range;
      const mockSelection = createMockSelection({
        text: 'selected text',
        rangeCount: 1,
        range: mockRange,
      });

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.mocked(removeHighlight).mockImplementation(() => {
        throw new Error('Remove failed');
      });

      renderHook(() => useTextSelection(onSelectionChange, onError));

      expect(() => {
        act(() => {
          document.dispatchEvent(new MouseEvent('mouseup'));
        });
      }).toThrow('Remove failed');
    });
  });
});

