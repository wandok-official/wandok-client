import { describe, expect, it } from 'vitest';
import { computeComplexity, normalizeScores } from '../complexity';

describe('computeComplexity', () => {

  // ==================== 정상 케이스 (Happy Path) ====================

  describe('정상 케이스 (Happy Path)', () => {
    it('일반적인 텍스트의 복잡도를 계산해야 한다.', () => {
      // 길이(5) + 구두점(0) + 숫자(0)
      expect(computeComplexity('hello')).toBe(5);
      // 길이(12) + 구두점(20) + 숫자(0)
      expect(computeComplexity('hello, world')).toBe(12 + 20);
      // 길이(6) + 구두점(0) + 숫자(10)
      expect(computeComplexity('hello2')).toBe(6 + 10);
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
      expect(computeComplexity(longString)).toBe(10000);
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
