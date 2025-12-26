import { useState, useEffect, useRef } from 'react';
import { PROGRESS_BAR } from '../config/constants';
import { getScrollPercentage } from '../utils/getScrollPercentage';
import type { ComplexityData } from '../types/complexity';

export const ProgressBar = ({ complexityScores = [] }: Partial<ComplexityData>) => {
  const [scrollPercent, setScrollPercent] = useState(0);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current !== null) {
        return;
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const percent = getScrollPercentage();
        setScrollPercent(percent);
        rafIdRef.current = null;
      });
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // SVG 차트 생성 로직
  const createChartData = () => {
    if (complexityScores.length === 0) {
      return { readPoints: '', unreadPoints: '', readPolyline: '', unreadPolyline: '' };
    }

    const height = window.innerHeight;
    const width = parseInt(PROGRESS_BAR.WIDTH);
    const scrollPosition = (scrollPercent / 100) * height;

    // 모든 복잡도 점들을 좌표로 변환
    const allPoints = complexityScores.map((score, index) => {
      const x = (1 - score) * width; // 복잡도 높을수록 왼쪽
      const y = (index / (complexityScores.length - 1)) * height;
      return { x, y };
    });

    // 읽은 부분 (상단)과 안 읽은 부분 (하단) 분리
    const readPoints: { x: number; y: number }[] = [];
    const unreadPoints: { x: number; y: number }[] = [];
    let interpolatedPoint: { x: number; y: number } | null = null;

    // 스크롤 위치에서 보간된 점 찾기
    for (let i = 0; i < allPoints.length; i++) {
      const point = allPoints[i];
      
      if (point.y <= scrollPosition) {
        readPoints.push(point);
      } else {
        // 스크롤 위치를 넘어가는 첫 번째 점 발견
        if (i > 0 && allPoints[i - 1].y <= scrollPosition) {
          // 이전 점과 현재 점 사이에서 보간
          const prevPoint = allPoints[i - 1];
          const ratio = (scrollPosition - prevPoint.y) / (point.y - prevPoint.y);
          interpolatedPoint = {
            x: prevPoint.x + (point.x - prevPoint.x) * ratio,
            y: scrollPosition,
          };
          
          // 보간된 점을 양쪽에 추가
          readPoints.push(interpolatedPoint);
          unreadPoints.push(interpolatedPoint);
        }
        unreadPoints.push(point);
      }
    }

    // Polygon을 위한 points 문자열 생성
    const createPolygonPoints = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return '';
      
      const startY = points[0].y;
      const endY = points[points.length - 1].y;
      
      const polygonPoints = [
        `${width},${startY}`, // 우측 시작점
        ...points.map(p => `${p.x},${p.y}`),
        `${width},${endY}`, // 우측 끝점
      ];
      
      return polygonPoints.join(' ');
    };

    // Polyline을 위한 points 문자열 생성
    const createPolylinePoints = (points: { x: number; y: number }[]) => {
      return points.map(p => `${p.x},${p.y}`).join(' ');
    };

    return {
      readPoints: createPolygonPoints(readPoints),
      unreadPoints: createPolygonPoints(unreadPoints),
      readPolyline: createPolylinePoints(readPoints),
      unreadPolyline: createPolylinePoints(unreadPoints),
    };
  };

  const { readPoints, unreadPoints, readPolyline, unreadPolyline } = createChartData();

  return (
    <div
      className="fixed top-0 right-0 h-screen"
      style={{ width: PROGRESS_BAR.WIDTH }}
    >
      <svg width="100%" height="100%" className="overflow-visible">
        {/* 안 읽은 부분 (하단) */}
        {unreadPoints && (
          <>
            <polygon
              points={unreadPoints}
              fill="rgba(156, 163, 175, 0.3)"
              className="transition-all duration-100"
            />
            <polyline
              points={unreadPolyline}
              stroke="#9ca3af"
              strokeWidth="2"
              fill="none"
              className="transition-all duration-100"
            />
          </>
        )}
        
        {/* 읽은 부분 (상단) */}
        {readPoints && (
          <>
            <polygon
              points={readPoints}
              fill="rgba(245, 158, 11, 0.8)"
              className="transition-all duration-100"
            />
            <polyline
              points={readPolyline}
              stroke="#f59e0b"
              strokeWidth="2"
              fill="none"
              className="transition-all duration-100"
            />
          </>
        )}
      </svg>
    </div>
  );
};
