import { describe, expect, it } from 'vitest';
import { computeComplexity, normalizeScores } from '../complexity';

describe('computeComplexity', () => {

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('일반적인 텍스트의 복잡도를 계산해야 한다.', () => {
      // 'hello': 길이(5) + 문장수(1)*10 + 평균(5)*0.2 = 16
      expect(computeComplexity('hello')).toBe(16);
      
      // 'hello, world': 길이(12) + 문장수(1)*10 + 평균(12)*0.2 + 콤마(1)*2 = 26.4
      expect(computeComplexity('hello, world')).toBe(26.4);
      
      // 'hello2': 길이(6) + 문장수(1)*10 + 평균(6)*0.2 + 숫자(1)*3 = 20.2
      expect(computeComplexity('hello2')).toBe(20.2);
    });

    it('문장이 많을수록 복잡도가 높아야 한다.', () => {
      const oneSentence = '이것은 한 문장입니다.';
      const threeSentences = '첫 문장. 둘째 문장. 셋째 문장.';
      
      const score1 = computeComplexity(oneSentence);
      const score3 = computeComplexity(threeSentences);
      
      // 문장 수가 많으면 복잡도가 높아야 함
      expect(score3).toBeGreaterThan(score1);
    });

    it('복잡한 구두점이 있으면 복잡도가 높아야 한다.', () => {
      const simple = '간단한 문장입니다.';
      const complex = '복잡한 문장입니다: (예시) [테스트].';
      
      const score1 = computeComplexity(simple);
      const score2 = computeComplexity(complex);
      
      expect(score2).toBeGreaterThan(score1);
    });

    it('긴 텍스트가 짧은 텍스트보다 복잡도가 높아야 한다.', () => {
      const short = '짧은 제목';
      const long = '이것은 매우 긴 본문 텍스트입니다. 여러 문장으로 구성되어 있습니다. 복잡도가 높아야 합니다.';
      
      const scoreShort = computeComplexity(short);
      const scoreLong = computeComplexity(long);
      
      // 긴 텍스트가 훨씬 높은 복잡도를 가져야 함
      expect(scoreLong).toBeGreaterThan(scoreShort * 2);
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================

  describe('빈 값 / null / undefined 처리', () => {
    it('빈 문자열일 때 0을 반환해야 한다.', () => {
      expect(computeComplexity('')).toBe(0);
      expect(computeComplexity('   ')).toBe(0);
      expect(computeComplexity('\n\t')).toBe(0);
    });

    it('null 또는 undefined일 때 0을 반환해야 한다.', () => {
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(computeComplexity(null)).toBe(0);
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(computeComplexity(undefined)).toBe(0);
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================

  describe('동일 입력 → 동일 출력', () => {
    it('동일한 입력에 대해 항상 동일한 결과를 반환해야 한다.', () => {
      const input = 'Complex input string with numbers 123 and punctuation!';
      const result1 = computeComplexity(input);
      const result2 = computeComplexity(input);
      const result3 = computeComplexity(input);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  // ==================== 에러 상황 및 복구 ====================

  describe('에러 상황 및 복구', () => {
    it('매우 긴 문자열도 정상적으로 처리해야 한다.', () => {
      const longString = 'a'.repeat(10000);
      // 길이(10000) + 문장수(1)*10 + 평균(10000)*0.2 = 12010
      expect(computeComplexity(longString)).toBe(12010);
    });

    it('다양한 문장 부호가 포함된 복잡한 텍스트를 처리해야 한다.', () => {
      const complexText = '첫 문장입니다. 두번째: (괄호 포함) [대괄호]. 숫자 123, 콤마!';
      const result = computeComplexity(complexText);
      
      // 결과가 숫자이고 0보다 커야 함
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });
  });
});

describe('normalizeScores', () => {

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('최솟값은 0으로, 최댓값은 1로 정규화되어야 한다.', () => {
      const result = normalizeScores([10, 50, 100]);

      expect(result[0]).toBe(0);
      expect(result[2]).toBe(1);
    });

    it('모든 정규화된 값은 0과 1 사이여야 한다.', () => {
      const result = normalizeScores([5, 15, 25, 35, 45]);
      result.forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });

    it('정규화 후에도 점수의 상대적 순서가 유지되어야 한다.', () => {
      const result = normalizeScores([30, 10, 50, 20]);

      expect(result[1]).toBeLessThan(result[3]); // 10 < 20
      expect(result[3]).toBeLessThan(result[0]); // 20 < 30
      expect(result[0]).toBeLessThan(result[2]); // 30 < 50
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================

  describe('빈 값 / null / undefined 처리', () => {
    it('빈 배열일 때 빈 배열을 반환해야 한다.', () => {
      expect(normalizeScores([])).toEqual([]);
    });

    it('null 또는 undefined일 때 빈 배열을 반환해야 한다.', () => {
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(normalizeScores(null)).toEqual([]);
      // @ts-expect-error 테스트를 위해 의도적으로 잘못된 타입 전달
      expect(normalizeScores(undefined)).toEqual([]);
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================

  describe('동일 입력 → 동일 출력', () => {
    it('동일한 입력에 대해 항상 동일한 결과를 반환해야 한다.', () => {
      const input = [10, 20, 30];
      const result1 = normalizeScores(input);
      const result2 = normalizeScores(input);
      expect(result1).toEqual(result2);
    });
  });

  // ==================== 에러 상황 및 복구 ====================

  describe('에러 상황 및 복구', () => {
    it('모든 점수가 동일할 때 0.5로 채워진 배열을 반환해야 한다.', () => {
      expect(normalizeScores([5, 5, 5])).toEqual([0.5, 0.5, 0.5]);
    });

    it('하나의 값만 있을 때 0.5를 반환해야 한다.', () => {
      expect(normalizeScores([10])).toEqual([0.5]);
    });
  });
});
