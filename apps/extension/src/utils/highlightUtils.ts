import { HIGHLIGHT } from '../config/constants';
import type { Position } from '../types/position';

/**
 * 하이라이트 DOM 조작 유틸리티 함수들
 */

/**
 * 하이라이트 요소를 제거하고 내부 노드를 그대로 복원
 * @param highlightedElement - 제거할 하이라이트 span 요소
 */
export function removeHighlight(highlightedElement: HTMLElement): void {
  highlightedElement.replaceWith(...Array.from(highlightedElement.childNodes));
}

/**
 * 선택 영역(Range)을 하이라이트 span으로 감싸기
 * @param range - 하이라이트를 적용할 Range 객체
 * @returns 생성된 하이라이트 span 요소, 실패 시 null
 */
export function createHighlight(range: Range): HTMLElement | null {
  const highlightSpan = document.createElement('span');
  highlightSpan.classList.add(HIGHLIGHT.CLASS_NAME);
  
  try {
    range.surroundContents(highlightSpan);
    return highlightSpan;
  } catch (e) {
    // surroundContents가 실패할 수 있는 경우 (여러 노드에 걸쳐 선택된 경우 등)
    console.warn('하이라이트 적용 실패:', e);
    return null;
  }
}

/**
 * 하이라이트 요소의 화면상 위치를 계산
 * @param element - 위치를 계산할 하이라이트 요소
 * @returns 화면상의 x, y 좌표
 */
export function getHighlightPosition(element: HTMLElement): Position {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
  };
}
