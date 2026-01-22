const ABBREVIATIONS = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof', 'Jr', 'Sr', 'St', 'Mt'];
const PLACEHOLDER = '\u0000DOT\u0000';

/**
 * 주어진 텍스트를 문장 단위의 문자열 배열로 분리합니다.
 * Intl.Segmenter를 사용하여 다국어 문장 경계를 정확히 인식합니다.
 *
 * **처리 과정**
 * 1. **전처리**: 약어(Mr., Dr. 등)의 마침표를 placeholder로 치환하여 문장 분리 오류 방지
 * 2. **문장 분리**: Intl.Segmenter를 사용하여 한/영 다국어 문장 경계 인식
 * 3. **후처리**: placeholder를 마침표로 복원하고 공백 제거
 *
 * @param text 분리할 원본 텍스트
 * @returns 분리된 문장들의 배열
 */
export const segmentSentences = (text: string): string[] => {
  if (!text) return [];

  let processed = text;
  for (const abbr of ABBREVIATIONS) {
    const regex = new RegExp(`\\b${abbr}\\.`, 'gi');
    processed = processed.replace(regex, `${abbr}${PLACEHOLDER}`);
  }

  const segmenter = new Intl.Segmenter(['ko', 'en'], { granularity: 'sentence' });
  const segments = Array.from(segmenter.segment(processed)).map((s) => s.segment);

  return segments.map((s) => s.replace(new RegExp(PLACEHOLDER, 'g'), '.').trim());
};
