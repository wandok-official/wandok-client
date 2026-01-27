import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const waitForDom = () => new Promise((resolve) => setTimeout(resolve, 50));

describe('Content Script 통합 테스트', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <article>
        <p>첫 번째 문장입니다. 두 번째 문장입니다.</p>
      </article>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

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
});
