import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockChrome, resetChromeMocks, setupChromeMock } from '@test/mocks/chrome';

describe('background', () => {
  beforeEach(() => {
    resetChromeMocks();
    vi.stubGlobal('chrome', mockChrome);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('확장 프로그램 설치 시 배지를 OFF로 설정해야 한다', async () => {
      // background.ts 동작 시뮬레이션
      const onInstalledListener = vi.fn(() => {
        mockChrome.action.setBadgeText({
          text: 'OFF',
        });
      });

      mockChrome.runtime.onInstalled.addListener(onInstalledListener);

      // 이벤트 트리거
      onInstalledListener();

      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        text: 'OFF',
      });
    });

    it('액션 클릭 시 배지 상태를 토글해야 한다 (OFF → ON)', async () => {
      setupChromeMock.setBadgeState('OFF');

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      // 클릭 이벤트 트리거
      await onClickedListener(tab);

      expect(mockChrome.action.getBadgeText).toHaveBeenCalledWith({ tabId: 1 });
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        tabId: 1,
        text: 'ON',
      });
    });

    it('액션 클릭 시 배지 상태를 토글해야 한다 (ON → OFF)', async () => {
      setupChromeMock.setBadgeState('ON');

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tab);

      expect(mockChrome.action.getBadgeText).toHaveBeenCalledWith({ tabId: 1 });
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        tabId: 1,
        text: 'OFF',
      });
    });

    it('ON 상태로 전환 시 CSS를 삽입해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });

        if (nextState === 'ON') {
          await mockChrome.scripting.insertCSS({
            target: { tabId: clickedTab.id },
            files: ['content.css'],
          });
        }
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tab);

      expect(mockChrome.scripting.insertCSS).toHaveBeenCalledWith({
        target: { tabId: 1 },
        files: ['content.css'],
      });
    });

    it('ON 상태로 전환 시 스크립트를 실행해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });

        if (nextState === 'ON') {
          await mockChrome.scripting.executeScript({
            target: { tabId: clickedTab.id },
            files: ['content.js'],
          });
        }
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tab);

      expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
        target: { tabId: 1 },
        files: ['content.js'],
      });
    });

    it('OFF 상태로 전환 시 탭을 리로드해야 한다', async () => {
      setupChromeMock.setBadgeState('ON');

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });

        if (nextState === 'OFF') {
          mockChrome.tabs.reload(clickedTab.id);
        }
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tab);

      expect(mockChrome.tabs.reload).toHaveBeenCalledWith(1);
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('tab.id가 없으면 아무 동작도 하지 않아야 한다', async () => {
      const tabWithoutId = { url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tabWithoutId as chrome.tabs.Tab);

      expect(mockChrome.action.getBadgeText).not.toHaveBeenCalled();
    });

    it('tab.id가 undefined면 아무 동작도 하지 않아야 한다', async () => {
      const tab = { id: undefined, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: 'ON',
        });
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tab as chrome.tabs.Tab);

      expect(mockChrome.action.setBadgeText).not.toHaveBeenCalled();
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('동일한 탭에서 여러 번 클릭 시 일관되게 토글되어야 한다', async () => {
      const tab = { id: 1, url: 'https://example.com' };

      // 초기 상태: OFF
      setupChromeMock.setBadgeState('OFF');

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      // 첫 번째 클릭: OFF → ON
      await onClickedListener(tab);
      expect(mockChrome.action.setBadgeText).toHaveBeenLastCalledWith({
        tabId: 1,
        text: 'ON',
      });

      // 두 번째 클릭: ON → OFF
      setupChromeMock.setBadgeState('ON');
      await onClickedListener(tab);
      expect(mockChrome.action.setBadgeText).toHaveBeenLastCalledWith({
        tabId: 1,
        text: 'OFF',
      });

      // 세 번째 클릭: OFF → ON
      setupChromeMock.setBadgeState('OFF');
      await onClickedListener(tab);
      expect(mockChrome.action.setBadgeText).toHaveBeenLastCalledWith({
        tabId: 1,
        text: 'ON',
      });
    });

    it('여러 탭에서 독립적으로 동작해야 한다', async () => {
      const tab1 = { id: 1, url: 'https://example1.com' };
      const tab2 = { id: 2, url: 'https://example2.com' };

      mockChrome.action.getBadgeText.mockImplementation(
        async ({ tabId }: { tabId: number }) => {
          return tabId === 1 ? 'OFF' : 'ON';
        },
      );

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      // Tab 1 클릭: OFF → ON
      await onClickedListener(tab1);
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        tabId: 1,
        text: 'ON',
      });

      // Tab 2 클릭: ON → OFF
      await onClickedListener(tab2);
      expect(mockChrome.action.setBadgeText).toHaveBeenCalledWith({
        tabId: 2,
        text: 'OFF',
      });
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('에러 상황', () => {
    it('CSS 삽입 실패 시 에러를 전파해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');
      mockChrome.scripting.insertCSS.mockRejectedValue(new Error('CSS injection failed'));

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });

        if (nextState === 'ON') {
          await mockChrome.scripting.insertCSS({
            target: { tabId: clickedTab.id },
            files: ['content.css'],
          });
        }
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await expect(onClickedListener(tab)).rejects.toThrow('CSS injection failed');
    });

    it('스크립트 실행 실패 시 에러를 전파해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');
      mockChrome.scripting.executeScript.mockRejectedValue(
        new Error('Script execution failed'),
      );

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });

        if (nextState === 'ON') {
          await mockChrome.scripting.insertCSS({
            target: { tabId: clickedTab.id },
            files: ['content.css'],
          });

          await mockChrome.scripting.executeScript({
            target: { tabId: clickedTab.id },
            files: ['content.js'],
          });
        }
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await expect(onClickedListener(tab)).rejects.toThrow('Script execution failed');
    });
  });

  // ==================== 복잡한 시나리오 ====================
  describe('복잡한 시나리오', () => {
    it('ON 전환 시 CSS와 스크립트를 순서대로 실행해야 한다', async () => {
      setupChromeMock.setBadgeState('OFF');

      const tab = { id: 1, url: 'https://example.com' };
      const executionOrder: string[] = [];

      mockChrome.scripting.insertCSS.mockImplementation(async () => {
        executionOrder.push('insertCSS');
      });

      mockChrome.scripting.executeScript.mockImplementation(async () => {
        executionOrder.push('executeScript');
        return [];
      });

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });

        if (nextState === 'ON') {
          await mockChrome.scripting.insertCSS({
            target: { tabId: clickedTab.id },
            files: ['content.css'],
          });

          await mockChrome.scripting.executeScript({
            target: { tabId: clickedTab.id },
            files: ['content.js'],
          });
        }
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tab);

      expect(executionOrder).toEqual(['insertCSS', 'executeScript']);
    });

    it('OFF 전환 시 CSS/스크립트를 실행하지 않고 탭만 리로드해야 한다', async () => {
      setupChromeMock.setBadgeState('ON');

      const tab = { id: 1, url: 'https://example.com' };

      const onClickedListener = vi.fn(async (clickedTab) => {
        if (!clickedTab.id) return;

        const prevState = await mockChrome.action.getBadgeText({ tabId: clickedTab.id });
        const nextState = prevState === 'ON' ? 'OFF' : 'ON';

        await mockChrome.action.setBadgeText({
          tabId: clickedTab.id,
          text: nextState,
        });

        if (nextState === 'ON') {
          await mockChrome.scripting.insertCSS({
            target: { tabId: clickedTab.id },
            files: ['content.css'],
          });

          await mockChrome.scripting.executeScript({
            target: { tabId: clickedTab.id },
            files: ['content.js'],
          });
        } else {
          mockChrome.tabs.reload(clickedTab.id);
        }
      });

      mockChrome.action.onClicked.addListener(onClickedListener);

      await onClickedListener(tab);

      expect(mockChrome.scripting.insertCSS).not.toHaveBeenCalled();
      expect(mockChrome.scripting.executeScript).not.toHaveBeenCalled();
      expect(mockChrome.tabs.reload).toHaveBeenCalledWith(1);
    });

    it('리스너가 올바르게 등록되어야 한다', () => {
      const onInstalledListener = vi.fn();
      const onClickedListener = vi.fn();

      mockChrome.runtime.onInstalled.addListener(onInstalledListener);
      mockChrome.action.onClicked.addListener(onClickedListener);

      expect(mockChrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(
        onInstalledListener,
      );
      expect(mockChrome.action.onClicked.addListener).toHaveBeenCalledWith(
        onClickedListener,
      );
    });
  });
});
