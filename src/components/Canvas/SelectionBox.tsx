import React from 'react';
import type { SelectionBounds, ResizeHandle, CanvasElement } from '../../types/whiteboard';

interface SelectionBoxProps {
  bounds: SelectionBounds;
  zoom: number;
  singleElement?: CanvasElement;
  onResizeStart: (handle: ResizeHandle, e: React.PointerEvent) => void;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  bounds,
  zoom,
  singleElement,
  onResizeStart,
}) => {
  const handleSize = Math.max(8, Math.min(12, 10 / zoom));
  const halfHandle = handleSize / 2;

  if (singleElement && singleElement.type === 'arrow') {
    return (
      <div style={{ pointerEvents: 'none' }}>
        <div
          className="arrow-handle"
          style={{
            position: 'absolute',
            left: `${singleElement.startX - halfHandle}px`,
            top: `${singleElement.startY - halfHandle}px`,
            width: `${handleSize * 1.2}px`,
            height: `${handleSize * 1.2}px`,
            backgroundColor: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '50%',
            cursor: 'crosshair',
            pointerEvents: 'auto',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
          onPointerDown={(e) => onResizeStart('arrow-start', e)}
        />
        <div
          className="arrow-handle"
          style={{
            position: 'absolute',
            left: `${singleElement.endX - halfHandle}px`,
            top: `${singleElement.endY - halfHandle}px`,
            width: `${handleSize * 1.2}px`,
            height: `${handleSize * 1.2}px`,
            backgroundColor: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '50%',
            cursor: 'crosshair',
            pointerEvents: 'auto',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
          onPointerDown={(e) => onResizeStart('arrow-end', e)}
        />
      </div>
    );
  }

  const handles: { handle: ResizeHandle; cursor: string; style: React.CSSProperties }[] = [
    { handle: 'nw', cursor: 'nwse-resize', style: { top: -halfHandle, left: -halfHandle } },
    { handle: 'n', cursor: 'ns-resize', style: { top: -halfHandle, left: '50%', transform: 'translateX(-50%)' } },
    { handle: 'ne', cursor: 'nesw-resize', style: { top: -halfHandle, right: -halfHandle } },
    { handle: 'e', cursor: 'ew-resize', style: { top: '50%', right: -halfHandle, transform: 'translateY(-50%)' } },
    { handle: 'se', cursor: 'nwse-resize', style: { bottom: -halfHandle, right: -halfHandle } },
    { handle: 's', cursor: 'ns-resize', style: { bottom: -halfHandle, left: '50%', transform: 'translateX(-50%)' } },
    { handle: 'sw', cursor: 'nesw-resize', style: { bottom: -halfHandle, left: -halfHandle } },
    { handle: 'w', cursor: 'ew-resize', style: { top: '50%', left: -halfHandle, transform: 'translateY(-50%)' } },
  ];

  return (
    <div
      className="selection-box"
      style={{
        position: 'absolute',
        left: `${bounds.x}px`,
        top: `${bounds.y}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        border: '1.5px solid #3b82f6',
        pointerEvents: 'none',
        zIndex: 9000,
        boxSizing: 'border-box',
      }}
    >
      {handles.map(({ handle, cursor, style }) => (
        <div
          key={handle}
          className="resize-handle"
          style={{
            position: 'absolute',
            width: `${handleSize}px`,
            height: `${handleSize}px`,
            backgroundColor: '#ffffff',
            border: '2px solid #3b82f6',
            borderRadius: '2px',
            cursor,
            pointerEvents: 'auto',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            boxSizing: 'border-box',
            ...style,
          }}
          onPointerDown={(e) => onResizeStart(handle, e)}
        />
      ))}
    </div>
  );
};
