import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInteractionHandler, type InteractionHandlerCallbacks } from '../interactionHandler';
import { type SentenceMap } from '../sentenceMap';

const createMockSentenceMap = (
  hitTestResult: { block: HTMLElement; regionIndex: number } | null = null,
): SentenceMap => ({
  analyze: vi.fn(),
  reanalyzeBlock: vi.fn(),
  getRegions: vi.fn(),
  getBlocks: vi.fn(() => new Set<HTMLElement>()),
  invalidateRects: vi.fn(),
  computeRects: vi.fn(),
  hitTest: vi.fn(() => hitTestResult),
  clear: vi.fn(),
});

const createMockCallbacks = (): InteractionHandlerCallbacks => ({
  onHover: vi.fn(),
  onHoverEnd: vi.fn(),
  onSplit: vi.fn(),
});

describe('InteractionHandler', () => {
  let block: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    block = document.createElement('p');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('activate', () => {
    it('document에 mousemove, click 리스너를 등록해야 한다', () => {
      const addSpy = vi.spyOn(document, 'addEventListener');
      const handler = createInteractionHandler();

      handler.activate(createMockSentenceMap(), createMockCallbacks());

      const eventTypes = addSpy.mock.calls.map(([type]) => type);
      expect(eventTypes).toContain('mousemove');
      expect(eventTypes).toContain('click');

      handler.deactivate();
      addSpy.mockRestore();
    });

    it('mousemove 시 hitTest 결과가 있으면 onHover를 호출해야 한다', () => {
      const hitResult = { block, regionIndex: 1 };
      const mockMap = createMockSentenceMap(hitResult);
      const callbacks = createMockCallbacks();
      const handler = createInteractionHandler();
      handler.activate(mockMap, callbacks);

      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 50 }));
      vi.advanceTimersByTime(16);

      expect(callbacks.onHover).toHaveBeenCalledWith(block, 1);

      handler.deactivate();
    });

    it('mousemove 시 hitTest 결과가 없으면 onHoverEnd를 호출해야 한다', () => {
      const mockMap = createMockSentenceMap(null);
      const callbacks = createMockCallbacks();
      const handler = createInteractionHandler();
      handler.activate(mockMap, callbacks);

      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 50 }));
      vi.advanceTimersByTime(16);

      expect(callbacks.onHoverEnd).toHaveBeenCalled();

      handler.deactivate();
    });

    it('click 시 hitTest 결과가 있으면 onSplit을 호출해야 한다', () => {
      const hitResult = { block, regionIndex: 2 };
      const mockMap = createMockSentenceMap(hitResult);
      const callbacks = createMockCallbacks();
      const handler = createInteractionHandler();
      handler.activate(mockMap, callbacks);

      document.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 50 }));

      expect(callbacks.onSplit).toHaveBeenCalledWith(block, 2);

      handler.deactivate();
    });

    it('click 시 hitTest 결과가 없으면 onSplit을 호출하지 않아야 한다', () => {
      const mockMap = createMockSentenceMap(null);
      const callbacks = createMockCallbacks();
      const handler = createInteractionHandler();
      handler.activate(mockMap, callbacks);

      document.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 50 }));

      expect(callbacks.onSplit).not.toHaveBeenCalled();

      handler.deactivate();
    });

    it('같은 프레임 내 여러 mousemove는 마지막 이벤트만 처리해야 한다', () => {
      const hitResult = { block, regionIndex: 0 };
      const mockMap = createMockSentenceMap(hitResult);
      const callbacks = createMockCallbacks();
      const handler = createInteractionHandler();
      handler.activate(mockMap, callbacks);

      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 20, clientY: 20 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30, clientY: 30 }));
      vi.advanceTimersByTime(16);

      expect(mockMap.hitTest).toHaveBeenCalledTimes(1);
      expect(mockMap.hitTest).toHaveBeenCalledWith(30, 30);

      handler.deactivate();
    });
  });

  describe('deactivate', () => {
    it('등록된 리스너를 모두 제거해야 한다', () => {
      const removeSpy = vi.spyOn(document, 'removeEventListener');
      const handler = createInteractionHandler();
      handler.activate(createMockSentenceMap(), createMockCallbacks());

      handler.deactivate();

      const eventTypes = removeSpy.mock.calls.map(([type]) => type);
      expect(eventTypes).toContain('mousemove');
      expect(eventTypes).toContain('click');

      removeSpy.mockRestore();
    });

    it('deactivate 후 이벤트에 반응하지 않아야 한다', () => {
      const hitResult = { block, regionIndex: 0 };
      const mockMap = createMockSentenceMap(hitResult);
      const callbacks = createMockCallbacks();
      const handler = createInteractionHandler();
      handler.activate(mockMap, callbacks);
      handler.deactivate();

      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 50 }));
      vi.advanceTimersByTime(16);
      document.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 50 }));

      expect(callbacks.onHover).not.toHaveBeenCalled();
      expect(callbacks.onSplit).not.toHaveBeenCalled();
    });

    it('activate 전에 호출해도 에러가 없어야 한다', () => {
      const handler = createInteractionHandler();

      expect(() => handler.deactivate()).not.toThrow();
    });
  });
});
