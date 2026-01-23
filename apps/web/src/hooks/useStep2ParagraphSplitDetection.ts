import { useEffect, useRef } from 'react';

const WANDOK_TEXT_WRAPPER_CLASS = 'wandok-text-wrapper';
const STEP2_SELECTOR = 'article[data-guide-step="2"]';

/**
 * Step 2: 문단 분리 기능 체험 감지
 * 사용자가 Step 2 영역에서 문단을 분리하면 완료 처리
 */
export const useStep2ParagraphSplitDetection = (
  isCompleted: boolean,
  onComplete: () => void,
) => {
  const splitDetected = useRef(false);

  useEffect(() => {
    if (isCompleted) return;

    const isParagraphWithWrapper = (element: HTMLElement): boolean => {
      return (
        element.tagName === 'P' &&
        element.closest(STEP2_SELECTOR) !== null &&
        element.querySelector(`.${WANDOK_TEXT_WRAPPER_CLASS}`) !== null
      );
    };

    const detectParagraphSplit = (mutations: MutationRecord[]) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;

          const element = node as HTMLElement;
          if (isParagraphWithWrapper(element) && !splitDetected.current) {
            splitDetected.current = true;
            onComplete();
          }
        });
      });
    };

    const observer = new MutationObserver(detectParagraphSplit);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isCompleted, onComplete]);
};
