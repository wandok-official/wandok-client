import { cleanupShadowHost,createShadowHost } from '@test/mocks/dom';
import { act,renderHook } from '@testing-library/react';
import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';

import { useExtensionState } from '../useExtensionState';

const SHADOW_HOST_ID = 'wandok-shadow-host';

describe('useExtensionState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanupShadowHost(SHADOW_HOST_ID);
  });

  it('초기 상태는 inactive여야 한다', () => {
    const { result } = renderHook(() => useExtensionState());

    expect(result.current).toBe('inactive');
  });

  it('폴링으로 익스텐션 활성화를 감지해야 한다', () => {
    const { result } = renderHook(() => useExtensionState());

    createShadowHost(SHADOW_HOST_ID);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('active');
  });

  it('wandok:activated 이벤트로 활성화를 감지해야 한다', () => {
    const { result } = renderHook(() => useExtensionState());

    act(() => {
      window.dispatchEvent(new Event('wandok:activated'));
    });

    expect(result.current).toBe('active');
  });

  it('익스텐션 비활성화 시 폴링으로 inactive로 전환해야 한다', () => {
    const { result } = renderHook(() => useExtensionState());

    createShadowHost(SHADOW_HOST_ID);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe('active');

    cleanupShadowHost(SHADOW_HOST_ID);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe('inactive');
  });

  it('wandok:deactivated 이벤트로 비활성화를 감지해야 한다', () => {
    const { result } = renderHook(() => useExtensionState());

    act(() => {
      window.dispatchEvent(new Event('wandok:activated'));
    });
    expect(result.current).toBe('active');

    act(() => {
      window.dispatchEvent(new Event('wandok:deactivated'));
    });
    expect(result.current).toBe('inactive');
  });

  it('언마운트 시 인터벌과 이벤트 리스너를 정리해야 한다', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useExtensionState());
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'wandok:activated',
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'wandok:deactivated',
      expect.any(Function),
    );

    clearIntervalSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
