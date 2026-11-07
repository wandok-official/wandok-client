import { createTestDOM } from '@test/helpers/test-utils';
import { renderHook } from '@testing-library/react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { useStep3ScrollProgressDetection } from '../useStep3ScrollProgressDetection';

const STEP3_HTML = '<article data-guide-step="3"></article>';

describe('useStep3ScrollProgressDetection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('isCompleted가 true이면 observer를 설정하지 않아야 한다', () => {
    const onComplete = vi.fn();
    const observeSpy = vi.spyOn(IntersectionObserver.prototype, 'observe');

    renderHook(() => useStep3ScrollProgressDetection(true, onComplete));

    expect(observeSpy).not.toHaveBeenCalled();
    observeSpy.mockRestore();
  });

  it('뷰포트에 진입하면 onComplete를 호출해야 한다', () => {
    createTestDOM(STEP3_HTML);
    const onComplete = vi.fn();

    let intersectionCallback: IntersectionObserverCallback;
    const OriginalIntersectionObserver = globalThis.IntersectionObserver;

    vi.stubGlobal(
      'IntersectionObserver',
      class MockIntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        root = null;
        rootMargin = '';
        thresholds = [0];
        takeRecords = vi.fn(() => []);
      },
    );

    renderHook(() => useStep3ScrollProgressDetection(false, onComplete));

    intersectionCallback!(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onComplete).toHaveBeenCalledTimes(1);

    vi.stubGlobal('IntersectionObserver', OriginalIntersectionObserver);
  });

  it('step3 요소가 교체되면 새 요소의 뷰포트 진입을 감지해야 한다', async () => {
    const onComplete = vi.fn();
    const observedElements: Element[] = [];
    let intersectionCallback: IntersectionObserverCallback = () => {};
    const OriginalIntersectionObserver = globalThis.IntersectionObserver;

    vi.stubGlobal(
      'IntersectionObserver',
      class MockIntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback;
        }
        observe = (element: Element) => {
          observedElements.push(element);
        };
        disconnect = vi.fn();
        unobserve = vi.fn();
        root = null;
        rootMargin = '';
        thresholds = [0];
        takeRecords = vi.fn(() => []);
      },
    );

    renderHook(() => useStep3ScrollProgressDetection(false, onComplete));

    const articleA = document.createElement('article');
    articleA.dataset.guideStep = '3';
    document.body.appendChild(articleA);

    await vi.waitFor(() => {
      expect(observedElements).toContain(articleA);
    });

    articleA.remove();
    const articleB = document.createElement('article');
    articleB.dataset.guideStep = '3';
    document.body.appendChild(articleB);

    await vi.waitFor(() => {
      expect(observedElements.at(-1)).toBe(articleB);
    });

    intersectionCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onComplete).toHaveBeenCalledTimes(1);

    vi.stubGlobal('IntersectionObserver', OriginalIntersectionObserver);
  });

  it('언마운트 후 뷰포트 진입은 완료 처리하지 않아야 한다', () => {
    createTestDOM(STEP3_HTML);
    const onComplete = vi.fn();
    let intersectionCallback: IntersectionObserverCallback = () => {};
    const OriginalIntersectionObserver = globalThis.IntersectionObserver;

    vi.stubGlobal(
      'IntersectionObserver',
      class MockIntersectionObserver {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback;
        }
        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        root = null;
        rootMargin = '';
        thresholds = [0];
        takeRecords = vi.fn(() => []);
      },
    );

    const { unmount } = renderHook(() => useStep3ScrollProgressDetection(false, onComplete));
    unmount();

    intersectionCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onComplete).not.toHaveBeenCalled();

    vi.stubGlobal('IntersectionObserver', OriginalIntersectionObserver);
  });
});
