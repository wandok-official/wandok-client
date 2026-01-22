import { useMemo } from 'react';
import { PROGRESS_BAR } from '../config/constants';

interface UseComplexityChartDataProps {
  complexityScores: number[];
  scrollPercent: number;
}

export const useComplexityChartData = ({
  complexityScores,
  scrollPercent,
}: UseComplexityChartDataProps) => {
  return useMemo(() => {
    if (complexityScores.length === 0) {
      return { readPoints: '', unreadPoints: '', readPolyline: '', unreadPolyline: '' };
    }

    const height = window.innerHeight;
    const width = parseInt(PROGRESS_BAR.WIDTH);
    const scrollPosition = (scrollPercent / 100) * height;

    const allPoints = complexityScores.map((score, index) => {
      const x = (1 - score) * width;
      const divisor = Math.max(complexityScores.length - 1, 1);
      const y = (index / divisor) * height;
      return { x, y };
    });

    const { readPointsArr, unreadPointsArr } = interpolatePoints(allPoints, scrollPosition);

    return {
      readPoints: createPointsString(readPointsArr, parseInt(PROGRESS_BAR.WIDTH), true),
      unreadPoints: createPointsString(unreadPointsArr, parseInt(PROGRESS_BAR.WIDTH), true),
      readPolyline: createPointsString(readPointsArr, parseInt(PROGRESS_BAR.WIDTH), false),
      unreadPolyline: createPointsString(unreadPointsArr, parseInt(PROGRESS_BAR.WIDTH), false),
    };
  }, [complexityScores, scrollPercent]);
};

const interpolatePoints = (
  allPoints: { x: number; y: number }[],
  scrollPosition: number,
) => {
  const readPointsArr: { x: number; y: number }[] = [];
  const unreadPointsArr: { x: number; y: number }[] = [];

  for (let i = 0; i < allPoints.length; i++) {
    const point = allPoints[i];

    if (point.y <= scrollPosition) {
      readPointsArr.push(point);
    } else {
      if (i > 0 && allPoints[i - 1].y <= scrollPosition) {
        const prevPoint = allPoints[i - 1];
        const dy = point.y - prevPoint.y;
        const ratio = dy === 0 ? 0 : (scrollPosition - prevPoint.y) / dy;
        const interpolatedPoint = {
          x: prevPoint.x + (point.x - prevPoint.x) * ratio,
          y: scrollPosition,
        };
        readPointsArr.push(interpolatedPoint);
        unreadPointsArr.push(interpolatedPoint);
      }
      unreadPointsArr.push(point);
    }
  }

  return { readPointsArr, unreadPointsArr };
};

const createPointsString = (
  points: { x: number; y: number }[],
  width: number,
  closePath: boolean,
) => {
  if (points.length === 0) return '';
  const pointStr = points.map(p => `${p.x},${p.y}`).join(' ');

  if (closePath) {
    const startY = points[0].y;
    const endY = points[points.length - 1].y;
    return `${width},${startY} ${pointStr} ${width},${endY}`;
  }
  return pointStr;
};
