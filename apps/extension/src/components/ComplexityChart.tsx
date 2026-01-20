interface ChartLayerProps {
  points: string;
  polyline: string;
  fill: string;
  stroke: string;
}

const ChartLayer = ({ points, polyline, fill, stroke }: ChartLayerProps) => {
  if (!points) return null;

  return (
    <>
      <polygon
        points={points}
        fill={fill}
        className="transition-all duration-100"
      />
      <polyline
        points={polyline}
        stroke={stroke}
        strokeWidth="2"
        fill="none"
        className="transition-all duration-100"
      />
    </>
  );
};

interface ComplexityChartProps {
  readPoints: string;
  unreadPoints: string;
  readPolyline: string;
  unreadPolyline: string;
}

export const ComplexityChart = ({
  readPoints,
  unreadPoints,
  readPolyline,
  unreadPolyline,
}: ComplexityChartProps) => {
  return (
    <svg width="100%" height="100%" className="overflow-visible">
      {/* 안 읽은 부분 (하단) */}
      <ChartLayer
        points={unreadPoints}
        polyline={unreadPolyline}
        fill="rgba(156, 163, 175, 0.3)"
        stroke="#9ca3af"
      />

      {/* 읽은 부분 (상단) */}
      <ChartLayer
        points={readPoints}
        polyline={readPolyline}
        fill="rgba(245, 158, 11, 0.8)"
        stroke="#f59e0b"
      />
    </svg>
  );
};
