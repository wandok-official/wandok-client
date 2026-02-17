import { type SentenceMap } from './sentenceMap';
import { type VirtualParagraphState } from './virtualParagraphState';

/**
 * Shadow DOM 내부에 블러 오버레이를 렌더링하는 모듈.
 *
 * 사용자가 읽고 있는 문단(포커스 영역)을 제외한 나머지 화면을 흐리게 처리한다.
 * 원본 DOM에는 어떤 변경도 가하지 않으며, Shadow DOM 내부에서만 동작한다.
 *
 * ```
 * SentenceMap  ──→ 문장별 뷰포트 좌표 제공
 *                     ↓
 * OverlayRenderer ──→ 전체 화면 블러 + clip-path 홀로 포커스 영역 투명 처리
 *                     ↑
 * VirtualParagraphState ──→ 포커스 영역의 문장 범위 제공
 * ```
 */
export interface OverlayRenderer {
  /** Shadow DOM 내부에 오버레이 컨테이너를 생성한다. */
  init(shadowRoot: ShadowRoot): void;
  /** 포커스된 문단을 제외한 나머지 화면에 블러 오버레이를 렌더링한다. */
  renderBlur(
    sentenceMap: SentenceMap,
    state: VirtualParagraphState,
    focusedBlock: HTMLElement | null,
    focusedVPIndex: number | null,
  ): void;
  /** 오버레이를 모두 제거한다. */
  clear(): void;
}

/**
 * Shadow DOM 내부에 블러 오버레이를 렌더링한다.
 * 원본 DOM에는 어떤 변경도 가하지 않는다.
 */
export const createOverlayRenderer = (): OverlayRenderer => {
  let container: HTMLElement | null = null;

  /** Shadow DOM 내부에 fixed 위치의 오버레이 컨테이너를 생성하고 삽입한다. */
  const init = (shadowRoot: ShadowRoot): void => {
    container = document.createElement('div');
    container.className = 'wandok-overlay';
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '2147483646';
    shadowRoot.appendChild(container);
  };

  /**
   * 포커스된 가상 문단의 문장 rect들을 합쳐 바운딩 rect를 계산한다.
   * Virtual Paragraph가 없거나 rect를 계산할 수 없으면 null을 반환한다.
   */
  const getVPRect = (
    sentenceMap: SentenceMap,
    state: VirtualParagraphState,
    block: HTMLElement,
    vpIndex: number | null,
  ): DOMRect | null => {
    const regions = sentenceMap.getRegions(block);
    if (!regions || vpIndex === null) return null;

    const vps = state.getVirtualParagraphs(block, regions.length);
    const focusedVP = vps[vpIndex];
    if (!focusedVP) return null;

    sentenceMap.computeRects(block);

    let minLeft = Infinity;
    let minTop = Infinity;
    let maxRight = -Infinity;
    let maxBottom = -Infinity;
    let hasRects = false;

    for (let i = focusedVP.startIndex; i < focusedVP.endIndex; i++) {
      const region = regions[i];
      if (!region.cachedRects) continue;

      for (const rect of region.cachedRects) {
        minLeft = Math.min(minLeft, rect.left);
        minTop = Math.min(minTop, rect.top);
        maxRight = Math.max(maxRight, rect.right);
        maxBottom = Math.max(maxBottom, rect.bottom);
        hasRects = true;
      }
    }

    if (!hasRects) return null;
    return new DOMRect(minLeft, minTop, maxRight - minLeft, maxBottom - minTop);
  };

  /**
   * 전체 화면에 블러를 적용하되, 포커스된 문단 영역만 clip-path 홀로 투명하게 남긴다.
   * focusedBlock이 null이면 아무것도 렌더링하지 않는다.
   */
  const renderBlur = (
    sentenceMap: SentenceMap,
    state: VirtualParagraphState,
    focusedBlock: HTMLElement | null,
    focusedVPIndex: number | null,
  ): void => {
    if (!container) return;
    container.innerHTML = '';

    if (!focusedBlock) return;

    const holeRect =
      getVPRect(sentenceMap, state, focusedBlock, focusedVPIndex) ??
      focusedBlock.getBoundingClientRect();

    const overlay = document.createElement('div');
    overlay.className = 'wandok-overlay-blur';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backdropFilter = 'blur(15px) brightness(0.7)';
    overlay.style.pointerEvents = 'none';
    overlay.style.clipPath =
      'polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ' +
      `${holeRect.left}px ${holeRect.top}px, ` +
      `${holeRect.left}px ${holeRect.bottom}px, ` +
      `${holeRect.right}px ${holeRect.bottom}px, ` +
      `${holeRect.right}px ${holeRect.top}px, ` +
      `${holeRect.left}px ${holeRect.top}px, ` +
      '0 0)';

    container.appendChild(overlay);
  };

  /** 컨테이너 내부의 모든 오버레이 요소를 제거한다. */
  const clear = (): void => {
    if (!container) return;
    container.innerHTML = '';
  };

  return { init, renderBlur, clear };
};
