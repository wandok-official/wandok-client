/// <reference types="@testing-library/jest-dom" />
import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/dom';
// import '@testing-library/jest-dom'; // TODO: 패키지 설치 필요

import { mockChrome } from './mocks/chrome';

beforeAll(() => {
  vi.stubGlobal('chrome', mockChrome);
});

afterEach(() => {
  cleanup();
  // clearAllMocks: mock 호출 기록만 초기화 (mockImplementation 유지)
  // 각 테스트 간 호출 기록 격리를 위해 사용
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

afterAll(() => {
  // resetAllMocks: mock 호출 기록 + mockImplementation 모두 초기화
  // 전체 테스트 종료 후 완전한 정리를 위해 사용
  vi.resetAllMocks();
});

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(() => callback(Date.now()), 16) as unknown as number;
  };
}

if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id: number): void => {
    clearTimeout(id);
  };
}

if (typeof Intl.Segmenter === 'undefined') {
  // @ts-expect-error - Intl.Segmenter polyfill
  Intl.Segmenter = class MockSegmenter {
    private options: { granularity: string };

    constructor(
      _locales: string | string[] = ['en'],
      options: { granularity: string } = { granularity: 'word' },
    ) {
      this.options = options;
    }

    segment(text: string) {
      if (this.options.granularity === 'sentence') {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        let index = 0;
        const result = sentences.map((segment) => {
          const item = { segment, index, input: text };
          index += segment.length;
          return item;
        });
        return {
          [Symbol.iterator]: () => result[Symbol.iterator](),
        };
      }
      return {
        [Symbol.iterator]: () => [{ segment: text, index: 0, input: text }][Symbol.iterator](),
      };
    }
  };
}
