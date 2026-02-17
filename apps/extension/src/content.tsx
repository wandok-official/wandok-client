import { createRoot } from 'react-dom/client';

import contentCss from '../public/content.css?inline';
import { App } from './components/App';
import { BLOCK_SELECTOR } from './config/constants';
import { applyBlurEffect } from './utils/applyBlurEffect';
import { extractTextNodes } from './utils/extractTextNodes';
import { restoreSplitParagraphs } from './utils/restoreSplitParagraphs';
import { segmentSentences } from './utils/segmentSentences';
import { splitParagraph } from './utils/splitParagraph';

interface StorageData {
  wandokEnabled?: boolean;
}

// 관리 대상 문단들을 저장할 Set
const allBlockElements = new Set<HTMLElement>();

// 이미 처리된 텍스트 노드를 추적하여 중복 처리 방지
const processedNodes = new WeakSet<Node>();

let isEnabled = false;

/**
 * 특정 요소의 가장 가까운 문단(Block) 요소를 찾는 헬퍼 함수
 */
const getClosestBlock = (el: HTMLElement): HTMLElement | null => {
  return el.closest(BLOCK_SELECTOR) as HTMLElement | null;
};

/**
 * 화이트리스트: 본문 콘텐츠 영역
 *
 * Brunch: .wrap_body, #ArticleView
 * Velog: .atom-one
 */
const CONTENT_SELECTORS =
  'article, main, [role="main"], .post-content, .article-body, ' +
  '.wrap_body, #ArticleView, .atom-one';

/**
 * 블랙리스트: 인터랙티브/동적 요소
 */
const EXCLUDED_SELECTORS = 'button, a, [onclick], [role="button"], nav, header, footer';

/**
 * 요소가 처리 대상인지 확인하는 헬퍼 함수
 * - 본문 콘텐츠 영역 안에 있어야 함
 * - 인터랙티브 요소 안에 있으면 제외
 */
const isArticleContent = (element: HTMLElement): boolean => {
  if (!element.closest(CONTENT_SELECTORS)) return false;

  if (element.closest(EXCLUDED_SELECTORS)) return false;

  return true;
};

/**
 * 텍스트 노드를 문장 단위로 분리하고 이벤트 핸들러를 등록하는 함수
 */
const processTextNode = (textNode: Node) => {
  // 이미 처리된 노드는 건너뜀
  if (processedNodes.has(textNode)) return;
  processedNodes.add(textNode);

  const initialParent = getClosestBlock(textNode.parentElement as HTMLElement);
  if (!initialParent || initialParent === document.body) return;

  // Shadow DOM 내부의 요소는 처리하지 않음
  if (initialParent.closest('#wandok-shadow-host')) return;

  // 본문 콘텐츠 영역 외의 요소는 처리하지 않음
  if (!isArticleContent(textNode.parentElement as HTMLElement)) return;

  allBlockElements.add(initialParent);

  const sentences = segmentSentences(textNode.textContent || '');
  const fragment = document.createDocumentFragment();

  sentences.forEach((sentenceText) => {
    const sentenceSpan = document.createElement('span');
    sentenceSpan.textContent = sentenceText;
    sentenceSpan.classList.add('wandok-text-wrapper');

    // [기능 1] 클릭 시 문단 분리
    sentenceSpan.addEventListener('click', (e) => {
      if (!isEnabled) return;
      e.stopPropagation();

      // 1. 문단 분리 실행 (이 과정에서 sentenceSpan의 부모가 바뀜)
      splitParagraph(sentenceSpan);

      // 2. 분리되어 새로 생성된 문단을 관리 대상 Set에 추가
      const newParent = getClosestBlock(sentenceSpan);
      if (newParent) {
        allBlockElements.add(newParent);
      }
    });

    // [기능 2] 마우스 호버 시 블러 처리
    sentenceSpan.addEventListener('mouseenter', () => {
      if (!isEnabled) return;
      // ★ 핵심 수정: 고정된 변수가 아니라, 호버 시점의 "현재 부모"를 실시간으로 찾음
      const currentBlock = getClosestBlock(sentenceSpan);
      if (currentBlock) {
        applyBlurEffect(currentBlock, allBlockElements, true);
      }
    });

    sentenceSpan.addEventListener('mouseleave', () => {
      if (!isEnabled) return;
      const currentBlock = getClosestBlock(sentenceSpan);
      if (currentBlock) {
        applyBlurEffect(currentBlock, allBlockElements, false);
      }
    });

    fragment.appendChild(sentenceSpan);
  });

  textNode.parentNode?.replaceChild(fragment, textNode);
};

/**
 * 요소 내의 모든 텍스트 노드를 처리하는 함수
 */
const processElement = (element: HTMLElement) => {
  // 이미 처리된 wandok wrapper는 건너뜀
  if (element.classList?.contains('wandok-text-wrapper')) return;

  const textNodes = extractTextNodes(element);
  textNodes.forEach(processTextNode);
};

/**
 * 모든 블러 효과 제거
 */
const clearAllBlurEffects = () => {
  allBlockElements.forEach((element) => {
    element.classList.remove('wandok-blur');
  });
};

const initFocusMode = () => {
  /* Shadow DOM Setup for React Components */
  const shadowHost = document.createElement('div');
  shadowHost.id = 'wandok-shadow-host';

  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  const shadowStyle = document.createElement('style');
  shadowStyle.textContent = `
    :host {
      all: initial;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
    }

    ${contentCss}
  `;
  shadowRoot.appendChild(shadowStyle);

  const rootElement = document.createElement('div');
  shadowRoot.appendChild(rootElement);

  const root = createRoot(rootElement);
  root.render(<App />);

  const updateEnabledState = (enabled: boolean) => {
    isEnabled = enabled;
    if (enabled) {
      if (!shadowHost.parentNode) {
        document.body.appendChild(shadowHost);
      }
    } else {
      shadowHost.remove();
    }
    window.dispatchEvent(new CustomEvent(enabled ? 'wandok:activated' : 'wandok:deactivated'));
  };

  chrome.storage.local.get('wandokEnabled', (result: StorageData) => {
    updateEnabledState(result.wandokEnabled ?? false);
  });

  chrome.storage.onChanged.addListener((
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName,
  ) => {
    if (areaName === 'local' && changes.wandokEnabled) {
      const enabled = (changes.wandokEnabled.newValue as boolean | undefined) ?? false;
      updateEnabledState(enabled);

      if (!enabled) {
        clearAllBlurEffects();
        restoreSplitParagraphs(allBlockElements);
      }
    }
  });

  /* Text Blur + Split Paragraph Logic */
  // 초기 페이지 로드 시 텍스트 처리
  processElement(document.body);

  /* MutationObserver: SPA에서 동적으로 추가되는 콘텐츠 처리 */
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          // Shadow DOM 내부 요소는 무시
          if (element.id === 'wandok-shadow-host') return;
          if (element.closest('#wandok-shadow-host')) return;

          // wandok-split-paragraph로 생성된 요소는 무시 (이미 처리된 span 포함)
          if (element.classList?.contains('wandok-split-paragraph')) return;

          // 이미 wandok-text-wrapper를 포함한 요소는 무시
          if (element.classList?.contains('wandok-text-wrapper')) return;
          if (element.querySelector('.wandok-text-wrapper')) return;

          // 새로 추가된 요소 내의 텍스트 처리
          processElement(element);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

initFocusMode();

