import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { App } from '../App';
import { mockScrollProperties, createMockSelection } from '@test/mocks/dom';
import { fireEvent as customFireEvent, createTestDOM } from '@test/helpers/test-utils';
import { HIGHLIGHT } from '../../config/constants';

describe('App (통합 테스트)', () => {
  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      rafCallback = callback;
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    mockScrollProperties({ scrollY: 0, scrollHeight: 2000, innerHeight: 800 });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    rafCallback = null;

    document.querySelectorAll(`.${HIGHLIGHT.CLASS_NAME}`).forEach((el) => el.remove());
  });

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('App 컴포넌트가 올바르게 렌더링되어야 한다', () => {
      render(<App />);

      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('ProgressBar가 렌더링되어야 한다', () => {
      render(<App />);

      const progressBarContainer = document.querySelector('.fixed.top-0.right-0.h-screen');
      expect(progressBarContainer).toBeInTheDocument();
    });

    it('초기 상태에서 Toast가 렌더링되지 않아야 한다', () => {
      render(<App />);

      expect(screen.queryByText('동일한 종류의 텍스트만 하이라이트 가능합니다')).not.toBeInTheDocument();
    });

    it('초기 상태에서 NotePopover가 렌더링되지 않아야 한다', () => {
      render(<App />);

      expect(screen.queryByRole('button', { name: '작성' })).not.toBeInTheDocument();
    });
  });

  // ==================== 텍스트 선택 및 하이라이트 ====================

  describe('텍스트 선택 및 하이라이트', () => {
    it('텍스트 선택 시 하이라이트가 적용되고 NotePopover가 표시되어야 한다', async () => {
      const { container, cleanup } = createTestDOM('<p id="test-text">테스트 텍스트입니다</p>');
      const textElement = container.querySelector('#test-text') as HTMLElement;
      const textNode = textElement.firstChild as Text;

      render(<App />);

      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const mockSelection = {
        toString: () => '테스트 텍',
        rangeCount: 1,
        getRangeAt: () => range,
        removeAllRanges: vi.fn(),
        isCollapsed: false,
      } as unknown as Selection;

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.getByRole('button', { name: '작성' })).toBeInTheDocument();

      const highlightElement = document.querySelector(`.${HIGHLIGHT.CLASS_NAME}`);
      expect(highlightElement).toBeInTheDocument();

      cleanup();
    });

    it('빈 텍스트 선택 시 하이라이트가 적용되지 않아야 한다', async () => {
      render(<App />);

      const mockSelection = createMockSelection({ text: '', rangeCount: 0 });
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.queryByRole('button', { name: '작성' })).not.toBeInTheDocument();
    });

    it('공백만 있는 텍스트 선택 시 하이라이트가 적용되지 않아야 한다', async () => {
      render(<App />);

      const mockSelection = createMockSelection({ text: '   ', rangeCount: 1 });
      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.queryByRole('button', { name: '작성' })).not.toBeInTheDocument();
    });
  });

  // ==================== 하이라이트 실패 및 Toast ====================

  describe('하이라이트 실패 및 Toast', () => {
    it('하이라이트 실패 시 Toast가 표시되어야 한다', async () => {
      // 여러 노드에 걸친 선택을 시뮬레이션 (surroundContents 실패 케이스)
      const { container, cleanup } = createTestDOM(
        '<p id="test"><span>첫 번째</span><span>두 번째</span></p>',
      );
      const firstSpan = container.querySelector('span') as HTMLElement;
      const lastSpan = container.querySelectorAll('span')[1] as HTMLElement;

      render(<App />);

      const range = document.createRange();
      range.setStart(firstSpan.firstChild as Text, 2);
      range.setEnd(lastSpan.firstChild as Text, 2);

      const mockSelection = {
        toString: () => '번째두 번',
        rangeCount: 1,
        getRangeAt: () => range,
        removeAllRanges: vi.fn(),
        isCollapsed: false,
      } as unknown as Selection;

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.spyOn(console, 'warn').mockImplementation(() => { });

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.getByText('동일한 종류의 텍스트만 하이라이트 가능합니다')).toBeInTheDocument();

      cleanup();
    });

    it('Toast는 3초 후 자동으로 사라져야 한다', async () => {
      const { container, cleanup } = createTestDOM(
        '<p id="test"><span>첫 번째</span><span>두 번째</span></p>',
      );
      const firstSpan = container.querySelector('span') as HTMLElement;
      const lastSpan = container.querySelectorAll('span')[1] as HTMLElement;

      render(<App />);

      const range = document.createRange();
      range.setStart(firstSpan.firstChild as Text, 2);
      range.setEnd(lastSpan.firstChild as Text, 2);

      const mockSelection = {
        toString: () => '번째두 번',
        rangeCount: 1,
        getRangeAt: () => range,
        removeAllRanges: vi.fn(),
        isCollapsed: false,
      } as unknown as Selection;

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);
      vi.spyOn(console, 'warn').mockImplementation(() => { });

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.getByText('동일한 종류의 텍스트만 하이라이트 가능합니다')).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(screen.queryByText('동일한 종류의 텍스트만 하이라이트 가능합니다')).not.toBeInTheDocument();

      cleanup();
    });
  });

  // ==================== 스크롤 및 ProgressBar ====================

  describe('스크롤 및 ProgressBar', () => {
    it('스크롤 시 ProgressBar가 업데이트되어야 한다', async () => {
      render(<App />);

      if (rafCallback) {
        await act(async () => {
          rafCallback!(0);
        });
      }

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();

      mockScrollProperties({ scrollY: 600, scrollHeight: 2000, innerHeight: 800 });

      await act(async () => {
        customFireEvent.scroll(window);
      });

      if (rafCallback) {
        await act(async () => {
          rafCallback!(0);
        });
      }

      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  // ==================== Props 전달 검증 ====================

  describe('Props 전달 검증', () => {
    it('complexityScores가 전달되면 ProgressBar에 반영되어야 한다', () => {
      const mockScores = [5, 8, 3, 7, 2];

      render(<App complexityScores={mockScores} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('complexityScores가 빈 배열이어도 정상 렌더링되어야 한다', () => {
      render(<App complexityScores={[]} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('props 없이 렌더링해도 에러가 발생하지 않아야 한다', () => {
      expect(() => render(<App />)).not.toThrow();
    });
  });

  // ==================== 컴포넌트 상호작용 ====================

  describe('컴포넌트 상호작용', () => {
    it('하이라이트 후 NotePopover 닫기 버튼 클릭 시 하이라이트가 제거되어야 한다', async () => {
      const { container, cleanup } = createTestDOM('<p id="test-text">테스트 텍스트입니다</p>');
      const textElement = container.querySelector('#test-text') as HTMLElement;
      const textNode = textElement.firstChild as Text;

      render(<App />);

      const range = document.createRange();
      range.setStart(textNode, 0);
      range.setEnd(textNode, 5);

      const mockSelection = {
        toString: () => '테스트 텍',
        rangeCount: 1,
        getRangeAt: () => range,
        removeAllRanges: vi.fn(),
        isCollapsed: false,
      } as unknown as Selection;

      vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection);

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.getByRole('button', { name: '작성' })).toBeInTheDocument();
      expect(document.querySelector(`.${HIGHLIGHT.CLASS_NAME}`)).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: '' });
      await act(async () => {
        closeButton.click();
      });

      expect(screen.queryByRole('button', { name: '작성' })).not.toBeInTheDocument();
      expect(document.querySelector(`.${HIGHLIGHT.CLASS_NAME}`)).not.toBeInTheDocument();

      cleanup();
    });

    it('Toast와 NotePopover가 동시에 표시될 수 있어야 한다', async () => {
      const { container: container1, cleanup: cleanup1 } = createTestDOM(
        '<p id="test1"><span>첫 번째</span><span>두 번째</span></p>',
      );
      const firstSpan = container1.querySelector('span') as HTMLElement;
      const lastSpan = container1.querySelectorAll('span')[1] as HTMLElement;

      render(<App />);

      const failRange = document.createRange();
      failRange.setStart(firstSpan.firstChild as Text, 2);
      failRange.setEnd(lastSpan.firstChild as Text, 2);

      const failSelection = {
        toString: () => '번째두 번',
        rangeCount: 1,
        getRangeAt: () => failRange,
        removeAllRanges: vi.fn(),
        isCollapsed: false,
      } as unknown as Selection;

      vi.spyOn(window, 'getSelection').mockReturnValue(failSelection);
      vi.spyOn(console, 'warn').mockImplementation(() => { });

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.getByText('동일한 종류의 텍스트만 하이라이트 가능합니다')).toBeInTheDocument();

      const { container: container2, cleanup: cleanup2 } = createTestDOM(
        '<p id="test2">성공 텍스트</p>',
      );
      const successText = container2.querySelector('#test2') as HTMLElement;
      const successTextNode = successText.firstChild as Text;

      const successRange = document.createRange();
      successRange.setStart(successTextNode, 0);
      successRange.setEnd(successTextNode, 2);

      const successSelection = {
        toString: () => '성공',
        rangeCount: 1,
        getRangeAt: () => successRange,
        removeAllRanges: vi.fn(),
        isCollapsed: false,
      } as unknown as Selection;

      vi.spyOn(window, 'getSelection').mockReturnValue(successSelection);

      await act(async () => {
        customFireEvent.mouseUp(document);
      });

      expect(screen.getByRole('button', { name: '작성' })).toBeInTheDocument();
      expect(screen.getByText('동일한 종류의 텍스트만 하이라이트 가능합니다')).toBeInTheDocument();

      cleanup1();
      cleanup2();
    });
  });
});
