import { type SentenceMap } from './sentenceMap';

/**
 * InteractionHandler가 감지한 사용자 동작에 대응하는 콜백.
 * content.tsx가 각 콜백을 구현하여 블러 렌더링·문단 분리 등을 수행한다.
 */
export interface InteractionHandlerCallbacks {
  onHover(block: HTMLElement, regionIndex: number): void;
  onHoverEnd(): void;
  onSplit(block: HTMLElement, regionIndex: number): void;
}

/**
 * document 레벨에서 마우스 이벤트를 감지하여 문장 단위 인터랙션을 처리하는 모듈.
 *
 * 개별 요소에 이벤트 리스너를 등록하지 않고, document에 mousemove/click 리스너를
 * 하나씩만 등록한다. mousemove는 requestAnimationFrame으로 스로틀링하여
 * SentenceMap.hitTest()로 마우스 아래의 문장을 탐색한다.
 *
 * ```
 * 마우스 이동 → hitTest(x, y) → 문장 발견 → onHover(block, regionIndex)
 *                          → 문장 없음 → onHoverEnd()
 *
 * 마우스 클릭 → hitTest(x, y) → 문장 발견 → onSplit(block, regionIndex)
 * ```
 */
export interface InteractionHandler {
  activate(sentenceMap: SentenceMap, callbacks: InteractionHandlerCallbacks): void;
  deactivate(): void;
}

/**
 * document 레벨 mousemove/click 리스너로 사용자 인터랙션을 처리한다.
 * 호스트 DOM의 개별 요소에 이벤트 리스너를 추가하지 않는다.
 */
export const createInteractionHandler = (): InteractionHandler => {
  let mousemoveHandler: ((e: MouseEvent) => void) | null = null;
  let clickHandler: ((e: MouseEvent) => void) | null = null;
  let rafId: number | null = null;

  /**
   * document에 mousemove/click 리스너를 등록한다.
   * mousemove는 requestAnimationFrame으로 스로틀링하여 프레임당 최대 1회 hitTest를 수행한다.
   */
  const activate = (
    sentenceMap: SentenceMap,
    callbacks: InteractionHandlerCallbacks,
  ): void => {
    let pendingEvent: MouseEvent | null = null;

    /** rAF 콜백: 가장 마지막 mousemove 이벤트로 hitTest를 실행한다. */
    const processMouseMove = () => {
      rafId = null;
      if (!pendingEvent) return;

      const result = sentenceMap.hitTest(pendingEvent.clientX, pendingEvent.clientY);
      pendingEvent = null;

      if (result) {
        callbacks.onHover(result.block, result.regionIndex);
      } else {
        callbacks.onHoverEnd();
      }
    };

    mousemoveHandler = (e: MouseEvent) => {
      pendingEvent = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(processMouseMove);
      }
    };

    clickHandler = (e: MouseEvent) => {
      const result = sentenceMap.hitTest(e.clientX, e.clientY);
      if (result) {
        callbacks.onSplit(result.block, result.regionIndex);
      }
    };

    document.addEventListener('mousemove', mousemoveHandler);
    document.addEventListener('click', clickHandler);
  };

  /** 등록된 mousemove/click 리스너를 제거하고 대기 중인 rAF를 취소한다. */
  const deactivate = (): void => {
    if (mousemoveHandler) {
      document.removeEventListener('mousemove', mousemoveHandler);
      mousemoveHandler = null;
    }
    if (clickHandler) {
      document.removeEventListener('click', clickHandler);
      clickHandler = null;
    }
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return { activate, deactivate };
};
