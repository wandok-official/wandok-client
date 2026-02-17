import { createShadowHost } from '@test/mocks/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createOverlayRenderer } from '../overlayRenderer';
import { type SentenceMap } from '../sentenceMap';
import { type VirtualParagraphState } from '../virtualParagraphState';

const createMockSentenceMap = (): SentenceMap => ({
  analyze: vi.fn(),
  reanalyzeBlock: vi.fn(),
  getRegions: vi.fn(),
  getBlocks: vi.fn(() => new Set<HTMLElement>()),
  invalidateRects: vi.fn(),
  computeRects: vi.fn(),
  hitTest: vi.fn(),
  clear: vi.fn(),
});

const createMockState = (): VirtualParagraphState => ({
  addSplit: vi.fn(),
  getVirtualParagraphs: vi.fn(() => []),
  getAllSplits: vi.fn(() => []),
  clearAll: vi.fn(),
});

describe('OverlayRenderer', () => {
  let shadowRoot: ShadowRoot;
  let hostId: string;

  beforeEach(() => {
    hostId = 'test-overlay-host';
    const result = createShadowHost(hostId);
    shadowRoot = result.shadowRoot;
  });

  afterEach(() => {
    document.getElementById(hostId)?.remove();
  });

  describe('init', () => {
    it('shadowRoot에 overlay 컨테이너를 생성해야 한다', () => {
      const renderer = createOverlayRenderer();

      renderer.init(shadowRoot);

      const container = shadowRoot.querySelector('.wandok-overlay');
      expect(container).not.toBeNull();
    });

    it('컨테이너가 pointer-events: none 스타일이어야 한다', () => {
      const renderer = createOverlayRenderer();

      renderer.init(shadowRoot);

      const container = shadowRoot.querySelector('.wandok-overlay') as HTMLElement;
      expect(container.style.pointerEvents).toBe('none');
    });
  });

  describe('renderBlur', () => {
    it('focusedBlock이 있으면 블러 오버레이를 생성해야 한다', () => {
      const renderer = createOverlayRenderer();
      renderer.init(shadowRoot);
      const focusedBlock = document.createElement('p');

      renderer.renderBlur(createMockSentenceMap(), createMockState(), focusedBlock, 0);

      const blurDiv = shadowRoot.querySelector('.wandok-overlay-blur') as HTMLElement;
      expect(blurDiv).not.toBeNull();
      expect(blurDiv.style.backdropFilter).toBe('blur(15px) brightness(0.7)');
    });

    it('focusedBlock이 null이면 블러 오버레이를 생성하지 않아야 한다', () => {
      const renderer = createOverlayRenderer();
      renderer.init(shadowRoot);

      renderer.renderBlur(createMockSentenceMap(), createMockState(), null, null);

      const container = shadowRoot.querySelector('.wandok-overlay') as HTMLElement;
      expect(container.children.length).toBe(0);
    });

    it('포커스 영역을 clip-path evenodd polygon으로 제외해야 한다', () => {
      const renderer = createOverlayRenderer();
      renderer.init(shadowRoot);
      const focusedBlock = document.createElement('p');

      renderer.renderBlur(createMockSentenceMap(), createMockState(), focusedBlock, 0);

      const blurDiv = shadowRoot.querySelector('.wandok-overlay-blur') as HTMLElement;
      expect(blurDiv.style.clipPath).toContain('polygon');
      expect(blurDiv.style.clipPath).toContain('evenodd');
    });

    it('연속 호출 시 이전 오버레이를 교체해야 한다', () => {
      const renderer = createOverlayRenderer();
      renderer.init(shadowRoot);
      const focusedBlock = document.createElement('p');

      renderer.renderBlur(createMockSentenceMap(), createMockState(), focusedBlock, 0);
      renderer.renderBlur(createMockSentenceMap(), createMockState(), focusedBlock, 0);

      const container = shadowRoot.querySelector('.wandok-overlay') as HTMLElement;
      expect(container.querySelectorAll('.wandok-overlay-blur').length).toBe(1);
    });

    it('init 전에 호출해도 에러가 없어야 한다', () => {
      const renderer = createOverlayRenderer();
      const focusedBlock = document.createElement('p');

      expect(() =>
        renderer.renderBlur(createMockSentenceMap(), createMockState(), focusedBlock, 0),
      ).not.toThrow();
    });
  });

  describe('clear', () => {
    it('컨테이너 내부의 오버레이를 모두 제거해야 한다', () => {
      const renderer = createOverlayRenderer();
      renderer.init(shadowRoot);
      const focusedBlock = document.createElement('p');
      renderer.renderBlur(createMockSentenceMap(), createMockState(), focusedBlock, 0);

      renderer.clear();

      const container = shadowRoot.querySelector('.wandok-overlay') as HTMLElement;
      expect(container.children.length).toBe(0);
    });

    it('init 전에 호출해도 에러가 없어야 한다', () => {
      const renderer = createOverlayRenderer();

      expect(() => renderer.clear()).not.toThrow();
    });
  });
});
