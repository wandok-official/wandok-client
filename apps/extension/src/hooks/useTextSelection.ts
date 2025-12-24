import { useEffect } from 'react';
import { removeHighlight, createHighlight, getHighlightPosition } from '../utils/highlightUtils';
import { HIGHLIGHT } from '../config/constants';
import type { Position } from '../types/position';

/**
 * 텍스트 선택 결과 타입
 */
export interface SelectionResult {
  highlight: HTMLElement;
  position: Position;
}

/**
 * 텍스트 선택을 감지하고 하이라이트를 적용하는 커스텀 훅
 * @param onSelectionChange - 텍스트 선택 시 호출될 콜백 함수
 */
export const useTextSelection = (
  onSelectionChange: (result: SelectionResult) => void
): void => {
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.toString().trim() === '') {
        return;
      }

      const prevHighlight = document.querySelector(`.${HIGHLIGHT.CLASS_NAME}`);
      if (prevHighlight) {
        removeHighlight(prevHighlight as HTMLElement);
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const highlightedElement = createHighlight(range);
        
        if (highlightedElement) {
          const position = getHighlightPosition(highlightedElement);
          
          onSelectionChange({
            highlight: highlightedElement,
            position,
          });
        }
        
        selection.removeAllRanges();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onSelectionChange]);
};
