export type ProgressSegment = {
  topPct: number; // 스크롤 전체 대비 시작 위치
  heightPct: number; // 스크롤 전체 대비 높이
  intensity: number; // 0 ~ 1 사이의 값으로 복잡도 (0 = 쉬움, 1 = 어려움)
};
