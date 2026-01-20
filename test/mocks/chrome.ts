import { vi } from 'vitest';

/**
 * Chrome Extension API Mock
 * 테스트에서 chrome.* API를 사용할 수 있도록 mock 제공
 */
export const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn(),
    },
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn(),
    getURL: vi.fn((path: string) => `chrome-extension://mock-extension-id/${path}`),
    id: 'mock-extension-id',
  },

  action: {
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    getBadgeText: vi.fn().mockResolvedValue('OFF'),
    setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    onClicked: {
      addListener: vi.fn(),
    },
  },

  scripting: {
    insertCSS: vi.fn().mockResolvedValue(undefined),
    executeScript: vi.fn().mockResolvedValue([]),
    removeCSS: vi.fn().mockResolvedValue(undefined),
  },

  tabs: {
    query: vi.fn().mockResolvedValue([]),
    reload: vi.fn().mockResolvedValue(undefined),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue({ id: 1, url: 'https://example.com' }),
  },

  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    sync: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
  },
};

/**
 * 모든 Chrome mock 함수 리셋
 */
export const resetChromeMocks = (): void => {
  const resetObject = (obj: Record<string, unknown>): void => {
    Object.values(obj).forEach((value) => {
      if (typeof value === 'function' && 'mockReset' in value) {
        (value as ReturnType<typeof vi.fn>).mockReset();
      } else if (typeof value === 'object' && value !== null) {
        resetObject(value as Record<string, unknown>);
      }
    });
  };

  resetObject(mockChrome);

  mockChrome.action.getBadgeText.mockResolvedValue('OFF');
  mockChrome.runtime.getURL.mockImplementation(
    (path: string) => `chrome-extension://mock-extension-id/${path}`,
  );
};

/**
 * 특정 Chrome API 동작 설정 헬퍼
 */
export const setupChromeMock = {
  /**
   * 배지 텍스트 상태 설정
   */
  setBadgeState: (state: 'ON' | 'OFF'): void => {
    mockChrome.action.getBadgeText.mockResolvedValue(state);
  },

  /**
   * 탭 정보 설정
   */
  setActiveTab: (tab: { id: number; url: string }): void => {
    mockChrome.tabs.query.mockResolvedValue([tab]);
    mockChrome.tabs.get.mockResolvedValue(tab);
  },

  /**
   * 스토리지 데이터 설정
   */
  setStorageData: (data: Record<string, unknown>, type: 'local' | 'sync' = 'local'): void => {
    mockChrome.storage[type].get.mockResolvedValue(data);
  },
};
