import { useEffect } from 'react';
import { getHighlightPosition } from '../utils/highlightUtils';
import type { Position } from '../types/position';

/**
 * 스크롤 시 하이라이트 요소의 위치를 추적하는 커스텀 훅
 * popover가 하이라이트된 텍스트와 함께 이동하도록 위치를 업데이트함
 * 
 * @param isEnabled - 위치 추적 활성화 여부
 * @param highlightElement - 추적할 하이라이트 요소
 * @param onPositionUpdate - 위치 업데이트 시 호출될 콜백 함수
 */
export const useHighlightScroll = (
  isEnabled: boolean,
  highlightElement: HTMLElement | null,
  onPositionUpdate: (position: Position) => void,
): void => {
  useEffect(() => {
    if (!isEnabled || !highlightElement) return;

    const updatePosition = () => {
      const newPosition = getHighlightPosition(highlightElement);
      onPositionUpdate(newPosition);
    };

    // 스크롤 이벤트 리스너 등록 (capture phase에서 모든 스크롤 이벤트 감지)
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isEnabled, highlightElement, onPositionUpdate]);
};
