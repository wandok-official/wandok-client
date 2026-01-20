import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/dom';

import { mockChrome } from './mocks/chrome';

beforeAll(() => {
  // @ts-expect-error - Chrome API mock
  globalThis.chrome = mockChrome;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

afterAll(() => {
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
