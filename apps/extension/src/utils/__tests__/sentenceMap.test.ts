import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createSentenceMap } from '../sentenceMap';

describe('SentenceMap', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('analyze', () => {
    it('여러 문장이 포함된 블록을 분석하면 문장별 오프셋이 연속되어야 한다', () => {
      container.innerHTML =
        '<article><p>첫 번째 문장입니다. 두 번째 문장입니다.</p></article>';
      const sentenceMap = createSentenceMap();

      sentenceMap.analyze(container);

      const p = container.querySelector('p') as HTMLElement;
      const regions = sentenceMap.getRegions(p)!;
      expect(regions.length).toBeGreaterThanOrEqual(2);
      expect(regions[0].startOffset).toBe(0);
      expect(regions[1].startOffset).toBe(regions[0].endOffset);
      expect(regions[regions.length - 1].endOffset).toBe(
        p.textContent!.length,
      );
    });

    it('여러 블록이 있으면 각 블록의 regions를 독립적으로 생성해야 한다', () => {
      container.innerHTML = `
        <article>
          <p>첫 번째 문단입니다.</p>
          <p>두 번째 문단입니다.</p>
        </article>
      `;
      const sentenceMap = createSentenceMap();

      sentenceMap.analyze(container);

      const paragraphs = container.querySelectorAll('p');
      expect(sentenceMap.getRegions(paragraphs[0] as HTMLElement)).toBeDefined();
      expect(sentenceMap.getRegions(paragraphs[1] as HTMLElement)).toBeDefined();
    });

    it('콘텐츠 영역(article) 밖의 텍스트는 분석하지 않아야 한다', () => {
      container.innerHTML = `
        <nav><p>네비게이션</p></nav>
        <article><p>본문 텍스트입니다.</p></article>
      `;
      const sentenceMap = createSentenceMap();

      sentenceMap.analyze(container);

      const navP = container.querySelector('nav p') as HTMLElement;
      const articleP = container.querySelector('article p') as HTMLElement;
      expect(sentenceMap.getRegions(navP)).toBeUndefined();
      expect(sentenceMap.getRegions(articleP)).toBeDefined();
    });

    it('같은 블록을 두 번 analyze해도 기존 regions를 덮어쓰지 않아야 한다', () => {
      container.innerHTML = '<article><p>문장입니다.</p></article>';
      const sentenceMap = createSentenceMap();
      const p = container.querySelector('p') as HTMLElement;

      sentenceMap.analyze(container);
      const firstRegions = sentenceMap.getRegions(p);

      sentenceMap.analyze(container);
      const secondRegions = sentenceMap.getRegions(p);

      expect(firstRegions).toBe(secondRegions);
    });

    it('region의 textNode가 원본 DOM 텍스트 노드의 참조여야 한다', () => {
      container.innerHTML = '<article><p>문장입니다.</p></article>';
      const sentenceMap = createSentenceMap();

      sentenceMap.analyze(container);

      const p = container.querySelector('p') as HTMLElement;
      const regions = sentenceMap.getRegions(p)!;
      expect(regions[0].textNode).toBe(p.firstChild);
    });
  });

  describe('reanalyzeBlock', () => {
    it('블록의 텍스트가 변경된 후 호출하면 새 오프셋을 반영해야 한다', () => {
      container.innerHTML = '<article><p>원본 문장.</p></article>';
      const sentenceMap = createSentenceMap();
      const p = container.querySelector('p') as HTMLElement;

      sentenceMap.analyze(container);
      const originalRegions = sentenceMap.getRegions(p)!;

      p.textContent = '변경된 첫 번째 문장. 변경된 두 번째 문장.';
      sentenceMap.reanalyzeBlock(p);

      const newRegions = sentenceMap.getRegions(p)!;
      expect(newRegions).not.toBe(originalRegions);
      expect(newRegions.length).toBeGreaterThanOrEqual(2);
      expect(newRegions[newRegions.length - 1].endOffset).toBe(
        p.textContent.length,
      );
    });

    it('텍스트가 빈 문자열로 변경되면 해당 블록의 regions를 제거해야 한다', () => {
      container.innerHTML = '<article><p>문장입니다.</p></article>';
      const sentenceMap = createSentenceMap();
      const p = container.querySelector('p') as HTMLElement;

      sentenceMap.analyze(container);
      expect(sentenceMap.getRegions(p)).toBeDefined();

      p.textContent = '';
      sentenceMap.reanalyzeBlock(p);

      expect(sentenceMap.getRegions(p)).toBeUndefined();
    });
  });

  describe('getRegions', () => {
    it('분석되지 않은 블록은 undefined를 반환해야 한다', () => {
      const sentenceMap = createSentenceMap();

      const unknownBlock = document.createElement('p');

      expect(sentenceMap.getRegions(unknownBlock)).toBeUndefined();
    });
  });

  describe('getBlocks', () => {
    it('분석된 모든 블록 요소의 Set을 반환해야 한다', () => {
      container.innerHTML = `
        <article>
          <p>첫 번째.</p>
          <p>두 번째.</p>
        </article>
      `;
      const sentenceMap = createSentenceMap();

      sentenceMap.analyze(container);

      expect(sentenceMap.getBlocks().size).toBe(2);
    });
  });

  describe('invalidateRects', () => {
    it('여러 블록의 모든 region cachedRects를 null로 리셋해야 한다', () => {
      container.innerHTML = `
        <article>
          <p>첫 번째 문단.</p>
          <p>두 번째 문단.</p>
        </article>
      `;
      const sentenceMap = createSentenceMap();
      sentenceMap.analyze(container);

      const paragraphs = container.querySelectorAll('p');
      const regions1 = sentenceMap.getRegions(paragraphs[0] as HTMLElement)!;
      const regions2 = sentenceMap.getRegions(paragraphs[1] as HTMLElement)!;
      regions1[0].cachedRects = [new DOMRect()];
      regions2[0].cachedRects = [new DOMRect()];

      sentenceMap.invalidateRects();

      expect(regions1[0].cachedRects).toBeNull();
      expect(regions2[0].cachedRects).toBeNull();
    });
  });

  describe('clear', () => {
    it('모든 분석 데이터를 초기화해야 한다', () => {
      container.innerHTML = '<article><p>문장입니다.</p></article>';
      const sentenceMap = createSentenceMap();
      sentenceMap.analyze(container);

      sentenceMap.clear();

      expect(sentenceMap.getBlocks().size).toBe(0);
      expect(
        sentenceMap.getRegions(container.querySelector('p') as HTMLElement),
      ).toBeUndefined();
    });

    it('clear 후 같은 블록을 다시 analyze할 수 있어야 한다', () => {
      container.innerHTML = '<article><p>문장입니다.</p></article>';
      const sentenceMap = createSentenceMap();
      sentenceMap.analyze(container);

      sentenceMap.clear();
      sentenceMap.analyze(container);

      expect(sentenceMap.getBlocks().size).toBe(1);
    });
  });
});
