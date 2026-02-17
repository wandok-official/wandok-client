import { createRoot } from 'react-dom/client';

import contentCss from '../public/content.css?inline';
import { App } from './components/App';
import { createInteractionHandler } from './utils/interactionHandler';
import { createOverlayRenderer } from './utils/overlayRenderer';
import { createSentenceMap } from './utils/sentenceMap';
import { createVirtualParagraphState } from './utils/virtualParagraphState';

interface StorageData {
  wandokEnabled?: boolean;
}

const sentenceMap = createSentenceMap();
const state = createVirtualParagraphState();
const renderer = createOverlayRenderer();
const interaction = createInteractionHandler();

let isEnabled = false;
let focusedBlock: HTMLElement | null = null;
let focusedVPIndex: number | null = null;

/**
 * 블록의 특정 문장 인덱스에 spacer를 삽입하여 시각적으로 문단을 분리한다.
 */
const insertSpacer = (block: HTMLElement, sentenceIndex: number): void => {
  const regions = sentenceMap.getRegions(block);
  if (!regions || sentenceIndex >= regions.length) return;

  const region = regions[sentenceIndex];
  const { textNode, startOffset } = region;

  const secondHalf = textNode.splitText(startOffset);

  const spacer = document.createElement('br');
  spacer.className = 'wandok-spacer';
  secondHalf.parentNode?.insertBefore(spacer, secondHalf);
};

/**
 * 모든 spacer를 제거하고 텍스트 노드를 정규화한다.
 */
const removeAllSpacers = (): void => {
  document.querySelectorAll('.wandok-spacer').forEach((spacer) => {
    const parent = spacer.parentNode;
    spacer.remove();
    parent?.normalize();
  });
};

const initFocusMode = () => {
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

  const activateFeatures = () => {
    renderer.init(shadowRoot);
    sentenceMap.analyze(document.body);

    window.addEventListener('scroll', () => {
      if (focusedBlock) {
        focusedBlock = null;
        focusedVPIndex = null;
        renderer.clear();
      }
    }, { passive: true });

    interaction.activate(sentenceMap, {
      onHover(block, regionIndex) {
        focusedBlock = block;

        const regions = sentenceMap.getRegions(block);
        if (regions) {
          const vps = state.getVirtualParagraphs(block, regions.length);
          focusedVPIndex = vps.findIndex(
            (vp) => regionIndex >= vp.startIndex && regionIndex < vp.endIndex,
          );
        }

        renderer.renderBlur(sentenceMap, state, focusedBlock, focusedVPIndex);
        window.dispatchEvent(new CustomEvent('wandok:focus-hover'));
      },
      onHoverEnd() {
        focusedBlock = null;
        focusedVPIndex = null;
        renderer.clear();
      },
      onSplit(block, regionIndex) {
        state.addSplit(block, regionIndex);
        insertSpacer(block, regionIndex);
        sentenceMap.reanalyzeBlock(block);
        window.dispatchEvent(new CustomEvent('wandok:paragraph-split'));
      },
    });
  };

  const deactivateFeatures = () => {
    interaction.deactivate();
    renderer.clear();
    state.clearAll();
    sentenceMap.clear();
    removeAllSpacers();
    focusedBlock = null;
    focusedVPIndex = null;
  };

  const updateEnabledState = (enabled: boolean) => {
    isEnabled = enabled;
    if (enabled) {
      if (!shadowHost.parentNode) {
        document.body.appendChild(shadowHost);
      }
      activateFeatures();
    } else {
      deactivateFeatures();
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
    }
  });

  const observer = new MutationObserver((mutations) => {
    if (!isEnabled) return;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          if (element.id === 'wandok-shadow-host') return;
          if (element.closest('#wandok-shadow-host')) return;

          sentenceMap.analyze(element);
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
