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

  it('step3 요소가 존재하면 IntersectionObserver로 관찰해야 한다', () => {
    createTestDOM(STEP3_HTML);
    const onComplete = vi.fn();
    const observeSpy = vi.spyOn(IntersectionObserver.prototype, 'observe');

    renderHook(() => useStep3ScrollProgressDetection(false, onComplete));

    expect(observeSpy).toHaveBeenCalledWith(
      document.querySelector('article[data-guide-step="3"]'),
    );
    observeSpy.mockRestore();
  });

  it('step3 요소가 미존재 시 MutationObserver로 대기해야 한다', () => {
    const onComplete = vi.fn();
    const mutationObserveSpy = vi.spyOn(MutationObserver.prototype, 'observe');

    renderHook(() => useStep3ScrollProgressDetection(false, onComplete));

    expect(mutationObserveSpy).toHaveBeenCalledWith(
      document.body,
      expect.objectContaining({ childList: true, subtree: true }),
    );
    mutationObserveSpy.mockRestore();
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

  it('MO 대기 중 step3가 추가되면 IO로 전환하여 뷰포트 진입 시 onComplete를 호출해야 한다', async () => {
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

    // 1. step3 요소 없이 훅 마운트 → MO 대기 상태
    renderHook(() => useStep3ScrollProgressDetection(false, onComplete));

    // 2. step3 요소를 나중에 추가 (가이드 렌더 시뮬레이션)
    const article = document.createElement('article');
    article.dataset.guideStep = '3';
    document.body.appendChild(article);

    // 3. MO 콜백이 비동기로 실행될 때까지 대기
    await vi.waitFor(() => {
      expect(intersectionCallback!).toBeDefined();
    });

    // 4. 뷰포트 진입 시뮬레이션
    intersectionCallback!(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onComplete).toHaveBeenCalledTimes(1);

    vi.stubGlobal('IntersectionObserver', OriginalIntersectionObserver);
  });
});
