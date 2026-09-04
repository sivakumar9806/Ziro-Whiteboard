import React from 'react';
import type { DrawElementData } from '../../types/whiteboard';
import { pointsToSvgPath, getElementBounds } from '../../utils/geometry';

interface FreehandElementProps {
  element: DrawElementData;
  isSelected: boolean;
}

export const FreehandElement: React.FC<FreehandElementProps> = ({ element, isSelected }) => {
  const bounds = getElementBounds(element);
  const pathD = pointsToSvgPath(element.points);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${bounds.x}px`,
        top: `${bounds.y}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        pointerEvents: 'none',
      }}
    >
      <svg
        style={{
          position: 'absolute',
          left: `${-bounds.x}px`,
          top: `${-bounds.y}px`,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {isSelected && (
          <path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={element.strokeWidth + 6}
            strokeOpacity={0.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <path
          d={pathD}
          fill="none"
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: 'stroke' }}
        />
      </svg>
    </div>
  );
};
