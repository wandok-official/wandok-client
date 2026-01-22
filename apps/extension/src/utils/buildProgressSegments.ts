import type { ProgressSegment } from '../types/progress';
import { computeComplexity, normalizeScores } from './complexity';

/**
 * 문단 블록(HTMLElement[])을 받아 progress bar용 세그먼트로 변환
 */
export const buildProgressSegments = (
  blocks: HTMLElement[],
): ProgressSegment[] => {
  if (blocks.length === 0) return [];

  const orderedBlocks = [...blocks].sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

  const tops = orderedBlocks.map(
    (el) => el.getBoundingClientRect().top + window.scrollY,
  );

  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const scrollable = Math.max(1, docHeight - winHeight);

  const rawScores = orderedBlocks.map((el) =>
    computeComplexity(el.innerText ?? ''),
  );
  const intensities = normalizeScores(rawScores);

  return orderedBlocks.map((_, idx) => {
    const startY = tops[idx];
    const endY =
      idx < tops.length - 1 ? tops[idx + 1] : scrollable + winHeight;

    const topPct = Math.min(
      100,
      Math.max(0, (startY / scrollable) * 100),
    );

    const heightPct = Math.min(
      100 - topPct,
      Math.max(0.4, ((endY - startY) / scrollable) * 100),
    );

    return {
      topPct,
      heightPct,
      intensity: intensities[idx],
    };
  });
};
