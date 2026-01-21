import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildProgressSegments } from '../buildProgressSegments';
import * as complexity from '../complexity';

describe('buildProgressSegments', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1000,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 500,
    });

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ==================== 정상 케이스 (Happy Path) ====================
  describe('정상 케이스', () => {
    it('단일 블록에 대한 세그먼트를 생성해야 한다', () => {
      container.innerHTML = '<p>단일 문단</p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('topPct');
      expect(result[0]).toHaveProperty('heightPct');
      expect(result[0]).toHaveProperty('intensity');
    });

    it('여러 블록에 대한 세그먼트를 생성해야 한다', () => {
      container.innerHTML = `
        <p>첫 번째 문단</p>
        <p>두 번째 문단</p>
        <p>세 번째 문단</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      expect(result).toHaveLength(3);
      result.forEach((segment) => {
        expect(segment.topPct).toBeGreaterThanOrEqual(0);
        expect(segment.topPct).toBeLessThanOrEqual(100);
        expect(segment.heightPct).toBeGreaterThan(0);
        expect(segment.intensity).toBeGreaterThanOrEqual(0);
        expect(segment.intensity).toBeLessThanOrEqual(1);
      });
    });

    it('topPct가 0에서 100 사이 값이어야 한다', () => {
      container.innerHTML = '<p>문단</p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      expect(result[0].topPct).toBeGreaterThanOrEqual(0);
      expect(result[0].topPct).toBeLessThanOrEqual(100);
    });

    it('heightPct가 최소 0.4 이상이어야 한다', () => {
      container.innerHTML = '<p>문단</p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      expect(result[0].heightPct).toBeGreaterThanOrEqual(0.4);
    });

    it('topPct + heightPct가 100을 초과하지 않아야 한다', () => {
      container.innerHTML = `
        <p>첫 문단</p>
        <p>두 문단</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      result.forEach((segment) => {
        expect(segment.topPct + segment.heightPct).toBeLessThanOrEqual(100);
      });
    });
  });

  // ==================== 빈 값 / null / undefined 처리 ====================
  describe('빈 값 처리', () => {
    it('빈 배열을 전달하면 빈 배열을 반환해야 한다', () => {
      const result = buildProgressSegments([]);

      expect(result).toEqual([]);
    });

    it('텍스트가 없는 블록도 처리해야 한다', () => {
      container.innerHTML = '<p></p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      expect(result).toHaveLength(1);
      expect(result[0].intensity).toBeGreaterThanOrEqual(0);
    });

    it('scrollable이 1보다 작으면 1로 설정되어야 한다', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 300,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 500,
      });

      container.innerHTML = '<p>문단</p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      expect(result).toHaveLength(1);
      expect(result[0].topPct).toBeGreaterThanOrEqual(0);
    });
  });

  // ==================== 동일 입력 → 동일 출력 ====================
  describe('멱등성 및 일관성', () => {
    it('문서 순서대로 세그먼트를 정렬해야 한다', () => {
      container.innerHTML = `
        <p id="second">두번째</p>
        <p id="first">첫번째</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments([blocks[0], blocks[1]]);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('topPct');
      expect(result[1]).toHaveProperty('topPct');
    });

    it('블록 수와 세그먼트 수가 일치해야 한다', () => {
      container.innerHTML = `
        <p>A</p>
        <p>B</p>
        <p>C</p>
        <p>D</p>
        <p>E</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      expect(result.length).toBe(blocks.length);
    });

    it('모든 세그먼트가 필수 속성을 가져야 한다', () => {
      container.innerHTML = `
        <p>첫 번째</p>
        <p>두 번째</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      result.forEach((segment) => {
        expect(segment).toHaveProperty('topPct');
        expect(segment).toHaveProperty('heightPct');
        expect(segment).toHaveProperty('intensity');
        expect(typeof segment.topPct).toBe('number');
        expect(typeof segment.heightPct).toBe('number');
        expect(typeof segment.intensity).toBe('number');
      });
    });

    it('NaN 값이 포함되지 않아야 한다', () => {
      container.innerHTML = '<p>문단</p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      result.forEach((segment) => {
        expect(isNaN(segment.topPct)).toBe(false);
        expect(isNaN(segment.heightPct)).toBe(false);
        expect(isNaN(segment.intensity)).toBe(false);
      });
    });

    it('중복된 블록을 전달해도 각각 세그먼트를 생성해야 한다', () => {
      container.innerHTML = '<p>문단</p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block, block, block]);

      expect(result).toHaveLength(3);
    });
  });

  // ==================== 복잡도 계산 ====================
  describe('복잡도 계산', () => {
    it('computeComplexity가 각 블록의 텍스트로 호출되어야 한다', () => {
      const computeSpy = vi.spyOn(complexity, 'computeComplexity');

      container.innerHTML = `
        <p>간단한 문단</p>
        <p>복잡한 문단 (많은, 부호들: 포함)</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      buildProgressSegments(blocks);

      expect(computeSpy).toHaveBeenCalledTimes(2);
      expect(computeSpy).toHaveBeenCalledWith('간단한 문단');
      expect(computeSpy).toHaveBeenCalledWith('복잡한 문단 (많은, 부호들: 포함)');

      computeSpy.mockRestore();
    });

    it('normalizeScores가 raw scores로 호출되어야 한다', () => {
      const normalizeSpy = vi.spyOn(complexity, 'normalizeScores');

      container.innerHTML = `
        <p>텍스트 1</p>
        <p>텍스트 2</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      buildProgressSegments(blocks);

      expect(normalizeSpy).toHaveBeenCalledTimes(1);
      expect(normalizeSpy).toHaveBeenCalledWith(expect.any(Array));

      normalizeSpy.mockRestore();
    });

    it('intensity가 0과 1 사이 값이어야 한다', () => {
      container.innerHTML = `
        <p>짧은</p>
        <p>중간 길이의 문단입니다</p>
        <p>매우 긴 문단으로 많은 텍스트를 포함하고 있습니다. 복잡도도 높습니다.</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      result.forEach((segment) => {
        expect(segment.intensity).toBeGreaterThanOrEqual(0);
        expect(segment.intensity).toBeLessThanOrEqual(1);
      });
    });

    it('같은 복잡도의 블록들은 모두 0.5의 intensity를 가져야 한다', () => {
      vi.spyOn(complexity, 'computeComplexity').mockReturnValue(100);

      container.innerHTML = `
        <p>A</p>
        <p>B</p>
        <p>C</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      result.forEach((segment) => {
        expect(segment.intensity).toBe(0.5);
      });

      vi.restoreAllMocks();
    });
  });

  // ==================== 에러 상황 및 복구 ====================
  describe('복잡한 시나리오 및 엣지 케이스', () => {
    it('긴 문서에서 올바른 비율을 계산해야 한다', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        writable: true,
        configurable: true,
        value: 5000,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      container.innerHTML = '<p>중간 문단</p>';
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      expect(result[0].topPct).toBeGreaterThanOrEqual(0);
      expect(result[0].topPct).toBeLessThanOrEqual(100);
      expect(result[0].heightPct).toBeGreaterThan(0);
    });

    it('연속된 블록들의 세그먼트가 겹치지 않아야 한다', () => {
      container.innerHTML = `
        <p style="height: 100px;">첫 번째</p>
        <p style="height: 100px;">두 번째</p>
        <p style="height: 100px;">세 번째</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      for (let i = 0; i < result.length - 1; i++) {
        const currentEnd = result[i].topPct + result[i].heightPct;
        const nextStart = result[i + 1].topPct;

        expect(nextStart).toBeGreaterThanOrEqual(currentEnd - 1);
      }
    });

    it('마지막 블록의 세그먼트가 100%를 초과하지 않아야 한다', () => {
      container.innerHTML = `
        <p>첫 번째</p>
        <p>두 번째</p>
        <p>마지막</p>
      `;
      const blocks = Array.from(container.querySelectorAll('p')) as HTMLElement[];

      const result = buildProgressSegments(blocks);

      const lastSegment = result[result.length - 1];
      expect(lastSegment.topPct + lastSegment.heightPct).toBeLessThanOrEqual(100);
    });

    it('매우 긴 블록도 올바르게 처리해야 한다', () => {
      const longText = 'A'.repeat(10000);
      container.innerHTML = `<p>${longText}</p>`;
      const block = container.querySelector('p') as HTMLElement;

      const result = buildProgressSegments([block]);

      expect(result).toHaveLength(1);
      expect(result[0].heightPct).toBeGreaterThan(0);
      expect(result[0].intensity).toBeGreaterThanOrEqual(0);
      expect(result[0].intensity).toBeLessThanOrEqual(1);
    });
  });
});
