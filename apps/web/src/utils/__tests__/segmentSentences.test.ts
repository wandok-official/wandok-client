import { describe, expect, it } from 'vitest';

import { segmentSentences } from '../segmentSentences';

describe('segmentSentences', () => {
  describe('빈 값 처리', () => {
    it('빈 문자열이면 빈 배열을 반환해야 한다', () => {
      expect(segmentSentences('')).toEqual([]);
    });

    it('null/undefined이면 빈 배열을 반환해야 한다', () => {
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(segmentSentences(null)).toEqual([]);
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(segmentSentences(undefined)).toEqual([]);
    });
  });

  describe('문장 분리', () => {
    it('마침표로 구분된 여러 문장을 분리해야 한다', () => {
      const result = segmentSentences('First sentence. Second sentence.');

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('First sentence.');
      expect(result[1]).toBe('Second sentence.');
    });

    it('한국어 문장을 분리해야 한다', () => {
      const text = '안녕하세요. 반갑습니다.';
      const result = segmentSentences(text);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('안녕하세요.');
      expect(result[1]).toBe('반갑습니다.');
    });
  });

  describe('약어 처리', () => {
    it('약어(Mr. Dr.)의 마침표에서 문장을 분리하지 않아야 한다', () => {
      const text = 'Where is Mr. Kim? Dr. Kim is over there.';
      const result = segmentSentences(text);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Where is Mr. Kim?');
      expect(result[1]).toBe('Dr. Kim is over there.');
    });
  });
});
