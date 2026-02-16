import { describe, expect, it } from 'vitest';

import { segmentSentences } from '../segmentSentences';

describe('segmentSentences', () => {

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('한 문장은 길이 1인 배열을 반환해야 한다.', () => {
      const result = segmentSentences('Hello World!');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Hello World!');
    });

    it('마침표로 구분된 여러 문장은 분리되어야 한다.', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      const result = segmentSentences(text);

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('First sentence. ');
      expect(result[1]).toBe('Second sentence. ');
      expect(result[2]).toBe('Third sentence.');
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================

  describe('빈 값 / null / undefined 처리', () => {
    it('입력값이 빈 문자열일 때 빈 배열을 반환해야 한다.', () => {
      expect(segmentSentences('')).toEqual([]);
    });

    it('입력값이 null 또는 undefined일 때 빈 배열을 반환해야 한다.', () => {
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(segmentSentences(null)).toEqual([]);
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(segmentSentences(undefined)).toEqual([]);
    });
  });

  // ==================== 엣지 케이스 ====================

  describe('엣지 케이스', () => {
    it('마침표가 없는 텍스트는 하나의 문장으로 반환해야 한다', () => {
      const result = segmentSentences('Hello World');

      expect(result).toEqual(['Hello World']);
    });

    it('줄임표가 포함된 문장을 올바르게 처리해야 한다', () => {
      const result = segmentSentences('Wait... Really? Yes.');

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Wait... ');
      expect(result[1]).toBe('Really? ');
      expect(result[2]).toBe('Yes.');
    });

    it('공백만 있는 문자열의 동작을 검증해야 한다', () => {
      const result = segmentSentences('   ');

      expect(result).toEqual(['   ']);
    });

    it('느낌표로만 끝나는 문장을 분리해야 한다', () => {
      const result = segmentSentences('Great! Amazing! Wonderful!');

      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Great! ');
      expect(result[1]).toBe('Amazing! ');
      expect(result[2]).toBe('Wonderful!');
    });

    it('나머지 약어(Mrs., Prof., Jr. 등)가 포함된 문장도 올바르게 처리해야 한다', () => {
      const text = 'Mrs. Smith met Prof. Lee. Jr. members joined.';
      const result = segmentSentences(text);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Mrs. Smith met Prof. Lee. ');
      expect(result[1]).toBe('Jr. members joined.');
    });
  });

  // ==================== 다국어 케이스 ====================

  describe('다국어 케이스', () => {
    it('한영 혼합 시, 문장 단위로 분리되어야 한다.', () => {
      const text = '안녕하세요, 제 이름은 Alice 입니다. Bob의 친구입니다.';
      const result = segmentSentences(text);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('안녕하세요, 제 이름은 Alice 입니다. ');
      expect(result[1]).toBe('Bob의 친구입니다.');
    });

    it('홑따옴표로 이루어진 축약어가 포함된 영어 문장의 경우, 문장 단위로 분리되어야 한다.', () => {
      const text = 'What\'s her name? She\'s Alice.';
      const result = segmentSentences(text);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('What\'s her name? ');
      expect(result[1]).toBe('She\'s Alice.');
    });

    it('영어 호칭(title, honorific)이 포함된 경우, 문장 단위로 분리되어야 한다.', () => {
      const text = 'Where is Mr. Kim? Dr. Kim is over there.';
      const result = segmentSentences(text);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Where is Mr. Kim? ');
      expect(result[1]).toBe('Dr. Kim is over there.');
    });
  });
});
