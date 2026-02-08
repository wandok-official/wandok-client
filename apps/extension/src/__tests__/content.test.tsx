import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { splitParagraph } from '../utils/splitParagraph';

const waitForDom = () => new Promise((resolve) => setTimeout(resolve, 50));

/**
 * MutationObserver 추적을 위한 래퍼
 * 이전 테스트의 observer가 이후 테스트의 DOM을 처리하는 것을 방지
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

  /**
   * ON 상태로 content script를 초기화하는 헬퍼
   */
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

  /**
   * storage 변경 이벤트를 발생시켜 OFF 전환을 트리거하는 헬퍼
   *
   * App.tsx와 content.tsx 모두 onChanged.addListener를
   * 등록하므로, 실제 Chrome 동작처럼 모든 리스너를 호출
   */
  const triggerOff = async () => {
    type StorageChangeListener = (
      changes: {
        [key: string]: chrome.storage.StorageChange;
      },
      areaName: string,
    ) => void;

    const calls = vi.mocked(
      chrome.storage.onChanged.addListener,
    ).mock.calls;

    const changes = {
      wandokEnabled: {
        newValue: false,
        oldValue: true,
      },
    };

    await act(() => {
      calls.forEach(([listener]) => {
        (listener as StorageChangeListener)(
          changes,
          'local',
        );
      });
    });
  };

  describe('초기 상태', () => {
    it('OFF일 때 ProgressBar가 없어야 한다', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: false });
        return Promise.resolve({ wandokEnabled: false });
      });

      vi.resetModules();
      await act(async () => {
        await import('../content');
        await waitForDom();
      });

      const shadowHost = document.getElementById('wandok-shadow-host');
      const shadowRoot = shadowHost?.shadowRoot;
      const progressBar = shadowRoot?.querySelector('.fixed.top-0.right-0');

      expect(progressBar).toBeNull();
    });

    it('ON일 때 ProgressBar가 있어야 한다', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: true });
        return Promise.resolve({ wandokEnabled: true });
      });

      vi.resetModules();
      await act(async () => {
        await import('../content');
        await waitForDom();
      });

      const shadowHost = document.getElementById('wandok-shadow-host');
      const shadowRoot = shadowHost?.shadowRoot;
      const progressBar = shadowRoot?.querySelector('.fixed.top-0.right-0');

      expect(progressBar).not.toBeNull();
    });
  });

  describe('ON → OFF 전환 시 스타일 복구', () => {
    it('블러 효과가 모두 제거되어야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
          <p>세 번째 문장입니다. 네 번째 문장입니다.</p>
        </article>
      `;

      await setupOnState(html);

      // content script가 텍스트를 처리했는지 확인
      const spans = document.querySelectorAll(
        '.wandok-text-wrapper',
      );
      expect(spans.length).toBeGreaterThan(0);

      // 블러 상태 시뮬레이션: 문단에 직접 blur 클래스 추가
      const paragraphs =
        document.querySelectorAll('article p');
      paragraphs.forEach((p) =>
        p.classList.add('wandok-blur'),
      );

      expect(
        document.querySelectorAll('.wandok-blur').length,
      ).toBe(2);

      await triggerOff();

      expect(
        document.querySelectorAll('.wandok-blur').length,
      ).toBe(0);
    });

    it('분리된 문단이 원래 상태로 복원되어야 한다', async () => {
      await setupOnState();

      const initialCount =
        document.querySelectorAll('article p').length;

      // splitParagraph로 문단 분리 시뮬레이션
      const secondSpan = document.querySelectorAll(
        '.wandok-text-wrapper',
      )[1] as HTMLElement;
      splitParagraph(secondSpan);

      expect(
        document.querySelectorAll(
          '.wandok-split-paragraph',
        ).length,
      ).toBe(1);

      await triggerOff();

      expect(
        document.querySelectorAll(
          '.wandok-split-paragraph',
        ).length,
      ).toBe(0);
      expect(
        document.querySelectorAll('article p').length,
      ).toBe(initialCount);
    });

    it('블러 제거와 문단 복원이 동시에 수행되어야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
          <p>세 번째 문장입니다. 네 번째 문장입니다.</p>
        </article>
      `;

      await setupOnState(html);

      const initialCount =
        document.querySelectorAll('article p').length;

      // 문단 분리
      const secondSpan = document.querySelectorAll(
        '.wandok-text-wrapper',
      )[1] as HTMLElement;
      splitParagraph(secondSpan);

      // 블러 적용
      document
        .querySelectorAll('article p')
        .forEach((p) => p.classList.add('wandok-blur'));

      expect(
        document.querySelectorAll('.wandok-blur').length,
      ).toBeGreaterThan(0);
      expect(
        document.querySelectorAll(
          '.wandok-split-paragraph',
        ).length,
      ).toBeGreaterThan(0);

      await triggerOff();

      expect(
        document.querySelectorAll('.wandok-blur').length,
      ).toBe(0);
      expect(
        document.querySelectorAll(
          '.wandok-split-paragraph',
        ).length,
      ).toBe(0);
      expect(
        document.querySelectorAll('article p').length,
      ).toBe(initialCount);
    });
  });
});
