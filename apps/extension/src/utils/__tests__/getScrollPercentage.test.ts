import { describe, it, expect, afterEach } from 'vitest';
import { getScrollPercentage } from '../getScrollPercentage';

describe('getScrollPercentage', () => {
  /**
   * 테스트를 위해 스크롤 관련 속성을 설정합니다.
   * @param scrollY - 현재 스크롤 위치 (window.scrollY)
   * @param scrollHeight - 문서 전체 높이 (document.documentElement.scrollHeight)
   * @param innerHeight - 브라우저 창 높이 (window.innerHeight)
   */
  const setScrollProperties = (
    scrollY: number,
    scrollHeight: number,
    innerHeight: number,
  ): void => {
    Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: scrollHeight,
      configurable: true,
    });
  };

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
  });

  it('페이지 상단에서 0을 반환해야 한다.', () => {
    setScrollProperties(0, 2000, 800);
    expect(getScrollPercentage()).toBe(0);
  });

  it('페이지 하단에서 100을 반환해야 한다.', () => {
    setScrollProperties(1200, 2000, 800);
    expect(getScrollPercentage()).toBe(100);
  });

  it('페이지 중간에서 50을 반환해야 한다.', () => {
    setScrollProperties(600, 2000, 800);
    expect(getScrollPercentage()).toBe(50);
  });

  it('콘텐츠가 뷰포트보다 작을 때 100을 반환해야 한다.', () => {
    setScrollProperties(0, 500, 800);
    expect(getScrollPercentage()).toBe(100);
  });
});
