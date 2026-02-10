import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../App';

describe('App', () => {
  let storageChangeListener: (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: chrome.storage.AreaName,
  ) => void;

  beforeEach(() => {
    vi.mocked(chrome.storage.onChanged.addListener).mockImplementation((listener) => {
      storageChangeListener = listener;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe('초기 상태', () => {
    it('OFF일 때 ProgressBar가 없어야 한다', () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: false });
        return Promise.resolve({ wandokEnabled: false });
      });

      const { container } = render(<App />);
      expect(container.firstChild).toBeNull();
    });

    it('ON일 때 ProgressBar가 있어야 한다', () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: true });
        return Promise.resolve({ wandokEnabled: true });
      });

      const { container } = render(<App />);
      expect(container.querySelector('.fixed.top-0.right-0')).not.toBeNull();
    });
  });

  describe('상태 전환', () => {
    it('ON → OFF 전환 시 ProgressBar가 사라져야 한다', () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: true });
        return Promise.resolve({ wandokEnabled: true });
      });

      const { container } = render(<App />);
      expect(container.querySelector('.fixed.top-0.right-0')).not.toBeNull();

      act(() => {
        storageChangeListener(
          { wandokEnabled: { oldValue: true, newValue: false } },
          'local',
        );
      });

      expect(container.firstChild).toBeNull();
    });

    it('OFF → ON 전환 시 ProgressBar가 나타나야 한다', () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: false });
        return Promise.resolve({ wandokEnabled: false });
      });

      const { container } = render(<App />);
      expect(container.firstChild).toBeNull();

      act(() => {
        storageChangeListener(
          { wandokEnabled: { oldValue: false, newValue: true } },
          'local',
        );
      });

      expect(container.querySelector('.fixed.top-0.right-0')).not.toBeNull();
    });
  });

  describe('엣지 케이스', () => {
    it('local이 아닌 storage 변경은 무시해야 한다', () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: true });
        return Promise.resolve({ wandokEnabled: true });
      });

      const { container } = render(<App />);
      expect(container.querySelector('.fixed.top-0.right-0')).not.toBeNull();

      act(() => {
        storageChangeListener(
          { wandokEnabled: { oldValue: true, newValue: false } },
          'sync',
        );
      });

      expect(container.querySelector('.fixed.top-0.right-0')).not.toBeNull();
    });

    it('wandokEnabled 외의 storage 변경은 무시해야 한다', () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: true });
        return Promise.resolve({ wandokEnabled: true });
      });

      const { container } = render(<App />);
      expect(container.querySelector('.fixed.top-0.right-0')).not.toBeNull();

      act(() => {
        storageChangeListener(
          { someOtherKey: { oldValue: 'a', newValue: 'b' } },
          'local',
        );
      });

      expect(container.querySelector('.fixed.top-0.right-0')).not.toBeNull();
    });

    it('컴포넌트 언마운트 시 storage 리스너를 해제해야 한다', () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: false });
        return Promise.resolve({ wandokEnabled: false });
      });

      const { unmount } = render(<App />);
      unmount();

      expect(chrome.storage.onChanged.removeListener).toHaveBeenCalled();
    });
  });
});
