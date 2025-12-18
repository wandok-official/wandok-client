import { extractTextNodes } from './extractTextNodes';

const initFocusMode = () => {
  // 1. 텍스트 노드 추출
  const textNodes = extractTextNodes(document.body);

  // 블러 처리를 제어할 '문단(블록)' 요소들을 저장할 Set
  const allBlockElements = new Set<HTMLElement>();

  // 2. 텍스트 노드를 <span> 태그로 감싸기 (Wrapping)
  textNodes.forEach((textNode) => {
    // 2-1. 텍스트 노드의 부모(문단 역할) 찾기
    const blockElement = textNode.parentElement?.closest(
      'p, div, li, h1, h2, h3, h4, h5, h6, section, article, blockquote'
    ) as HTMLElement;

    // 유효한 문단 요소라면 관리 대상에 추가
    if (blockElement && blockElement !== document.body) {
      allBlockElements.add(blockElement);
    } else {
      // 문단에 속하지 않는 텍스트라면 스킵
      return;
    }

    // 2-2. 텍스트 노드를 <span>으로 교체
    // 이렇게 하면 '박스 영역'이 아닌 '글자 영역'에만 이벤트를 걸 수 있습니다.
    const wrapperSpan = document.createElement('span');
    wrapperSpan.textContent = textNode.textContent;
    wrapperSpan.classList.add('wandok-text-wrapper');

    // 기존 텍스트 노드를 새로 만든 span으로 교체
    textNode.parentNode?.replaceChild(wrapperSpan, textNode);

    // 3. 이벤트 리스너 등록 (<span>에 등록)

    // 마우스가 '글자' 위에 올라갔을 때
    wrapperSpan.addEventListener('mouseenter', () => {
      allBlockElements.forEach((el) => {
        /**
         * 현재 호버된 문단(blockElement)과 구조적으로 연관된 요소인지 판별하여 블러 여부를 결정합니다.
         * 부모가 블러 처리되면 자식도 안 보이고, 자식이 블러 처리되면 내부 내용이 안 보이기 때문에
         * 연관된 계층 구조(조상, 자손)를 모두 선명하게 유지해야 합니다.
         *
         * @condition 1. (Self) el === blockElement
         *    - 현재 호버된 문단 그 자체
         * @condition 2. (Ancestor) el.contains(blockElement)
         *    - 현재 문단을 감싸고 있는 상위 요소 (이 요소가 흐려지면 내부의 현재 문단도 흐려짐)
         * @condition 3. (Descendant) blockElement.contains(el)
         *    - 현재 문단 안에 포함된 하위 요소 (현재 문단은 선명한데 내부 글자가 흐려지면 안 됨)
         */
        const isRelated =
          el === blockElement ||
          el.contains(blockElement) ||
          blockElement.contains(el);

        if (isRelated) {
          el.classList.remove('blur');
        } else {
          el.classList.add('blur');
        }
      });
    });

    // 마우스가 '글자'에서 벗어났을 때
    wrapperSpan.addEventListener('mouseleave', () => {
      // 모든 블러 효과 즉시 제거 (초기화)
      allBlockElements.forEach((el) => {
        el.classList.remove('blur');
      });
    });
  });
};

initFocusMode();
