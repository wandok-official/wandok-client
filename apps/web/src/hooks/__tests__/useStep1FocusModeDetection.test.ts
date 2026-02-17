import { createTestDOM } from '@test/helpers/test-utils';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useStep1FocusModeDetection } from '../useStep1FocusModeDetection';

const STEP1_HTML = '<article data-guide-step="1"><p>텍스트</p></article>';

describe('useStep1FocusModeDetection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('isCompleted가 true이면 이벤트 리스너를 등록하지 않아야 한다', () => {
    createTestDOM(STEP1_HTML);
    const addSpy = vi.spyOn(window, 'addEventListener');
    const onComplete = vi.fn();

    renderHook(() => useStep1FocusModeDetection(true, onComplete));

    const wandokCalls = addSpy.mock.calls.filter(([type]) => type === 'wandok:focus-hover');
    expect(wandokCalls).toHaveLength(0);

    addSpy.mockRestore();
  });

  it('step1 요소가 DOM에 없으면 에러 없이 동작해야 한다', () => {
    const onComplete = vi.fn();

    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    window.dispatchEvent(new CustomEvent('wandok:focus-hover'));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('step1 영역 내에서 wandok:focus-hover 수신 시 onComplete를 호출해야 한다', () => {
    createTestDOM(STEP1_HTML);
    const onComplete = vi.fn();
    const step1Article = document.querySelector('article')!;
    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    step1Article.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    window.dispatchEvent(new CustomEvent('wandok:focus-hover'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('step1 영역 밖에서 wandok:focus-hover가 발생해도 무시해야 한다', () => {
    createTestDOM(STEP1_HTML);
    const onComplete = vi.fn();
    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    window.dispatchEvent(new CustomEvent('wandok:focus-hover'));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('step1 영역에 진입 후 이탈하면 무시해야 한다', () => {
    createTestDOM(STEP1_HTML);
    const onComplete = vi.fn();
    const step1Article = document.querySelector('article')!;
    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    step1Article.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    step1Article.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    window.dispatchEvent(new CustomEvent('wandok:focus-hover'));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('onComplete가 중복 호출되지 않아야 한다', () => {
    createTestDOM(STEP1_HTML);
    const onComplete = vi.fn();
    const step1Article = document.querySelector('article')!;
    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    step1Article.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    window.dispatchEvent(new CustomEvent('wandok:focus-hover'));
    window.dispatchEvent(new CustomEvent('wandok:focus-hover'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
