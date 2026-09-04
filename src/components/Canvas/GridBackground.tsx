import React from 'react';
import type { ViewportTransform } from '../../types/whiteboard';

interface GridBackgroundProps {
  viewport: ViewportTransform;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({ viewport }) => {
  const baseGridSize = 24;
  const scaledGridSize = baseGridSize * viewport.zoom;

  const offsetX = ((viewport.x % scaledGridSize) + scaledGridSize) % scaledGridSize;
  const offsetY = ((viewport.y % scaledGridSize) + scaledGridSize) % scaledGridSize;

  const dotRadius = Math.max(1, Math.min(1.75, 1.25 * viewport.zoom));
  const dotColor = viewport.zoom < 0.3 ? 'transparent' : 'rgba(100, 116, 139, 0.22)';

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <pattern
          id="dot-grid-pattern"
          x={offsetX}
          y={offsetY}
          width={scaledGridSize}
          height={scaledGridSize}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={scaledGridSize / 2}
            cy={scaledGridSize / 2}
            r={dotRadius}
            fill={dotColor}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid-pattern)" />
    </svg>
  );
};
