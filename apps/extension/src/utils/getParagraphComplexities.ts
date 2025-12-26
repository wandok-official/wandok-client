import { computeComplexity, normalizeScores } from './complexity';
import { BLOCK_SELECTOR } from '../config/constants';

/**
 * 페이지의 모든 블록 요소를 추출하고 각 요소의 복잡도를 계산하여 정규화된 배열을 반환합니다.
 */
export const getParagraphComplexities = (): number[] => {
  const blocks = document.querySelectorAll(BLOCK_SELECTOR);
  
  const complexityScores: number[] = [];
  
  blocks.forEach((block) => {
    const text = block.textContent || '';
    const score = computeComplexity(text);
    complexityScores.push(score);
  });
  
  return normalizeScores(complexityScores);
};
