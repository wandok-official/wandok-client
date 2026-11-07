import { mockScrollProperties } from '@test/mocks/dom';
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ProgressBar } from '../ProgressBar';

const flushFrame = async () => {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 30);
    });
  });
};

const indicatorHeight = (container: HTMLElement) => {
  const indicator = container.querySelector('.bg-amber-500') as HTMLElement | null;
  return indicator?.style.height ?? null;
};

describe('ProgressBar', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('리사이즈 시 스크롤 없이도 진행률을 갱신해야 한다', async () => {
    mockScrollProperties({ scrollY: 0, scrollHeight: 2000, innerHeight: 800 });

    const { container } = render(<ProgressBar />);
    await flushFrame();

    expect(indicatorHeight(container)).toBe('0%');

    mockScrollProperties({ scrollY: 600, scrollHeight: 2000, innerHeight: 800 });

    await act(async () => {
      window.dispatchEvent(new Event('resize'));
    });
    await flushFrame();

    expect(indicatorHeight(container)).toBe('50%');
  });

  it('본문 높이가 바뀌면 스크롤 없이도 진행률을 갱신해야 한다', async () => {
    let resizeCallback: ResizeObserverCallback = () => {};

    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }

      observe = vi.fn();

      unobserve = vi.fn();

      disconnect = vi.fn();
    }

    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    mockScrollProperties({ scrollY: 600, scrollHeight: 2000, innerHeight: 800 });

    const { container } = render(<ProgressBar />);
    await flushFrame();

    expect(indicatorHeight(container)).toBe('50%');

    mockScrollProperties({ scrollY: 600, scrollHeight: 2800, innerHeight: 800 });

    await act(async () => {
      resizeCallback([], {} as ResizeObserver);
    });
    await flushFrame();

    expect(indicatorHeight(container)).toBe('30%');
  });
});
