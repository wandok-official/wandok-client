import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { App } from '../App';

/**
 * App 컴포넌트 테스트
 * 
 * 현재 버전: 포커스 모드(blur, 문단 분리)만 제공
 * 
 * 제외된 기능 (향후 추가 예정):
 * - Complexity 기반 Progress Bar (스크롤 난이도 표시)
 * - 드래그 하이라이트 메모 기능
 */
describe('App', () => {
  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스', () => {
    it('App 컴포넌트가 에러 없이 렌더링되어야 한다', () => {
      expect(() => render(<App />)).not.toThrow();
    });

    it('null을 반환해야 한다 (현재 버전에서는 React 컴포넌트 없음)', () => {
      const { container } = render(<App />);
      expect(container.firstChild).toBeNull();
    });
  });
});
