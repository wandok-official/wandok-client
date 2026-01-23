import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('메시지가 렌더링되어야 한다', () => {
      const { container } = render(
        <Toast message="테스트 메시지" onClose={mockOnClose} />,
      );

      expect(container.textContent).toContain('테스트 메시지');
    });

    it('기본 duration(3000ms) 후 onClose가 호출되어야 한다', () => {
      render(<Toast message="테스트" onClose={mockOnClose} />);

      expect(mockOnClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(3000);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('커스텀 duration이 적용되어야 한다', () => {
      render(
        <Toast message="테스트" onClose={mockOnClose} duration={1000} />,
      );

      vi.advanceTimersByTime(999);
      expect(mockOnClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('고정 위치(fixed)로 렌더링되어야 한다', () => {
      const { container } = render(
        <Toast message="테스트" onClose={mockOnClose} />,
      );
      const toastElement = container.firstChild as HTMLElement;

      expect(toastElement.className).toContain('fixed');
      expect(toastElement.className).toContain('bottom-5');
      expect(toastElement.className).toContain('left-1/2');
      expect(toastElement.className).toContain('-translate-x-1/2');
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('빈 문자열 메시지도 렌더링되어야 한다', () => {
      const { container } = render(<Toast message="" onClose={mockOnClose} />);

      expect(container.firstChild).not.toBeNull();
    });

    it('duration이 0이면 즉시 onClose가 호출되어야 한다', () => {
      render(<Toast message="테스트" onClose={mockOnClose} duration={0} />);

      vi.advanceTimersByTime(0);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('매우 긴 메시지도 렌더링되어야 한다', () => {
      const longMessage = 'A'.repeat(500);
      const { container } = render(
        <Toast message={longMessage} onClose={mockOnClose} />,
      );

      expect(container.textContent).toContain(longMessage);
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('동일한 props로 여러 번 렌더링해도 같은 결과를 반환해야 한다', () => {
      const { container: container1, unmount: unmount1 } = render(
        <Toast message="동일 메시지" onClose={mockOnClose} duration={2000} />,
      );
      const html1 = container1.innerHTML;

      unmount1();

      const { container: container2 } = render(
        <Toast message="동일 메시지" onClose={mockOnClose} duration={2000} />,
      );
      const html2 = container2.innerHTML;

      expect(html1).toBe(html2);
    });

    it('여러 Toast 인스턴스가 독립적으로 타이머를 관리해야 한다', () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();
      const onClose3 = vi.fn();

      render(<Toast message="Toast 1" onClose={onClose1} duration={1000} />);
      render(<Toast message="Toast 2" onClose={onClose2} duration={2000} />);
      render(<Toast message="Toast 3" onClose={onClose3} duration={3000} />);

      vi.advanceTimersByTime(1000);
      expect(onClose1).toHaveBeenCalledTimes(1);
      expect(onClose2).not.toHaveBeenCalled();
      expect(onClose3).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(onClose2).toHaveBeenCalledTimes(1);
      expect(onClose3).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(onClose3).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('에러 상황', () => {
    it('컴포넌트 unmount 시 타이머가 정리되어야 한다', () => {
      const { unmount } = render(
        <Toast message="테스트" onClose={mockOnClose} />,
      );

      unmount();
      vi.advanceTimersByTime(3000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('duration 변경 시 새로운 타이머가 설정되어야 한다', () => {
      const { rerender } = render(
        <Toast message="테스트" onClose={mockOnClose} duration={1000} />,
      );

      vi.advanceTimersByTime(500);

      // duration 변경
      rerender(
        <Toast message="테스트" onClose={mockOnClose} duration={2000} />,
      );

      // 기존 타이머는 취소되고 새 타이머 시작
      vi.advanceTimersByTime(500);
      expect(mockOnClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1500);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('onClose 변경 시 새로운 콜백이 사용되어야 한다', () => {
      const newOnClose = vi.fn();

      const { rerender } = render(
        <Toast message="테스트" onClose={mockOnClose} duration={1000} />,
      );

      rerender(
        <Toast message="테스트" onClose={newOnClose} duration={1000} />,
      );

      vi.advanceTimersByTime(1000);

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(newOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== 복잡한 시나리오 ====================
  describe('복잡한 시나리오', () => {
    it('스타일 속성이 올바르게 적용되어야 한다', () => {
      const { container } = render(
        <Toast message="테스트" onClose={mockOnClose} />,
      );
      const toastElement = container.firstChild as HTMLElement;

      expect(toastElement.className).toContain('bg-gray-800');
      expect(toastElement.className).toContain('text-white');
      expect(toastElement.className).toContain('px-4');
      expect(toastElement.className).toContain('py-3');
      expect(toastElement.className).toContain('rounded-lg');
      expect(toastElement.className).toContain('shadow-lg');
      expect(toastElement.className).toContain('animate-fade-in');
      expect(toastElement.className).toContain('z-max');
    });

    it('메시지가 p 태그 내부에 렌더링되어야 한다', () => {
      const { container } = render(
        <Toast message="테스트 메시지" onClose={mockOnClose} />,
      );
      const paragraph = container.querySelector('p');

      expect(paragraph).not.toBeNull();
      expect(paragraph?.textContent).toBe('테스트 메시지');
      expect(paragraph?.className).toContain('text-sm');
    });

    it('특수 문자가 포함된 메시지도 올바르게 렌더링되어야 한다', () => {
      const specialMessage = '<script>alert("XSS")</script>';
      const { container } = render(
        <Toast message={specialMessage} onClose={mockOnClose} />,
      );

      // React는 자동으로 이스케이프 처리
      expect(container.textContent).toBe(specialMessage);
      expect(container.querySelector('script')).toBeNull();
    });

    it('짧은 duration과 긴 duration이 모두 올바르게 동작해야 한다', () => {
      const shortOnClose = vi.fn();
      const longOnClose = vi.fn();

      const { unmount: unmount1 } = render(
        <Toast message="짧은" onClose={shortOnClose} duration={100} />,
      );
      vi.advanceTimersByTime(100);
      expect(shortOnClose).toHaveBeenCalledTimes(1);
      unmount1();

      const { unmount: unmount2 } = render(
        <Toast message="긴" onClose={longOnClose} duration={10000} />,
      );
      vi.advanceTimersByTime(9999);
      expect(longOnClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(longOnClose).toHaveBeenCalledTimes(1);
      unmount2();
    });

    it('중앙 정렬을 위한 transform이 적용되어야 한다', () => {
      const { container } = render(
        <Toast message="테스트" onClose={mockOnClose} />,
      );
      const toastElement = container.firstChild as HTMLElement;

      expect(toastElement.className).toContain('-translate-x-1/2');
    });
  });
});
