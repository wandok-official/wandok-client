import { mockScrollProperties } from '@test/mocks/dom';
import { describe, expect, it } from 'vitest';

import { getScrollPercentage } from '../getScrollPercentage';

describe('getScrollPercentage', () => {
  it('문서 높이가 뷰포트 이하일 때 0을 반환해야 한다', () => {
    mockScrollProperties({ scrollY: 0, scrollHeight: 800, innerHeight: 800 });

    expect(getScrollPercentage()).toBe(0);
  });

  it('스크롤 위치에 따라 올바른 퍼센트를 반환해야 한다', () => {
    mockScrollProperties({ scrollY: 600, scrollHeight: 2000, innerHeight: 800 });

    expect(getScrollPercentage()).toBe(50);
  });

  it('스크롤이 문서 끝을 넘어도 100으로 클램핑해야 한다', () => {
    mockScrollProperties({ scrollY: 1500, scrollHeight: 2000, innerHeight: 800 });

    expect(getScrollPercentage()).toBe(100);
  });
});
