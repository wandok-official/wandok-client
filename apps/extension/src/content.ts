import { extractTextNodes } from './extractTextNodes';
import { segmentSentences } from './segmentSentences';
import { splitParagraph } from './splitParagraph';
import { applyBlurEffect } from './applyBlurEffect';

// 블록 요소를 찾기 위한 셀렉터 정의
const BLOCK_SELECTOR = 'p, div, li, h1, h2, h3, h4, h5, h6, section, article, blockquote';

// 관리 대상 문단들을 저장할 Set
const allBlockElements = new Set<HTMLElement>();

/**
 * 특정 요소의 가장 가까운 문단(Block) 요소를 찾는 헬퍼 함수
 */
const getClosestBlock = (el: HTMLElement) => el.closest(BLOCK_SELECTOR) as HTMLElement;

const initFocusMode = () => {
  const textNodes = extractTextNodes(document.body);

  textNodes.forEach((textNode) => {
    // 초기 텍스트 노드의 부모 확인
    const initialParent = getClosestBlock(textNode.parentElement as HTMLElement);
    if (!initialParent || initialParent === document.body) return;

    allBlockElements.add(initialParent);

    const sentences = segmentSentences(textNode.textContent || '');
    const fragment = document.createDocumentFragment();

    sentences.forEach((sentenceText) => {
      const sentenceSpan = document.createElement('span');
      sentenceSpan.textContent = sentenceText;
      sentenceSpan.classList.add('wandok-text-wrapper');

      // [기능 1] 클릭 시 문단 분리
      sentenceSpan.addEventListener('click', (e) => {
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
        // ★ 핵심 수정: 고정된 변수가 아니라, 호버 시점의 "현재 부모"를 실시간으로 찾음
        const currentBlock = getClosestBlock(sentenceSpan);
        if (currentBlock) {
          applyBlurEffect(currentBlock, allBlockElements, true);
        }
      });

      sentenceSpan.addEventListener('mouseleave', () => {
        const currentBlock = getClosestBlock(sentenceSpan);
        if (currentBlock) {
          applyBlurEffect(currentBlock, allBlockElements, false);
        }
      });

      fragment.appendChild(sentenceSpan);
    });

    textNode.parentNode?.replaceChild(fragment, textNode);
  });
};

initFocusMode();
