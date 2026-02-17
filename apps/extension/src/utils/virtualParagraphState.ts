/**
 * 하나의 가상 문단이 차지하는 문장 범위.
 * SentenceRegion 배열의 인덱스를 [startIndex, endIndex) 반개구간으로 표현한다.
 *
 * @example
 * // 문장 5개인 블록에서 인덱스 2에서 분리하면:
 * // VP1: { startIndex: 0, endIndex: 2 }  → 문장 0, 1
 * // VP2: { startIndex: 2, endIndex: 5 }  → 문장 2, 3, 4
 */
interface VirtualParagraph {
  startIndex: number;
  endIndex: number;
}

/**
 * 블록별 가상 문단 분리 상태를 관리하는 순수 데이터 구조.
 *
 * SentenceMap이 블록 내 문장을 분석한 뒤, 사용자가 클릭으로 문단을 나누면
 * 이 모듈이 분리 지점(sentenceIndex)을 기록한다.
 * OverlayRenderer는 이 분리 정보를 참조하여 포커스 영역의 범위를 결정한다.
 *
 * ```
 * SentenceMap.analyze()        → 블록별 SentenceRegion[] 생성
 *       ↓
 * VirtualParagraphState.addSplit() → 분리 인덱스 기록
 *       ↓
 * VirtualParagraphState.getVirtualParagraphs() → VirtualParagraph[] 범위 반환
 *       ↓
 * OverlayRenderer.renderBlur() → 해당 범위의 rects로 블러 hole 렌더링
 * ```
 */
export interface VirtualParagraphState {
  addSplit(block: HTMLElement, sentenceIndex: number): void;
  getVirtualParagraphs(block: HTMLElement, totalSentences: number): VirtualParagraph[];
  getAllSplits(): { block: HTMLElement; sentenceIndex: number }[];
  clearAll(): void;
}

/**
 * 가상 문단 분리 상태를 관리하는 순수 데이터 구조.
 * 원본 DOM을 변경하지 않고, 어떤 블록의 몇 번째 문장 앞에서 분리할지를 기록한다.
 */
export const createVirtualParagraphState = (): VirtualParagraphState => {
  const splits = new Map<HTMLElement, Set<number>>();

  /**
   * 블록의 특정 문장 인덱스에 분리 지점을 추가한다.
   * 인덱스 0은 무시한다 (첫 문장 앞에서 분리하는 것은 무의미).
   */
  const addSplit = (block: HTMLElement, sentenceIndex: number): void => {
    if (sentenceIndex === 0) return;

    if (!splits.has(block)) {
      splits.set(block, new Set());
    }
    splits.get(block)!.add(sentenceIndex);
  };

  /**
   * 블록의 분리 지점들을 기준으로 가상 문단 범위 배열을 반환한다.
   * 각 범위는 [startIndex, endIndex) 형태이다.
   *
   * @example
   * // 문장 5개, 인덱스 2에서 분리
   * getVirtualParagraphs(block, 5)
   * // → [{ startIndex: 0, endIndex: 2 }, { startIndex: 2, endIndex: 5 }]
   */
  const getVirtualParagraphs = (
    block: HTMLElement,
    totalSentences: number,
  ): VirtualParagraph[] => {
    const blockSplits = splits.get(block);
    if (!blockSplits || blockSplits.size === 0) {
      return [{ startIndex: 0, endIndex: totalSentences }];
    }

    const sorted = Array.from(blockSplits).sort((a, b) => a - b);
    const result: VirtualParagraph[] = [];
    let start = 0;

    for (const splitIndex of sorted) {
      result.push({ startIndex: start, endIndex: splitIndex });
      start = splitIndex;
    }
    result.push({ startIndex: start, endIndex: totalSentences });

    return result;
  };

  /**
   * 모든 블록의 분리 정보를 평탄화하여 반환한다.
   */
  const getAllSplits = (): { block: HTMLElement; sentenceIndex: number }[] => {
    const result: { block: HTMLElement; sentenceIndex: number }[] = [];
    for (const [block, indices] of splits) {
      for (const sentenceIndex of indices) {
        result.push({ block, sentenceIndex });
      }
    }
    return result;
  };

  /**
   * 모든 분리 데이터를 초기화한다.
   */
  const clearAll = (): void => {
    splits.clear();
  };

  return { addSplit, getVirtualParagraphs, getAllSplits, clearAll };
};
