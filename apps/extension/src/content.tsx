import { createRoot } from 'react-dom/client';
import { PROGRESS_BAR } from './config/constants';
import { extractTextNodes } from './utils/extractTextNodes';
import { App } from './components/App';
import contentCss from '../public/content.css?inline';

const initFocusMode = () => {
  /* Progress Bar */
  document.body.style.paddingRight = PROGRESS_BAR.WIDTH;
  document.body.style.boxSizing = 'border-box';

  const shadowHost = document.createElement('div');
  shadowHost.id = 'wandok-shadow-host';
  document.body.appendChild(shadowHost);

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
    
    .wandok-interactive {
      pointer-events: auto;
    }
    
    ${contentCss}
  `;
  shadowRoot.appendChild(shadowStyle);

  const rootElement = document.createElement('div');
  shadowRoot.appendChild(rootElement);

  const root = createRoot(rootElement);
  root.render(<App />);

  /* Text Blur + Split Paragraph */
  const textNodes = extractTextNodes(document.body);

  const allBlockElements = new Set<HTMLElement>();

  textNodes.forEach((textNode) => {
    const blockElement = textNode.parentElement?.closest(
      'p, div, li, h1, h2, h3, h4, h5, h6, section, article, blockquote'
    ) as HTMLElement;

    if (blockElement && blockElement !== document.body) {
      allBlockElements.add(blockElement);
    } else {
      return;
    }

    const wrapperSpan = document.createElement('span');
    wrapperSpan.textContent = textNode.textContent;
    wrapperSpan.classList.add('wandok-text-wrapper');

    textNode.parentNode?.replaceChild(wrapperSpan, textNode);

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
          el.classList.remove('wandok-blur');
        } else {
          el.classList.add('wandok-blur');
        }
      });
    });

    wrapperSpan.addEventListener('mouseleave', () => {
      allBlockElements.forEach((el) => {
        el.classList.remove('wandok-blur');
      });
    });
  });
};

initFocusMode();
