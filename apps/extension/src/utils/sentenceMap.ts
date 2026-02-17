/**
 * ## SentenceMap — 원본 DOM을 변경하지 않는 문장 분석 모듈
 *
 * 웹 페이지의 텍스트를 문장 단위로 분석하고, 각 문장의 위치 정보를 관리한다.
 * 원본 DOM을 읽기만 할 뿐 어떤 변경도 가하지 않는다.
 *
 * ### 핵심 구조: Block → SentenceRegion[]
 *
 * ```
 * <article>
 *   <p>첫 번째 문장. 두 번째 문장.</p>     ← Block (HTMLElement)
 *   <p>세 번째 문장.</p>                ← Block (HTMLElement)
 * </article>
 *
 * SentenceMap 내부 저장 구조:
 * ┌─────────┬───────────────────────────────────────────────────┐
 * │  Block  │  SentenceRegion[]                                 │
 * ├─────────┼───────────────────────────────────────────────────┤
 * │  <p#1>  │ [{ "첫 번째 문장. ", 0~9 }, { "두 번째 문장.", 9~18 }]  │
 * │  <p#2>  │ [{ "세 번째 문장.", 0~7 }]                           │
 * └─────────┴───────────────────────────────────────────────────┘
 * ```
 *
 * - **SentenceRegion**: 하나의 문장이 텍스트 노드 내에서 차지하는 범위(startOffset, endOffset)와
 *   뷰포트 좌표 캐시(cachedRects)를 담는 단위 데이터.
 * - **SentenceMap**: 블록 요소를 키로, 해당 블록에 속한 SentenceRegion 배열을 값으로 관리하는
 *   분석 결과 저장소. analyze()로 분석하고, hitTest()로 좌표 기반 문장 탐색,
 *   computeRects()로 뷰포트 좌표 캐싱 등의 조회 기능을 제공한다.
 *
 * ### 사용 흐름
 *
 * 1. `analyze(root)` — 콘텐츠 영역의 텍스트를 블록별로 분석하여 SentenceRegion 생성
 * 2. `hitTest(x, y)` — 마우스 좌표로 해당 문장의 block과 regionIndex를 탐색
 * 3. `computeRects(block)` — 오버레이 렌더링을 위해 뷰포트 좌표를 계산·캐싱
 * 4. `invalidateRects()` — 스크롤/리사이즈 시 캐시 무효화
 * 5. `clear()` — 비활성화 시 전체 초기화
 */

import { getClosestBlock, isArticleContent } from './domFilters';
import { extractTextNodes } from './extractTextNodes';
import { segmentSentences } from './segmentSentences';

/** 하나의 문장이 텍스트 노드 내에서 차지하는 범위와 캐싱된 뷰포트 좌표. */
export interface SentenceRegion {
  textNode: Text;
  startOffset: number;
  endOffset: number;
  /** Range.getClientRects()로 계산한 뷰포트 좌표. 미계산 시 null. */
  cachedRects: DOMRect[] | null;
}

/**
 * 원본 DOM의 텍스트를 문장 단위로 분석하여 오프셋 정보를 관리하는 읽기 전용 모듈.
 * 블록 요소별로 문장 region을 저장한다.
 */
export interface SentenceMap {
  analyze(root: HTMLElement): void;
  reanalyzeBlock(block: HTMLElement): void;
  getRegions(block: HTMLElement): SentenceRegion[] | undefined;
  getBlocks(): Set<HTMLElement>;
  invalidateRects(): void;
  computeRects(block: HTMLElement): void;
  hitTest(x: number, y: number): { block: HTMLElement; regionIndex: number } | null;
  clear(): void;
}

/** 텍스트 노드가 속한 콘텐츠 블록을 찾는다. 콘텐츠 영역 밖이거나 유효하지 않으면 null. */
const findContentBlock = (textNode: Text): HTMLElement | null => {
  const parent = textNode.parentElement;
  if (!parent) return null;
  if (!isArticleContent(parent)) return null;

  const block = getClosestBlock(parent);
  if (!block || block === document.body) return null;

  return block;
};

/** 단일 텍스트 노드를 문장 단위로 분할하여 SentenceRegion 배열을 생성한다. */
const createRegionsFromTextNode = (textNode: Text): SentenceRegion[] => {
  const text = textNode.textContent ?? '';
  const sentences = segmentSentences(text);

  let offset = 0;
  return sentences.map((sentence) => {
    const region: SentenceRegion = {
      textNode,
      startOffset: offset,
      endOffset: offset + sentence.length,
      cachedRects: null,
    };
    offset += sentence.length;
    return region;
  });
};

/** caret 오프셋이 region의 범위 안에 있는지 확인한다. */
const containsOffset = (region: SentenceRegion, offset: number): boolean => {
  return offset >= region.startOffset && offset < region.endOffset;
};

/** 원본 DOM의 텍스트를 문장 단위로 분석하여 오프셋 정보를 저장한다. */
export const createSentenceMap = (): SentenceMap => {
  const blockRegions = new Map<HTMLElement, SentenceRegion[]>();
  let analyzedBlocks = new WeakSet<HTMLElement>();

  /** 텍스트 노드를 콘텐츠 영역 내 블록 단위로 그룹화한다. 이미 분석한 블록은 제외. */
  const groupTextNodesByBlock = (textNodes: Text[]): Map<HTMLElement, Text[]> => {
    const groups = new Map<HTMLElement, Text[]>();

    for (const textNode of textNodes) {
      const block = findContentBlock(textNode);
      if (!block || analyzedBlocks.has(block)) continue;

      if (!groups.has(block)) {
        groups.set(block, []);
      }
      groups.get(block)!.push(textNode);
    }

    return groups;
  };

  /** 블록별 텍스트 노드로부터 region을 생성하고 등록한다. */
  const registerBlocks = (blockTextNodes: Map<HTMLElement, Text[]>): void => {
    for (const [block, textNodes] of blockTextNodes) {
      analyzedBlocks.add(block);

      const regions = textNodes.flatMap(createRegionsFromTextNode);
      if (regions.length > 0) {
        blockRegions.set(block, regions);
      }
    }
  };

  /**
   * root 하위의 텍스트 노드를 블록 단위로 그룹화하고 문장별 오프셋을 계산한다.
   * 이미 분석한 블록은 스킵하며, 콘텐츠 영역(article, main 등) 내부만 처리한다.
   */
  const analyze = (root: HTMLElement): void => {
    const textNodes = extractTextNodes(root);
    const blockTextNodes = groupTextNodesByBlock(textNodes);
    registerBlocks(blockTextNodes);
  };

  /**
   * 블록의 기존 분석 데이터를 삭제하고 다시 분석한다.
   * spacer 삽입 등으로 텍스트 노드가 변경된 후 호출한다.
   */
  const reanalyzeBlock = (block: HTMLElement): void => {
    blockRegions.delete(block);

    const textNodes = extractTextNodes(block);
    const regions = textNodes.flatMap(createRegionsFromTextNode);
    if (regions.length > 0) {
      blockRegions.set(block, regions);
    }
  };

  /** 블록에 속한 문장 region 배열을 반환한다. 분석되지 않은 블록은 undefined. */
  const getRegions = (block: HTMLElement): SentenceRegion[] | undefined => {
    return blockRegions.get(block);
  };

  /** 분석된 모든 블록 요소의 Set을 반환한다. */
  const getBlocks = (): Set<HTMLElement> => {
    return new Set(blockRegions.keys());
  };

  /** 모든 region의 cachedRects를 null로 리셋한다. 스크롤/리사이즈 후 호출. */
  const invalidateRects = (): void => {
    for (const regions of blockRegions.values()) {
      for (const region of regions) {
        region.cachedRects = null;
      }
    }
  };

  /** Range.getClientRects()로 블록 내 각 region의 뷰포트 좌표를 계산하여 캐싱한다. */
  const computeRects = (block: HTMLElement): void => {
    const regions = blockRegions.get(block);
    if (!regions) return;

    for (const region of regions) {
      const range = document.createRange();
      range.setStart(region.textNode, region.startOffset);
      range.setEnd(region.textNode, region.endOffset);
      region.cachedRects = Array.from(range.getClientRects());
    }
  };

  /**
   * 뷰포트 좌표 (x, y)에 해당하는 문장 region을 찾는다.
   * caretRangeFromPoint로 텍스트 노드/오프셋을 구한 뒤 region과 매칭한다.
   */
  const hitTest = (
    x: number,
    y: number,
  ): { block: HTMLElement; regionIndex: number } | null => {
    const caretRange = document.caretRangeFromPoint(x, y);
    if (!caretRange) return null;

    const { startContainer, startOffset } = caretRange;
    if (startContainer.nodeType !== Node.TEXT_NODE) return null;

    for (const [block, regions] of blockRegions) {
      const regionIndex = regions.findIndex(
        (region) =>
          region.textNode === startContainer && containsOffset(region, startOffset),
      );
      if (regionIndex !== -1) return { block, regionIndex };
    }

    return null;
  };

  /** 모든 분석 데이터를 초기화한다. 비활성화 시 호출. */
  const clear = (): void => {
    blockRegions.clear();
    analyzedBlocks = new WeakSet();
  };

  return {
    analyze,
    reanalyzeBlock,
    getRegions,
    getBlocks,
    invalidateRects,
    computeRects,
    hitTest,
    clear,
  };
};
