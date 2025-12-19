/**
 * 주어진 텍스트를 문장 단위의 문자열 배열로 분리합니다.
 * Intl.Segmenter를 사용하여 다국어 문장 경계를 정확히 인식합니다.
 *
 * @param text 분리할 원본 텍스트
 * @returns 분리된 문장들의 배열
 */
export const segmentSentences = (text: string): string[] => {
  if (!text) return [];

  const segmenter = new Intl.Segmenter(['ko', 'en'], { granularity: 'sentence' });
  const segments = segmenter.segment(text);

  return Array.from(segments).map((s) => s.segment);
};
