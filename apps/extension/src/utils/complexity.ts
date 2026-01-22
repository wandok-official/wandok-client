/**
 * 텍스트의 복잡도를 계산합니다.
 * 길이, 문장 수, 평균 문장 길이, 구두점 등을 종합적으로 고려합니다.
 */
export const computeComplexity = (text: string): number => {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  // 1. 기본 길이 점수 (주요 요인)
  const lengthScore = trimmed.length;

  // 2. 문장 수 추정 (마침표, 느낌표, 물음표 기준)
  const sentences = trimmed.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // 3. 평균 문장 길이 (긴 문장은 복잡도 증가)
  const avgSentenceLength = trimmed.length / sentenceCount;

  // 4. 복잡한 구두점 (세미콜론, 콜론, 괄호 등)
  const complexPunctuation = (trimmed.match(/[;:(){}[\]]/g) ?? []).length;

  // 5. 일반 구두점 (콤마 등)
  const simplePunctuation = (trimmed.match(/[,]/g) ?? []).length;

  // 6. 숫자
  const digitCount = (trimmed.match(/\d/g) ?? []).length;

  // 복잡도 계산: 길이가 주요 요인, 나머지는 보조 요인
  return (
    lengthScore +
    sentenceCount * 10 +       // 문장이 많으면 복잡도 증가
    avgSentenceLength * 0.2 +  // 평균 문장 길이 반영
    complexPunctuation * 5 +   // 복잡한 구두점 (낮은 가중치)
    simplePunctuation * 2 +    // 일반 구두점 (더 낮은 가중치)
    digitCount * 3             // 숫자 (낮은 가중치)
  );
};

export const normalizeScores = (scores: number[]): number[] => {
  if (!scores || scores.length === 0) return [];

  const min = Math.min(...scores);
  const max = Math.max(...scores);

  if (min === max) {
    // 전부 같은 점수면 중간값으로
    return scores.map(() => 0.5);
  }

  return scores.map((s) => (s - min) / (max - min));
};
