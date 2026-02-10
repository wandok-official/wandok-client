import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useGuideProgress } from '../useGuideProgress';

vi.mock('../useStep1FocusModeDetection', () => ({
  useStep1FocusModeDetection: vi.fn(),
}));

vi.mock('../useStep2ParagraphSplitDetection', () => ({
  useStep2ParagraphSplitDetection: vi.fn(),
}));

vi.mock('../useStep3ScrollProgressDetection', () => ({
  useStep3ScrollProgressDetection: vi.fn(),
}));

import { act } from '@testing-library/react';

import { useStep1FocusModeDetection } from '../useStep1FocusModeDetection';
import { useStep2ParagraphSplitDetection } from '../useStep2ParagraphSplitDetection';
import { useStep3ScrollProgressDetection } from '../useStep3ScrollProgressDetection';

describe('useGuideProgress', () => {
  it('초기 상태는 모든 step이 false이고, completedCount 0, isGuideComplete false여야 한다', () => {
    const { result } = renderHook(() => useGuideProgress());

    expect(result.current.stepStatus).toEqual({ step1: false, step2: false, step3: false });
    expect(result.current.completedCount).toBe(0);
    expect(result.current.isGuideComplete).toBe(false);
  });

  it('step 완료 콜백 호출 시 해당 step의 상태가 업데이트되어야 한다', () => {
    const mockStep1 = vi.mocked(useStep1FocusModeDetection);

    const { result } = renderHook(() => useGuideProgress());

    const onComplete = mockStep1.mock.calls[0][1];
    act(() => {
      onComplete();
    });

    expect(result.current.stepStatus.step1).toBe(true);
    expect(result.current.completedCount).toBe(1);
  });

  it('3개 step 모두 완료 시 isGuideComplete가 true여야 한다', () => {
    const mockStep1 = vi.mocked(useStep1FocusModeDetection);
    const mockStep2 = vi.mocked(useStep2ParagraphSplitDetection);
    const mockStep3 = vi.mocked(useStep3ScrollProgressDetection);

    const { result } = renderHook(() => useGuideProgress());

    act(() => {
      mockStep1.mock.calls[0][1]();
      mockStep2.mock.calls[0][1]();
      mockStep3.mock.calls[0][1]();
    });

    expect(result.current.completedCount).toBe(3);
    expect(result.current.isGuideComplete).toBe(true);
  });
});
