import { beforeEach, describe, expect, it } from 'vitest';

import { createVirtualParagraphState } from '../virtualParagraphState';

describe('VirtualParagraphState', () => {
  let block: HTMLElement;

  beforeEach(() => {
    block = document.createElement('p');
  });

  describe('addSplit', () => {
    it('분리 인덱스를 추가하면 getAllSplits에 반영되어야 한다', () => {
      const state = createVirtualParagraphState();

      state.addSplit(block, 2);

      const splits = state.getAllSplits();
      expect(splits).toEqual([{ block, sentenceIndex: 2 }]);
    });

    it('인덱스 0은 무시해야 한다', () => {
      const state = createVirtualParagraphState();

      state.addSplit(block, 0);

      expect(state.getAllSplits()).toHaveLength(0);
    });

    it('같은 인덱스를 중복 추가해도 하나만 저장해야 한다', () => {
      const state = createVirtualParagraphState();

      state.addSplit(block, 2);
      state.addSplit(block, 2);

      expect(state.getAllSplits()).toHaveLength(1);
    });

    it('서로 다른 블록의 분리는 독립적으로 저장해야 한다', () => {
      const state = createVirtualParagraphState();
      const block2 = document.createElement('p');

      state.addSplit(block, 1);
      state.addSplit(block2, 3);

      expect(state.getVirtualParagraphs(block, 5)).toEqual([
        { startIndex: 0, endIndex: 1 },
        { startIndex: 1, endIndex: 5 },
      ]);
      expect(state.getVirtualParagraphs(block2, 5)).toEqual([
        { startIndex: 0, endIndex: 3 },
        { startIndex: 3, endIndex: 5 },
      ]);
    });
  });

  describe('getVirtualParagraphs', () => {
    it('분리가 없으면 전체를 하나의 가상 문단으로 반환해야 한다', () => {
      const state = createVirtualParagraphState();

      const result = state.getVirtualParagraphs(block, 4);

      expect(result).toEqual([{ startIndex: 0, endIndex: 4 }]);
    });

    it('단일 분리 시 두 개의 [start, end) 범위를 반환해야 한다', () => {
      const state = createVirtualParagraphState();
      state.addSplit(block, 2);

      const result = state.getVirtualParagraphs(block, 4);

      expect(result).toEqual([
        { startIndex: 0, endIndex: 2 },
        { startIndex: 2, endIndex: 4 },
      ]);
    });

    it('비순차로 추가된 분리 인덱스를 정렬하여 범위를 생성해야 한다', () => {
      const state = createVirtualParagraphState();
      state.addSplit(block, 3);
      state.addSplit(block, 1);

      const result = state.getVirtualParagraphs(block, 5);

      expect(result).toEqual([
        { startIndex: 0, endIndex: 1 },
        { startIndex: 1, endIndex: 3 },
        { startIndex: 3, endIndex: 5 },
      ]);
    });
  });

  describe('getAllSplits', () => {
    it('여러 블록의 분리 정보를 모두 포함해야 한다', () => {
      const state = createVirtualParagraphState();
      const block2 = document.createElement('p');

      state.addSplit(block, 1);
      state.addSplit(block2, 3);

      const splits = state.getAllSplits();
      expect(splits).toHaveLength(2);
      expect(splits).toContainEqual({ block, sentenceIndex: 1 });
      expect(splits).toContainEqual({ block: block2, sentenceIndex: 3 });
    });
  });

  describe('clearAll', () => {
    it('모든 블록의 분리 데이터를 초기화해야 한다', () => {
      const state = createVirtualParagraphState();
      state.addSplit(block, 1);
      state.addSplit(block, 3);

      state.clearAll();

      expect(state.getAllSplits()).toHaveLength(0);
      expect(state.getVirtualParagraphs(block, 4)).toEqual([
        { startIndex: 0, endIndex: 4 },
      ]);
    });
  });
});
