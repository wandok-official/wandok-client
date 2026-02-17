import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type StorageChangeListener = (
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string,
) => void;

const waitForDom = () => new Promise((resolve) => setTimeout(resolve, 50));

/**
 * MutationObserver 추적을 위한 래퍼
 */
const trackedObservers: MutationObserver[] = [];
const OriginalMutationObserver = globalThis.MutationObserver;

class TrackedMutationObserver extends OriginalMutationObserver {
  constructor(callback: MutationCallback) {
    super(callback);
    trackedObservers.push(this);
  }
}

describe('Content Script 통합 테스트', () => {
  beforeEach(() => {
    vi.stubGlobal('MutationObserver', TrackedMutationObserver);
    document.body.innerHTML = `
      <article>
        <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
      </article>
    `;
  });

  afterEach(() => {
    trackedObservers.forEach((o) => o.disconnect());
    trackedObservers.length = 0;
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  const setupOnState = async (html?: string) => {
    vi.mocked(chrome.storage.local.get).mockImplementation(
      (keys, callback) => {
        if (callback) callback({ wandokEnabled: true });
        return Promise.resolve({ wandokEnabled: true });
      },
    );

    vi.resetModules();
    await act(async () => {
      if (html) {
        document.body.innerHTML = html;
      }
      await import('../content');
      await waitForDom();
    });
  };

  const triggerStorageChange = async (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    const calls = vi.mocked(chrome.storage.onChanged.addListener).mock.calls;

    await act(() => {
      calls.forEach(([listener]) => {
        (listener as StorageChangeListener)(changes, areaName);
      });
    });
  };

  const triggerOff = () =>
    triggerStorageChange(
      { wandokEnabled: { newValue: false, oldValue: true } },
      'local',
    );

  describe('초기 상태', () => {
    it('OFF일 때 shadow host가 DOM에 없어야 한다', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: false });
        return Promise.resolve({ wandokEnabled: false });
      });

      vi.resetModules();
      await act(async () => {
        await import('../content');
        await waitForDom();
      });

      expect(document.getElementById('wandok-shadow-host')).toBeNull();
    });

    it('ON일 때 shadow host가 DOM에 있어야 한다', async () => {
      await setupOnState();

      expect(document.getElementById('wandok-shadow-host')).not.toBeNull();
    });
  });

  describe('원본 DOM 비변경 검증', () => {
    it('ON 상태에서 원본 DOM에 wandok-text-wrapper가 없어야 한다', async () => {
      await setupOnState();

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
    });

    it('ON 상태에서 원본 DOM에 wandok-blur 클래스가 없어야 한다', async () => {
      await setupOnState();

      expect(document.querySelectorAll('.wandok-blur').length).toBe(0);
    });

    it('ON 상태에서 원본 DOM에 wandok-split-paragraph가 없어야 한다', async () => {
      await setupOnState();

      expect(document.querySelectorAll('.wandok-split-paragraph').length).toBe(0);
    });
  });

  describe('CustomEvent 발행', () => {
    it('ON 전환 시 wandok:activated 이벤트가 발행되어야 한다', async () => {
      const handler = vi.fn();
      window.addEventListener('wandok:activated', handler);

      await setupOnState();

      expect(handler).toHaveBeenCalled();

      window.removeEventListener('wandok:activated', handler);
    });

    it('OFF 전환 시 wandok:deactivated 이벤트가 발행되어야 한다', async () => {
      await setupOnState();
      const handler = vi.fn();
      window.addEventListener('wandok:deactivated', handler);

      await triggerOff();

      expect(handler).toHaveBeenCalled();

      window.removeEventListener('wandok:deactivated', handler);
    });
  });

  describe('ON → OFF 전환', () => {
    it('shadow host가 DOM에서 제거되어야 한다', async () => {
      await setupOnState();
      expect(document.getElementById('wandok-shadow-host')).not.toBeNull();

      await triggerOff();

      expect(document.getElementById('wandok-shadow-host')).toBeNull();
    });

    it('spacer가 모두 제거되어야 한다', async () => {
      await setupOnState();
      const spacer = document.createElement('br');
      spacer.className = 'wandok-spacer';
      document.querySelector('article p')?.appendChild(spacer);
      expect(document.querySelectorAll('.wandok-spacer').length).toBe(1);

      await triggerOff();

      expect(document.querySelectorAll('.wandok-spacer').length).toBe(0);
    });
  });

  describe('콘텐츠 필터링', () => {
    it('article 밖의 텍스트는 분석하지 않아야 한다', async () => {
      const html = `
        <nav><p>네비게이션 텍스트</p></nav>
        <article><p>본문 텍스트입니다.</p></article>
        <footer><p>푸터 텍스트</p></footer>
      `;

      await setupOnState(html);

      expect(document.getElementById('wandok-shadow-host')).not.toBeNull();
      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
    });
  });

  describe('MutationObserver', () => {
    it('동적으로 추가된 article 내 콘텐츠도 처리해야 한다', async () => {
      await setupOnState();
      const article = document.querySelector('article');
      const newParagraph = document.createElement('p');
      newParagraph.textContent = '동적으로 추가된 문장입니다.';

      await act(async () => {
        article?.appendChild(newParagraph);
        await waitForDom();
      });

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
    });
  });

  describe('storage 변경 엣지 케이스', () => {
    it('local이 아닌 storage 변경은 무시해야 한다', async () => {
      await setupOnState();

      await triggerStorageChange(
        { wandokEnabled: { newValue: false, oldValue: true } },
        'sync',
      );

      expect(document.getElementById('wandok-shadow-host')).not.toBeNull();
    });

    it('wandokEnabled 외의 storage 변경은 무시해야 한다', async () => {
      await setupOnState();

      await triggerStorageChange(
        { someOtherKey: { newValue: 'new', oldValue: 'old' } },
        'local',
      );

      expect(document.getElementById('wandok-shadow-host')).not.toBeNull();
    });
  });
});
