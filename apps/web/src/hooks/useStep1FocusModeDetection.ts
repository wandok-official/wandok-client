import { useEffect, useRef } from 'react';

const WANDOK_TEXT_WRAPPER_CLASS = 'wandok-text-wrapper';
const STEP1_SELECTOR = 'article[data-guide-step="1"]';

/**
 * 다른 요소를 호버하여 포커스 모드 체험 전 완료 처리가 되는 것을 방지하기 위한 필터링 함수
 */
const isInsideStep1Article = (element: Element): boolean => {
  return element.closest(STEP1_SELECTOR) !== null;
};

/**
 * wrapper 요소들에 hover 이벤트 리스너를 추가하는 함수를 생성
 */
const createHoverListenerAdder = (onHover: () => void) => {
  return (wrappers: NodeListOf<Element> | Element[]) => {
    wrappers.forEach((wrapper) => {
      if (isInsideStep1Article(wrapper)) {
        wrapper.addEventListener('mouseenter', onHover, { once: true });
      }
    });
  };
};

/**
 * 동적으로 추가되는 새 wrapper 요소들을 감지하여 리스너를 등록하는 MutationObserver 콜백 생성
 */
const createNewNodeHandler = (addHoverListeners: (wrappers: Element[]) => void) => {
  return (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const element = node as HTMLElement;

        if (element.classList?.contains(WANDOK_TEXT_WRAPPER_CLASS)) {
          addHoverListeners([element]);
        }

        const innerWrappers = element.querySelectorAll?.(`.${WANDOK_TEXT_WRAPPER_CLASS}`);
        if (innerWrappers) {
          addHoverListeners(Array.from(innerWrappers));
        }
      });
    });
  };
};

/**
 * Step 1: 포커스 모드 체험 감지
 * 사용자가 Step 1 영역 내 텍스트에 마우스를 올리면 완료 처리
 */
export const useStep1FocusModeDetection = (
  isCompleted: boolean,
  onComplete: () => void,
) => {
  const focusDetected = useRef(false);

  useEffect(() => {
    if (isCompleted) return;

    const handleMouseEnter = () => {
      if (!focusDetected.current) {
        focusDetected.current = true;
        onComplete();
      }
    };

    const addHoverListeners = createHoverListenerAdder(handleMouseEnter);
    const handleNewNodes = createNewNodeHandler(addHoverListeners);

    const existingWrappers = document.querySelectorAll(
      `${STEP1_SELECTOR} .${WANDOK_TEXT_WRAPPER_CLASS}`,
    );
    addHoverListeners(existingWrappers);

    const observer = new MutationObserver(handleNewNodes);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isCompleted, onComplete]);
};
