export const computeComplexity = (text: string): number => {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const lengthScore = trimmed.length;
  const punctuationScore = (trimmed.match(/[,:;(){}\\[\]]/g) ?? []).length * 20;
  const digitScore = (trimmed.match(/\d/g) ?? []).length * 10;

  return lengthScore + punctuationScore + digitScore;
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
