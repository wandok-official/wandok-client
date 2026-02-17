import { createTestDOM } from '@test/helpers/test-utils';
import { renderHook } from '@testing-library/react';
import { beforeEach,describe, expect, it, vi } from 'vitest';

import { useStep2ParagraphSplitDetection } from '../useStep2ParagraphSplitDetection';

const STEP2_HTML = '<article data-guide-step="2"></article>';
const WRAPPER_CLASS = 'wandok-text-wrapper';

const addParagraphWithWrapper = (parent: Element) => {
  const p = document.createElement('p');
  const wrapper = document.createElement('span');
  wrapper.className = WRAPPER_CLASS;
  p.appendChild(wrapper);
  parent.appendChild(p);
  return p;
};

describe('useStep2ParagraphSplitDetection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('isCompleted가 true이면 observer를 설정하지 않아야 한다', () => {
    const onComplete = vi.fn();
    const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

    renderHook(() => useStep2ParagraphSplitDetection(true, onComplete));

    expect(observeSpy).not.toHaveBeenCalled();
    observeSpy.mockRestore();
  });

  it('step2 영역에 P + wrapper 추가 시 onComplete를 호출해야 한다', async () => {
    createTestDOM(STEP2_HTML);
    const onComplete = vi.fn();

    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    const article = document.querySelector('article')!;
    addParagraphWithWrapper(article);

    await vi.waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('step2 영역 밖에 P를 추가해도 무시해야 한다', async () => {
    createTestDOM(STEP2_HTML);
    createTestDOM('<div id="outside"></div>');
    const onComplete = vi.fn();

    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    const outside = document.getElementById('outside')!;
    addParagraphWithWrapper(outside);

    await new Promise((r) => setTimeout(r, 50));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('중복 감지를 방지해야 한다', async () => {
    createTestDOM(STEP2_HTML);
    const onComplete = vi.fn();

    renderHook(() => useStep2ParagraphSplitDetection(false, onComplete));

    const article = document.querySelector('article')!;
    addParagraphWithWrapper(article);
    addParagraphWithWrapper(article);

    await vi.waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
