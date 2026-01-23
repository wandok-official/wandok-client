import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';
import { fireEvent } from '@test/helpers/test-utils';
import { PROGRESS_BAR } from '../../config/constants';

// getScrollPercentage mock
vi.mock('../../utils/getScrollPercentage', () => ({
  getScrollPercentage: vi.fn(() => 50),
}));

// ComplexityChart mock
vi.mock('../ComplexityChart', () => ({
  ComplexityChart: ({ scrollPercent }: { scrollPercent: number }) => (
    <div data-testid="complexity-chart" data-scroll-percent={scrollPercent}>
      Chart
    </div>
  ),
}));

// useComplexityChartData mock
vi.mock('../../hooks/useComplexityChartData', () => ({
  useComplexityChartData: vi.fn(
    ({ complexityScores, scrollPercent }) => ({
      complexityScores,
      scrollPercent,
    }),
  ),
}));

describe('ProgressBar', () => {
  let rafSpy: ReturnType<typeof vi.spyOn>;
  let cancelRafSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
      (callback: FrameRequestCallback) => {
        callback(Date.now());
        return 123;
      },
    );
    cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { });
  });

  afterEach(() => {
    cleanup();
    rafSpy.mockRestore();
    cancelRafSpy.mockRestore();
    vi.clearAllMocks();
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('컴포넌트가 올바르게 렌더링되어야 한다', () => {
      const { container } = render(<ProgressBar />);
      const progressBar = container.querySelector('.fixed.top-0.right-0.h-screen');

      expect(progressBar).not.toBeNull();
    });

    it('PROGRESS_BAR.WIDTH 상수를 사용해야 한다', () => {
      const { container } = render(<ProgressBar />);
      const progressBar = container.querySelector('.fixed.top-0.right-0.h-screen') as HTMLElement;

      expect(progressBar.style.width).toBe(PROGRESS_BAR.WIDTH);
    });

    it('ComplexityChart 컴포넌트를 렌더링해야 한다', () => {
      const { getByTestId } = render(<ProgressBar />);
      const chart = getByTestId('complexity-chart');

      expect(chart).not.toBeNull();
      expect(chart.textContent).toBe('Chart');
    });

    it('스크롤 이벤트 리스너를 등록해야 한다', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(<ProgressBar />);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
        { passive: true },
      );

      addEventListenerSpy.mockRestore();
    });

    it('초기 렌더링 시 requestAnimationFrame을 호출해야 한다', () => {
      render(<ProgressBar />);

      expect(rafSpy).toHaveBeenCalled();
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('complexityScores가 제공되지 않아도 렌더링되어야 한다', () => {
      const { container } = render(<ProgressBar />);
      const progressBar = container.querySelector('.fixed.top-0.right-0.h-screen');

      expect(progressBar).not.toBeNull();
    });

    it('complexityScores가 빈 배열이어도 렌더링되어야 한다', () => {
      const { container } = render(<ProgressBar complexityScores={[]} />);
      const progressBar = container.querySelector('.fixed.top-0.right-0.h-screen');

      expect(progressBar).not.toBeNull();
    });

    it('complexityScores가 undefined여도 렌더링되어야 한다', () => {
      const { container } = render(<ProgressBar complexityScores={undefined} />);
      const progressBar = container.querySelector('.fixed.top-0.right-0.h-screen');

      expect(progressBar).not.toBeNull();
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('동일한 complexityScores로 여러 번 렌더링해도 일관되어야 한다', () => {
      const scores = [5, 8, 3, 9, 2];

      const { container: container1, unmount: unmount1 } = render(
        <ProgressBar complexityScores={scores} />,
      );
      const html1 = container1.innerHTML;

      unmount1();

      const { container: container2 } = render(
        <ProgressBar complexityScores={scores} />,
      );
      const html2 = container2.innerHTML;

      expect(html1).toBe(html2);
    });

    it('여러 ProgressBar 인스턴스가 독립적으로 동작해야 한다', () => {
      const { container } = render(
        <>
          <ProgressBar complexityScores={[5, 3, 7]} />
          <ProgressBar complexityScores={[8, 2, 9]} />
        </>,
      );

      const progressBars = container.querySelectorAll('.fixed.top-0.right-0.h-screen');

      expect(progressBars.length).toBe(2);
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('에러 상황', () => {
    it('unmount 시 스크롤 이벤트 리스너를 제거해야 한다', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<ProgressBar />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function),
      );

      removeEventListenerSpy.mockRestore();
    });

    it('unmount 시 진행 중인 RAF를 취소해야 한다', () => {
      rafSpy.mockImplementation((callback: FrameRequestCallback) => {
        // RAF를 즉시 실행하지 않고 ID만 반환
        setTimeout(() => callback(Date.now()), 100);
        return 456;
      });

      const { unmount } = render(<ProgressBar />);

      unmount();

      expect(cancelRafSpy).toHaveBeenCalledWith(456);
    });

    it('연속된 스크롤 이벤트 시 RAF가 중복 호출되지 않아야 한다', () => {
      let rafCallback: FrameRequestCallback | null = null;

      rafSpy.mockImplementation((callback: FrameRequestCallback): number => {
        rafCallback = callback;
        return 789;
      });

      render(<ProgressBar />);

      rafSpy.mockClear();

      // 첫 번째 스크롤
      fireEvent.scroll(window);
      const firstCallCount = rafSpy.mock.calls.length;

      // RAF 콜백이 실행되기 전 두 번째 스크롤
      fireEvent.scroll(window);
      const secondCallCount = rafSpy.mock.calls.length;

      // RAF가 진행 중일 때는 추가 호출이 없어야 함
      expect(secondCallCount).toBe(firstCallCount);

      // RAF 콜백 실행
      if (rafCallback) {
        (rafCallback as FrameRequestCallback)(Date.now());
      }

      // RAF 완료 후 스크롤하면 다시 호출 가능
      fireEvent.scroll(window);
      expect(rafSpy.mock.calls.length).toBeGreaterThan(secondCallCount);
    });
  });

  // ==================== 복잡한 시나리오 ====================
  describe('복잡한 시나리오', () => {
    it('getScrollPercentage가 RAF와 함께 사용되어야 한다', async () => {
      const { getScrollPercentage } = await import('../../utils/getScrollPercentage');

      render(<ProgressBar />);

      // 초기 렌더링 시 RAF와 getScrollPercentage 호출 확인
      expect(rafSpy).toHaveBeenCalled();
      expect(getScrollPercentage).toHaveBeenCalled();
    });

    it('complexityScores를 useComplexityChartData에 전달해야 한다', async () => {
      const { useComplexityChartData } = await import(
        '../../hooks/useComplexityChartData'
      );

      const scores = [3, 7, 5, 9];

      render(<ProgressBar complexityScores={scores} />);

      expect(useComplexityChartData).toHaveBeenCalledWith(
        expect.objectContaining({
          complexityScores: scores,
        }),
      );
    });

    it('ComplexityChart에 scrollPercent를 전달해야 한다', async () => {
      const { getByTestId } = render(<ProgressBar />);
      const chart = getByTestId('complexity-chart');

      // scrollPercent가 전달되는지 확인
      expect(chart.getAttribute('data-scroll-percent')).toBe('50');

      // useComplexityChartData가 scrollPercent와 함께 호출되는지 확인
      const { useComplexityChartData } = await import(
        '../../hooks/useComplexityChartData'
      );
      expect(useComplexityChartData).toHaveBeenCalledWith(
        expect.objectContaining({
          scrollPercent: expect.any(Number),
        }),
      );
    });

    it('fixed 위치와 올바른 레이아웃을 유지해야 한다', () => {
      const { container } = render(<ProgressBar />);
      const progressBar = container.querySelector('.fixed.top-0.right-0.h-screen') as HTMLElement;

      expect(progressBar.className).toContain('fixed');
      expect(progressBar.className).toContain('top-0');
      expect(progressBar.className).toContain('right-0');
      expect(progressBar.className).toContain('h-screen');
    });
  });
});
