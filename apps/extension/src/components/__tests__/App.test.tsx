import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

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

    it('ProgressBar가 렌더링되어야 한다', () => {
      const { container } = render(<App />);
      const progressBar = container.querySelector('.fixed.top-0.right-0');
      expect(progressBar).not.toBeNull();
    });
  });
});
