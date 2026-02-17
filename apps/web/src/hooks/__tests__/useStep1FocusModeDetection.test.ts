import { createTestDOM } from '@test/helpers/test-utils';
import { renderHook } from '@testing-library/react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { useStep1FocusModeDetection } from '../useStep1FocusModeDetection';

const STEP1_HTML = '<article data-guide-step="1"></article>';
const WRAPPER_CLASS = 'wandok-text-wrapper';

const createStep1WithWrapper = () => {
  const { container } = createTestDOM(STEP1_HTML);
  const article = container.querySelector('article')!;
  const wrapper = document.createElement('span');
  wrapper.className = WRAPPER_CLASS;
  article.appendChild(wrapper);
  return { article, wrapper };
};

describe('useStep1FocusModeDetection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('isCompleted가 true이면 observer를 설정하지 않아야 한다', () => {
    const onComplete = vi.fn();
    const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

    renderHook(() => useStep1FocusModeDetection(true, onComplete));

    expect(observeSpy).not.toHaveBeenCalled();
    observeSpy.mockRestore();
  });

  it('step1 영역 내 wrapper에 mouseenter 시 onComplete를 호출해야 한다', () => {
    const { wrapper } = createStep1WithWrapper();
    const onComplete = vi.fn();

    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('step1 영역 밖 wrapper에는 리스너를 등록하지 않아야 한다', () => {
    const { container } = createTestDOM('<div></div>');
    const wrapper = document.createElement('span');
    wrapper.className = WRAPPER_CLASS;
    container.querySelector('div')!.appendChild(wrapper);

    const onComplete = vi.fn();
    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('동적으로 추가된 wrapper에도 리스너를 등록해야 한다', async () => {
    createTestDOM(STEP1_HTML);
    const onComplete = vi.fn();

    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    const article = document.querySelector('article')!;
    const dynamicWrapper = document.createElement('span');
    dynamicWrapper.className = WRAPPER_CLASS;
    article.appendChild(dynamicWrapper);

    await vi.waitFor(() => {
      dynamicWrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('onComplete가 중복 호출되지 않아야 한다', () => {
    const { wrapper } = createStep1WithWrapper();
    const onComplete = vi.fn();

    renderHook(() => useStep1FocusModeDetection(false, onComplete));

    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    wrapper.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
