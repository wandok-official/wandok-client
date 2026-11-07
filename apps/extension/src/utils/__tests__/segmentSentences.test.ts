import { describe, expect, it } from 'vitest';

import { segmentSentences } from '../segmentSentences';

describe('segmentSentences', () => {

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('마침표로 구분된 여러 문장은 분리되어야 한다.', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      const result = segmentSentences(text);

      expect(result).toEqual([
        'First sentence. ',
        'Second sentence. ',
        'Third sentence.',
      ]);
      expect(result.join('')).toBe(text);
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================

  describe('빈 값 / null / undefined 처리', () => {
    it('입력값이 빈 문자열일 때 빈 배열을 반환해야 한다.', () => {
      expect(segmentSentences('')).toEqual([]);
    });
  });

  // ==================== 엣지 케이스 ====================

  describe('엣지 케이스', () => {
    it('마침표가 없는 텍스트는 하나의 문장으로 반환해야 한다', () => {
      const result = segmentSentences('Hello World');

      expect(result).toEqual(['Hello World']);
    });

    it('줄임표가 포함된 문장을 올바르게 처리해야 한다', () => {
      const text = 'Wait... Really? Yes.';
      const result = segmentSentences(text);

      expect(result).toEqual(['Wait... ', 'Really? ', 'Yes.']);
      expect(result.join('')).toBe(text);
    });
  });

  // ==================== 다국어 케이스 ====================

  describe('다국어 케이스', () => {
    it('한영 혼합 시, 문장 단위로 분리되어야 한다.', () => {
      const text = '안녕하세요, 제 이름은 Alice 입니다. Bob의 친구입니다.';
      const result = segmentSentences(text);

      expect(result).toEqual([
        '안녕하세요, 제 이름은 Alice 입니다. ',
        'Bob의 친구입니다.',
      ]);
      expect(result.join('')).toBe(text);
    });

    it('영어 호칭(title, honorific)이 포함된 경우, 문장 단위로 분리되어야 한다.', () => {
      const text = 'Where is Mr. Kim? Dr. Kim is over there.';
      const result = segmentSentences(text);

      expect(result).toEqual([
        'Where is Mr. Kim? ',
        'Dr. Kim is over there.',
      ]);
      expect(result.join('')).toBe(text);
    });

    it('한국어 종결 뒤 공백을 유지해야 한다.', () => {
      const text = '고정했습니다. Playwright 테스트가 통과했습니다. Playwright';
      const result = segmentSentences(text);

      expect(result).toEqual([
        '고정했습니다. ',
        'Playwright 테스트가 통과했습니다. ',
        'Playwright',
      ]);
      expect(result.join('')).toBe(text);
    });

    it('원래 공백이 없는 문장은 공백을 만들지 않아야 한다.', () => {
      const text = '통과했습니다.Playwright';

      expect(segmentSentences(text).join('')).toBe(text);
    });

    it('문장 사이 줄바꿈은 버려지지 않아야 한다.', () => {
      const text = 'First sentence.\n\nSecond sentence.';
      const result = segmentSentences(text);

      expect(result).toEqual([
        'First sentence.\n',
        '\n',
        'Second sentence.',
      ]);
      expect(result.join('')).toBe(text);
    });
  });
});
