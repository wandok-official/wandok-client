import { vi } from 'vitest';

/**
 * window.getSelection mock 생성
 */
export const createMockSelection = (options: {
  text?: string;
  rangeCount?: number;
  range?: Range | null;
} = {}): Selection => {
  const { text = '', rangeCount = 1, range = null } = options;

  return {
    toString: vi.fn(() => text),
    rangeCount,
    getRangeAt: vi.fn((index: number) => {
      if (index === 0 && range) return range;
      throw new Error('Invalid range index');
    }),
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
    collapse: vi.fn(),
    isCollapsed: text === '',
    anchorNode: null,
    focusNode: null,
    anchorOffset: 0,
    focusOffset: 0,
    type: text ? 'Range' : 'None',
    extend: vi.fn(),
    setBaseAndExtent: vi.fn(),
    selectAllChildren: vi.fn(),
    deleteFromDocument: vi.fn(),
    containsNode: vi.fn(() => false),
    collapseToStart: vi.fn(),
    collapseToEnd: vi.fn(),
    empty: vi.fn(),
    setPosition: vi.fn(),
    modify: vi.fn(),
    direction: 'none' as const,
    getComposedRanges: vi.fn(() => []),
  } as unknown as Selection;
};

/**
 * Range 객체 생성 헬퍼
 */
export const createRangeFromText = (
  container: HTMLElement,
  startOffset: number,
  endOffset: number,
): Range | null => {
  const textNode = container.firstChild;
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  const range = document.createRange();
  range.setStart(textNode, startOffset);
  range.setEnd(textNode, endOffset);
  return range;
};

/**
 * 스크롤 속성 mock
 */
export const mockScrollProperties = (options: {
  scrollY?: number;
  scrollHeight?: number;
  innerHeight?: number;
} = {}): void => {
  const { scrollY = 0, scrollHeight = 2000, innerHeight = 800 } = options;

  Object.defineProperty(window, 'scrollY', {
    value: scrollY,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(window, 'innerHeight', {
    value: innerHeight,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
};

/**
 * getBoundingClientRect mock이 포함된 엘리먼트 생성
 */
export const createMockElement = (
  tagName: string = 'div',
  rect: Partial<DOMRect> = {},
): HTMLElement => {
  const element = document.createElement(tagName);

  element.getBoundingClientRect = vi.fn(() => ({
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...rect,
  }));

  return element;
};

/**
 * Shadow DOM 호스트 생성
 */
export const createShadowHost = (id = 'test-shadow-host'): {
  host: HTMLElement;
  shadowRoot: ShadowRoot;
} => {
  const host = document.createElement('div');
  host.id = id;
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  return { host, shadowRoot };
};

/**
 * Shadow DOM 호스트 정리
 */
export const cleanupShadowHost = (hostId = 'test-shadow-host'): void => {
  const host = document.getElementById(hostId);
  if (host) {
    host.remove();
  }
};

/**
 * Shadow DOM 내부 요소 쿼리
 */
export const queryShadow = <T extends Element = Element>(
  shadowRoot: ShadowRoot,
  selector: string,
): T | null => {
  return shadowRoot.querySelector<T>(selector);
};

/**
 * Shadow DOM 내부 모든 요소 쿼리
 */
export const queryShadowAll = <T extends Element = Element>(
  shadowRoot: ShadowRoot,
  selector: string,
): NodeListOf<T> => {
  return shadowRoot.querySelectorAll<T>(selector);
};
