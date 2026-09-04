import React from 'react';
import type { SelectionBounds } from '../../types/whiteboard';

interface MarqueeSelectProps {
  bounds: SelectionBounds | null;
}

export const MarqueeSelect: React.FC<MarqueeSelectProps> = ({ bounds }) => {
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;

  return (
    <div
      className="marquee-selection"
      style={{
        position: 'absolute',
        left: `${bounds.x}px`,
        top: `${bounds.y}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1.5px dashed #3b82f6',
        borderRadius: '4px',
        pointerEvents: 'none',
        zIndex: 9500,
      }}
    />
  );
};
