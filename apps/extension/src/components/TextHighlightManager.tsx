import { useState, useCallback } from 'react';
import { NotePopover } from './NotePopover';
import { POPOVER } from '../config/constants';
import { useTextSelection } from '../hooks/useTextSelection';
import { useClickOutsideClassName } from '../hooks/useClickOutsideClassName';
import { useHighlightScroll } from '../hooks/useHighlightScroll';
import { removeHighlight } from '../utils/highlightUtils';
import type { Position } from '../types/position';

interface TextHighlightManagerProps {
  onHighlightError?: () => void;
}

/* Text Highlight on Selection */
export const TextHighlightManager = ({ onHighlightError }: TextHighlightManagerProps) => {
  const [currentHighlight, setCurrentHighlight] = useState<HTMLElement | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<Position>({ x: 0, y: 0 });

  const handleClose = useCallback(() => {
    setIsPopoverOpen(false);

    // 현재 하이라이트 제거
    if (currentHighlight) {
      removeHighlight(currentHighlight);
      setCurrentHighlight(null);
    }
  }, [currentHighlight]);

  const handleSubmit = (_noteText: string) => {
    handleClose();
  };

  const handleSelectionChange = useCallback(
    ({ highlight, position }: { highlight: HTMLElement; position: Position }) => {
      setCurrentHighlight(highlight);
      setPopoverPosition(position);
      setIsPopoverOpen(true);
    },
    [],
  );

  // 텍스트 하이라이트 시 팝오버 표시
  useTextSelection(handleSelectionChange, onHighlightError);

  // 스크롤 시 팝오버 위치 업데이트 (하이라이트와 함께 이동)
  useHighlightScroll(isPopoverOpen, currentHighlight, setPopoverPosition);

  // 팝오버 외부 클릭 감지
  useClickOutsideClassName(isPopoverOpen, POPOVER.INTERACTIVE_CLASS, handleClose);

  return (
    <>
      {isPopoverOpen && (
        <div
          className={POPOVER.INTERACTIVE_CLASS}
          style={{
            position: 'absolute',
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: `translateY(${POPOVER.OFFSET_Y})`,
            zIndex: POPOVER.Z_INDEX,
          }}
        >
          <NotePopover
            onClose={handleClose}
            onSubmit={handleSubmit}
            username="테스트 유저"
          />
        </div>
      )}
    </>
  );
};
