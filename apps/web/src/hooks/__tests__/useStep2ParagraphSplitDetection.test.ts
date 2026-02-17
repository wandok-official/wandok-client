import { createTestDOM } from '@test/helpers/test-utils';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useStep2ParagraphSplitDetection } from '../useStep2ParagraphSplitDetection';

const STEP2_HTML = '<article data-guide-step="2"><p>텍스트</p></article>';

describe('useStep2ParagraphSplitDetection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('isCompleted가 true이면 이벤트 리스너를 등록하지 않아야 한다', () => {
    createTestDOM(STEP2_HTML);
    const addSpy = vi.spyOn(window, 'addEventListener');
    const onComplete = vi.fn();

    renderHook(() => useStep2ParagraphSplitDetection(true, onComplete));

    const wandokCalls = addSpy.mock.calls.filter(([type]) => type === 'wandok:paragraph-split');
    expect(wandokCalls).toHaveLength(0);

    addSpy.mockRestore();
  });

  it('step2 요소가 DOM에 없으면 에러 없이 동작해야 한다', () => {
    const onComplete = vi.fn();

    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    window.dispatchEvent(new CustomEvent('wandok:paragraph-split'));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('step2 영역 내에서 wandok:paragraph-split 수신 시 onComplete를 호출해야 한다', () => {
    createTestDOM(STEP2_HTML);
    const onComplete = vi.fn();
    const step2Article = document.querySelector('article')!;
    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    step2Article.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    window.dispatchEvent(new CustomEvent('wandok:paragraph-split'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('step2 영역 밖에서 wandok:paragraph-split이 발생해도 무시해야 한다', () => {
    createTestDOM(STEP2_HTML);
    const onComplete = vi.fn();
    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    window.dispatchEvent(new CustomEvent('wandok:paragraph-split'));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('step2 영역에 진입 후 이탈하면 무시해야 한다', () => {
    createTestDOM(STEP2_HTML);
    const onComplete = vi.fn();
    const step2Article = document.querySelector('article')!;
    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    step2Article.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    step2Article.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    window.dispatchEvent(new CustomEvent('wandok:paragraph-split'));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('onComplete가 중복 호출되지 않아야 한다', () => {
    createTestDOM(STEP2_HTML);
    const onComplete = vi.fn();
    const step2Article = document.querySelector('article')!;
    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    step2Article.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    window.dispatchEvent(new CustomEvent('wandok:paragraph-split'));
    window.dispatchEvent(new CustomEvent('wandok:paragraph-split'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
