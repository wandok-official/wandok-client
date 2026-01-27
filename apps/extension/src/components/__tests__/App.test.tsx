import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../App';

/**
 * App 컴포넌트 테스트
 */
describe('App', () => {
  afterEach(() => {
    cleanup();
  });

  describe('정상 케이스', () => {
    it('App 컴포넌트가 에러 없이 렌더링되어야 한다', () => {
      expect(() => render(<App />)).not.toThrow();
    });

    it('비활성화 상태일 때 null을 반환해야 한다', () => {
      const { container } = render(<App />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('활성화 상태', () => {
    beforeEach(() => {
      vi.mocked(chrome.storage.local.get).mockImplementation((keys, callback) => {
        if (callback) callback({ wandokEnabled: true });
        return Promise.resolve({ wandokEnabled: true });
      });
    });

    it('ProgressBar가 렌더링되어야 한다', () => {
      const { container } = render(<App />);
      const progressBar = container.querySelector('.fixed.top-0.right-0');
      expect(progressBar).not.toBeNull();
    });
  });
});
