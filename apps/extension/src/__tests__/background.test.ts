import { mockChrome, resetChromeMocks, setupChromeMock } from '@test/mocks/chrome';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('background', () => {
  beforeEach(() => {
    vi.resetModules();
    resetChromeMocks();

    mockChrome.action.setBadgeText.mockResolvedValue(undefined);
    mockChrome.storage.local.set.mockResolvedValue(undefined);

    (mockChrome.tabs as unknown as Record<string, unknown>).create =
      vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('chrome', mockChrome);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const importAndGetOnInstalledListener = async () => {
    await import('../background');
    const calls = mockChrome.runtime.onInstalled.addListener.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    return calls[0][0] as (details: { reason: string }) => void;
  };

  const importAndGetOnClickedListener = async () => {
    await import('../background');
    const calls = mockChrome.action.onClicked.addListener.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    return calls[0][0] as (tab: { id?: number; url?: string }) => Promise<void>;
  };

  const importAndGetOnUpdatedListener = async () => {
    await import('../background');
    const calls = mockChrome.tabs.onUpdated.addListener.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    return calls[0][0] as (
      tabId: number,
      changeInfo: { status?: string },
    ) => Promise<void>;
  };

  // ==================== 정상 케이스 ====================
  describe('정상 케이스', () => {
    it('설치 시 배지를 OFF로 설정해야 한다', async () => {
      const listener = await importAndGetOnInstalledListener();

      listener({ reason: 'install' });

      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ text: 'OFF' });
    });

    it('설치 시 storage에 wandokEnabled: false를 저장해야 한다', async () => {
      const listener = await importAndGetOnInstalledListener();

      listener({ reason: 'install' });

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ wandokEnabled: false });
    });

    it('install reason일 때 랜딩 페이지를 열어야 한다', async () => {
      const listener = await importAndGetOnInstalledListener();

      listener({ reason: 'install' });

      const tabsCreate =
        (mockChrome.tabs as unknown as Record<string, unknown>).create as ReturnType<typeof vi.fn>;

      expect(tabsCreate).toHaveBeenCalledWith({ url: 'https://www.wandok.site/' });
    });

    it('install이 아닌 reason(update)일 때 랜딩 페이지를 열지 않아야 한다', async () => {
      const listener = await importAndGetOnInstalledListener();

      listener({ reason: 'update' });

      const tabsCreate =
        (mockChrome.tabs as unknown as Record<string, unknown>).create as ReturnType<typeof vi.fn>;

      expect(tabsCreate).not.toHaveBeenCalled();
    });

    it('액션 클릭 시 OFF → ON으로 토글해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');
      const listener = await importAndGetOnClickedListener();

      await listener({ id: 1, url: 'https://example.com' });

      expect(mockChrome.action.getBadgeText).toHaveBeenCalledWith({ tabId: 1 });
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'ON' });
    });

    it('액션 클릭 시 ON → OFF로 토글해야 한다', async () => {
      setupChromeMock.setBadgeState('ON');
      const listener = await importAndGetOnClickedListener();

      await listener({ id: 1, url: 'https://example.com' });

      expect(mockChrome.action.getBadgeText).toHaveBeenCalledWith({ tabId: 1 });
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'OFF' });
    });

    it('클릭 시 storage에 wandokEnabled 상태를 저장해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');
      const listener = await importAndGetOnClickedListener();

      await listener({ id: 1, url: 'https://example.com' });

      expect(mockChrome.storage.local.set).toHaveBeenCalledWith({ wandokEnabled: true });
    });
  });

  // ==================== 탭 새로고침 시 badge 동기화 ====================
  describe('탭 새로고침 시 badge 동기화', () => {
    it('탭 로딩 완료 시 storage가 true이면 badge를 ON으로 설정해야 한다', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ wandokEnabled: true });
      const listener = await importAndGetOnUpdatedListener();

      await listener(1, { status: 'complete' });

      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'ON' });
    });

    it('탭 로딩 완료 시 storage가 false이면 badge를 OFF로 설정해야 한다', async () => {
      mockChrome.storage.local.get.mockResolvedValue({ wandokEnabled: false });
      const listener = await importAndGetOnUpdatedListener();

      await listener(1, { status: 'complete' });

      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({ tabId: 1, text: 'OFF' });
    });

    it('status가 complete가 아니면 badge를 변경하지 않아야 한다', async () => {
      const listener = await importAndGetOnUpdatedListener();

      await listener(1, { status: 'loading' });

      expect(mockChrome.storage.local.get).not.toHaveBeenCalled();
      expect(mockChrome.action.setBadgeText).not.toHaveBeenCalled();
    });
  });

  // ==================== 빈 값 처리 ====================
  describe('빈 값 처리', () => {
    it('tab.id가 없으면 아무 동작도 하지 않아야 한다', async () => {
      const listener = await importAndGetOnClickedListener();

      await listener({ url: 'https://example.com' });

      expect(mockChrome.action.getBadgeText).not.toHaveBeenCalled();
      expect(mockChrome.action.setBadgeText).not.toHaveBeenCalled();
      expect(mockChrome.storage.local.set).not.toHaveBeenCalled();
    });
  });

  // ==================== 에러 상황 ====================
  describe('에러 상황', () => {
    it('setBadgeText 실패 시 에러를 전파해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');
      mockChrome.action.setBadgeText.mockRejectedValue(new Error('setBadgeText failed'));

      const listener = await importAndGetOnClickedListener();

      await expect(listener({ id: 1, url: 'https://example.com' })).rejects.toThrow(
        'setBadgeText failed',
      );
    });
  });
});
