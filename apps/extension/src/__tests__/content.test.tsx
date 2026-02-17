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

      const shadowHost = document.getElementById('wandok-shadow-host');

      expect(shadowHost).toBeNull();
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

  describe('콘텐츠 필터링', () => {
    it('article 밖의 텍스트는 처리하지 않아야 한다', async () => {
      const html = `
        <nav><p>네비게이션 텍스트</p></nav>
        <article><p>본문 텍스트입니다.</p></article>
        <footer><p>푸터 텍스트</p></footer>
      `;

      await setupOnState(html);

      const navSpans = document.querySelectorAll('nav .wandok-text-wrapper');
      const footerSpans = document.querySelectorAll('footer .wandok-text-wrapper');
      const articleSpans = document.querySelectorAll('article .wandok-text-wrapper');

      expect(navSpans.length).toBe(0);
      expect(footerSpans.length).toBe(0);
      expect(articleSpans.length).toBeGreaterThan(0);
    });

    it('button, a 태그 내부의 텍스트는 처리하지 않아야 한다', async () => {
      const html = `
        <article>
          <p>본문 텍스트입니다.</p>
          <button>버튼 텍스트</button>
          <a href="#">링크 텍스트</a>
        </article>
      `;

      await setupOnState(html);

      const buttonSpans = document.querySelectorAll('button .wandok-text-wrapper');
      const linkSpans = document.querySelectorAll('a .wandok-text-wrapper');

      expect(buttonSpans.length).toBe(0);
      expect(linkSpans.length).toBe(0);
    });
  });

  describe('비활성 상태 동작', () => {
    it('OFF 전환 시 wandok-text-wrapper가 제거되어 클릭할 대상이 없어야 한다', async () => {
      await setupOnState();

      const spans = document.querySelectorAll('.wandok-text-wrapper');
      expect(spans.length).toBeGreaterThan(0);

      await triggerOff();

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBe(0);
      expect(document.querySelectorAll('.wandok-split-paragraph').length).toBe(0);
    });

    it('OFF 전환 시 wandok-text-wrapper가 모두 제거되고 원본 텍스트가 복원되어야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
          <p>세 번째 문장입니다. 네 번째 문장입니다.</p>
        </article>
      `;

      await setupOnState(html);

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBeGreaterThan(0);

      await triggerOff();

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBe(0);

      const paragraphs = document.querySelectorAll('article p');
      expect(paragraphs.length).toBe(2);
      expect(paragraphs[0].textContent).toContain('첫 번째 문장입니다.');
      expect(paragraphs[1].textContent).toContain('세 번째 문장입니다.');
    });
  });

  describe('이벤트 전파', () => {
    it('ON 상태에서 wandok-text-wrapper 클릭 시 부모 요소로 이벤트가 전파되어야 한다', async () => {
      await setupOnState();

      const article = document.querySelector('article') as HTMLElement;
      const clickHandler = vi.fn();
      article.addEventListener('click', clickHandler);

      const span = document.querySelector('.wandok-text-wrapper') as HTMLElement;
      span.click();

      expect(clickHandler).toHaveBeenCalledTimes(1);

      article.removeEventListener('click', clickHandler);
    });

    it('ON 상태에서 클릭 이벤트가 document까지 전파되어야 한다', async () => {
      await setupOnState();

      const clickHandler = vi.fn();
      document.addEventListener('click', clickHandler);

      const span = document.querySelector('.wandok-text-wrapper') as HTMLElement;
      span.click();

      expect(clickHandler).toHaveBeenCalledTimes(1);

      document.removeEventListener('click', clickHandler);
    });
  });

  describe('이벤트 핸들러', () => {
    it('ON 상태에서 wandok-text-wrapper 클릭 시 문단이 분리되어야 한다', async () => {
      await setupOnState();

      const spans = document.querySelectorAll('.wandok-text-wrapper');
      expect(spans.length).toBeGreaterThan(1);

      const secondSpan = spans[1] as HTMLElement;
      await act(async () => {
        secondSpan.click();
        await waitForDom();
      });

      expect(document.querySelectorAll('.wandok-split-paragraph').length).toBeGreaterThan(0);
    });

    it('ON 상태에서 마우스 호버 시 블러 효과가 적용되어야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
          <p>세 번째 문장입니다. 네 번째 문장입니다.</p>
        </article>
      `;
      await setupOnState(html);

      const spans = document.querySelectorAll('.wandok-text-wrapper');
      expect(spans.length).toBeGreaterThan(0);

      const firstSpan = spans[0] as HTMLElement;
      await act(async () => {
        firstSpan.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
        await waitForDom();
      });

      const blurredElements = document.querySelectorAll('.wandok-blur');
      expect(blurredElements.length).toBeGreaterThan(0);

      await act(async () => {
        firstSpan.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
        await waitForDom();
      });

      expect(document.querySelectorAll('.wandok-blur').length).toBe(0);
    });
  });

  describe('MutationObserver', () => {
    it('동적으로 추가된 article 내 콘텐츠를 처리해야 한다', async () => {
      await setupOnState();

      const initialSpans = document.querySelectorAll('.wandok-text-wrapper').length;

      const article = document.querySelector('article');
      const newParagraph = document.createElement('p');
      newParagraph.textContent = '동적으로 추가된 문장입니다.';

      await act(async () => {
        article?.appendChild(newParagraph);
        await waitForDom();
      });

      const afterSpans = document.querySelectorAll('.wandok-text-wrapper').length;
      expect(afterSpans).toBeGreaterThan(initialSpans);
    });

    it('wandok-split-paragraph 요소가 추가되어도 재처리하지 않아야 한다', async () => {
      await setupOnState();

      const article = document.querySelector('article');
      const splitParagraphEl = document.createElement('p');
      splitParagraphEl.classList.add('wandok-split-paragraph');
      splitParagraphEl.innerHTML = '<span class="wandok-text-wrapper">이미 처리된 텍스트</span>';

      await act(async () => {
        article?.appendChild(splitParagraphEl);
        await waitForDom();
      });

      const wrappersInSplit = splitParagraphEl.querySelectorAll('.wandok-text-wrapper');
      expect(wrappersInSplit.length).toBe(1);
    });

    it('wandok-text-wrapper 요소가 추가되어도 재처리하지 않아야 한다', async () => {
      await setupOnState();

      const article = document.querySelector('article');
      const wrapper = document.createElement('span');
      wrapper.classList.add('wandok-text-wrapper');
      wrapper.textContent = '이미 래핑된 텍스트';

      await act(async () => {
        article?.appendChild(wrapper);
        await waitForDom();
      });

      const nestedWrappers = wrapper.querySelectorAll('.wandok-text-wrapper');
      expect(nestedWrappers.length).toBe(0);
    });

    it('wandok-text-wrapper를 포함한 요소가 추가되어도 재처리하지 않아야 한다', async () => {
      await setupOnState();

      const article = document.querySelector('article');
      const container = document.createElement('div');
      container.innerHTML = '<span class="wandok-text-wrapper">이미 처리된 텍스트</span>';

      await act(async () => {
        article?.appendChild(container);
        await waitForDom();
      });

      const wrappers = container.querySelectorAll('.wandok-text-wrapper');
      expect(wrappers.length).toBe(1);
    });
  });

  describe('OFF → ON 재활성화', () => {
    /**
     * storage 변경 이벤트를 발생시켜 ON 전환을 트리거하는 헬퍼
     */
    const triggerOn = async () => {
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
          newValue: true,
          oldValue: false,
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

    it('OFF → ON 재활성화 시 텍스트가 다시 래핑되어야 한다', async () => {
      await setupOnState();

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBeGreaterThan(0);

      await triggerOff();

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBe(0);

      await triggerOn();
      await act(async () => {
        await waitForDom();
      });

      expect(document.querySelectorAll('.wandok-text-wrapper').length).toBeGreaterThan(0);
    });
  });

  describe('OFF 전환 시 원본 텍스트 복원', () => {
    it('문장 사이 공백이 보존되어야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
        </article>
      `;
      await setupOnState(html);

      const p = document.querySelector('article p') as HTMLElement;
      expect(p.querySelectorAll('.wandok-text-wrapper').length).toBeGreaterThan(0);

      await triggerOff();

      expect(p.textContent).toBe('첫 번째 문장입니다. 두 번째 문장입니다.');
    });

    it('약어가 포함된 텍스트의 공백이 보존되어야 한다', async () => {
      const html = `
        <article>
          <p>Mr. Smith visited Dr. Lee at the hospital. Prof. Kim was also there.</p>
        </article>
      `;
      await setupOnState(html);

      await triggerOff();

      const p = document.querySelector('article p') as HTMLElement;
      expect(p.textContent).toBe(
        'Mr. Smith visited Dr. Lee at the hospital. Prof. Kim was also there.',
      );
    });

    it('한영 혼합 텍스트의 공백이 보존되어야 한다', async () => {
      const html = `
        <article>
          <p>안녕하세요, 제 이름은 Alice 입니다. Bob의 친구입니다.</p>
        </article>
      `;
      await setupOnState(html);

      await triggerOff();

      const p = document.querySelector('article p') as HTMLElement;
      expect(p.textContent).toBe('안녕하세요, 제 이름은 Alice 입니다. Bob의 친구입니다.');
    });

    it('문단 분리 후 복원해도 원본 텍스트가 보존되어야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.</p>
        </article>
      `;
      await setupOnState(html);

      const secondSpan = document.querySelectorAll('.wandok-text-wrapper')[1] as HTMLElement;
      splitParagraph(secondSpan);

      expect(document.querySelectorAll('.wandok-split-paragraph').length).toBe(1);

      await triggerOff();

      const paragraphs = document.querySelectorAll('article p');
      expect(paragraphs.length).toBe(1);
      expect(paragraphs[0].textContent).toBe(
        '첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.',
      );
    });
  });

  describe('storage 변경 엣지 케이스', () => {
    it('local이 아닌 storage 변경은 무시해야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
        </article>
      `;
      await setupOnState(html);

      document.querySelectorAll('article p').forEach((p) => p.classList.add('wandok-blur'));
      expect(document.querySelectorAll('.wandok-blur').length).toBeGreaterThan(0);

      type StorageChangeListener = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string,
      ) => void;

      const calls = vi.mocked(chrome.storage.onChanged.addListener).mock.calls;
      await act(() => {
        calls.forEach(([listener]) => {
          (listener as StorageChangeListener)(
            { wandokEnabled: { newValue: false, oldValue: true } },
            'sync',
          );
        });
      });

      expect(document.querySelectorAll('.wandok-blur').length).toBeGreaterThan(0);
    });

    it('wandokEnabled 외의 storage 변경은 무시해야 한다', async () => {
      const html = `
        <article>
          <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
        </article>
      `;
      await setupOnState(html);

      document.querySelectorAll('article p').forEach((p) => p.classList.add('wandok-blur'));
      expect(document.querySelectorAll('.wandok-blur').length).toBeGreaterThan(0);

      type StorageChangeListener = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string,
      ) => void;

      const calls = vi.mocked(chrome.storage.onChanged.addListener).mock.calls;
      await act(() => {
        calls.forEach(([listener]) => {
          (listener as StorageChangeListener)(
            { someOtherKey: { newValue: 'new', oldValue: 'old' } },
            'local',
          );
        });
      });

      expect(document.querySelectorAll('.wandok-blur').length).toBeGreaterThan(0);
    });
  });
});
