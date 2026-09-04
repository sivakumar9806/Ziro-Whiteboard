import React from 'react';
import type { ArrowElementData } from '../../types/whiteboard';
import { getArrowPoints } from '../../utils/geometry';

interface ArrowElementProps {
  element: ArrowElementData;
  isSelected: boolean;
}

export const ArrowElement: React.FC<ArrowElementProps> = ({ element, isSelected }) => {
  const minX = Math.min(element.startX, element.endX) - 20;
  const minY = Math.min(element.startY, element.endY) - 20;
  const maxX = Math.max(element.startX, element.endX) + 20;
  const maxY = Math.max(element.startY, element.endY) + 20;
  const width = Math.max(maxX - minX, 40);
  const height = Math.max(maxY - minY, 40);

  const sx = element.startX - minX;
  const sy = element.startY - minY;
  const ex = element.endX - minX;
  const ey = element.endY - minY;

  const { x1, y1, x2, y2 } = getArrowPoints(sx, sy, ex, ey, 14);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <line
          x1={sx}
          y1={sy}
          x2={ex}
          y2={ey}
          stroke="transparent"
          strokeWidth={Math.max(element.strokeWidth + 14, 20)}
          style={{ pointerEvents: 'stroke' }}
        />

        {isSelected && (
          <line
            x1={sx}
            y1={sy}
            x2={ex}
            y2={ey}
            stroke="#3b82f6"
            strokeWidth={element.strokeWidth + 6}
            strokeOpacity={0.4}
            strokeLinecap="round"
          />
        )}

        <line
          x1={sx}
          y1={sy}
          x2={ex}
          y2={ey}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          strokeDasharray={element.strokeStyle === 'dashed' ? '8,6' : 'none'}
          strokeLinecap="round"
        />

        {(element.arrowHead === 'end' || element.arrowHead === 'both') && (
          <polygon
            points={`${ex},${ey} ${x1},${y1} ${x2},${y2}`}
            fill={element.stroke}
          />
        )}

        {element.arrowHead === 'both' && (
          (() => {
            const startHead = getArrowPoints(ex, ey, sx, sy, 14);
            return (
              <polygon
                points={`${sx},${sy} ${startHead.x1},${startHead.y1} ${startHead.x2},${startHead.y2}`}
                fill={element.stroke}
              />
            );
          })()
        )}
      </svg>
    </div>
  );
};
