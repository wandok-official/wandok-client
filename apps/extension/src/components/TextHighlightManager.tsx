import { useState, useEffect } from 'react';
import { NotePopover } from './NotePopover';

/* Text Highlight on Selection */
export const TextHighlightManager = () => {
  // TODO: 향후 Close 버튼이나 팝오버 외부 클릭 시 하이라이트를 제거하기 위해 사용 예정
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentHighlight, setCurrentHighlight] = useState<HTMLElement | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.toString().trim() === '') {
        return;
      }

      // 이전 하이라이트 제거
      const prevHighlight = document.querySelector('.wandok-highlight');
      if (prevHighlight) {
        const parent = prevHighlight.parentNode;
        const textContent = prevHighlight.textContent;
        if (parent && textContent) {
          const textNode = document.createTextNode(textContent);
          parent.replaceChild(textNode, prevHighlight);
        }
      }

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        const highlightSpan = document.createElement('span');
        highlightSpan.classList.add('wandok-highlight');
        
        try {
          range.surroundContents(highlightSpan);
          
          const rect = highlightSpan.getBoundingClientRect();
          const position = {
            x: rect.left,
            y: rect.top,
          };
          
          setCurrentHighlight(highlightSpan);
          setPopoverPosition(position);
          setIsPopoverOpen(true);
        } catch (e) {
          // surroundContents가 실패할 수 있는 경우 (여러 노드에 걸쳐 선택된 경우 등)
          console.warn('하이라이트 적용 실패:', e);
        }
        
        selection.removeAllRanges();
      }
    };

    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      {isPopoverOpen && (
        <div
          className="wandok-interactive"
          style={{
            position: 'absolute',
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: 'translateY(calc(-100% - 10px))',
            zIndex: 2147483647,
          }}
        >
          <NotePopover />
        </div>
      )}
    </>
  );
};
