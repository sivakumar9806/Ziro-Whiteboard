import React from 'react';
import type { CanvasElement, ViewportTransform } from '../../types/whiteboard';
import { getElementsBounds } from '../../utils/geometry';

interface MinimapProps {
  elements: CanvasElement[];
  viewport: ViewportTransform;
  onNavigateTo: (worldX: number, worldY: number) => void;
  onClose: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  elements,
  viewport,
  onNavigateTo,
  onClose,
}) => {
  const mapWidth = 200;
  const mapHeight = 140;

  const bounds = getElementsBounds(elements) || { x: 0, y: 0, width: 1000, height: 700 };
  const padding = 200;
  const areaX = bounds.x - padding;
  const areaY = bounds.y - padding;
  const areaWidth = Math.max(bounds.width + padding * 2, 800);
  const areaHeight = Math.max(bounds.height + padding * 2, 600);

  const scale = Math.min(mapWidth / areaWidth, mapHeight / areaHeight);

  const toMapX = (wx: number) => (wx - areaX) * scale;
  const toMapY = (wy: number) => (wy - areaY) * scale;

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const viewWorldX = -viewport.x / viewport.zoom;
  const viewWorldY = -viewport.y / viewport.zoom;
  const viewWorldW = screenW / viewport.zoom;
  const viewWorldH = screenH / viewport.zoom;

  const vpMapX = toMapX(viewWorldX);
  const vpMapY = toMapY(viewWorldY);
  const vpMapW = viewWorldW * scale;
  const vpMapH = viewWorldH * scale;

  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickMapX = e.clientX - rect.left;
    const clickMapY = e.clientY - rect.top;

    const targetWorldX = clickMapX / scale + areaX;
    const targetWorldY = clickMapY / scale + areaY;

    onNavigateTo(targetWorldX, targetWorldY);
  };

  return (
    <div className="minimap-container">
      <div className="minimap-header">
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Overview</span>
        <button className="minimap-close-btn" onClick={onClose} title="Close minimap">
          ✕
        </button>
      </div>

      <svg
        width={mapWidth}
        height={mapHeight}
        className="minimap-svg"
        onClick={handleMinimapClick}
      >
        <rect width={mapWidth} height={mapHeight} fill="#f8fafc" />

        {elements.map((el) => {
          const x = toMapX(el.x);
          const y = toMapY(el.y);
          const w = Math.max(el.width * scale, 3);
          const h = Math.max(el.height * scale, 3);

          if (el.type === 'sticky') {
            return <rect key={el.id} x={x} y={y} width={w} height={h} rx={1} fill="#fde047" opacity={0.8} />;
          }
          if (el.type === 'rectangle' || el.type === 'circle') {
            return <rect key={el.id} x={x} y={y} width={w} height={h} rx={el.type === 'circle' ? w / 2 : 1} fill="#93c5fd" opacity={0.8} />;
          }
          if (el.type === 'arrow') {
            return (
              <line
                key={el.id}
                x1={toMapX(el.startX)}
                y1={toMapY(el.startY)}
                x2={toMapX(el.endX)}
                y2={toMapY(el.endY)}
                stroke="#64748b"
                strokeWidth={1.5}
              />
            );
          }
          return <rect key={el.id} x={x} y={y} width={w} height={h} fill="#cbd5e1" opacity={0.8} />;
        })}

        <rect
          x={vpMapX}
          y={vpMapY}
          width={vpMapW}
          height={vpMapH}
          fill="rgba(59, 130, 246, 0.12)"
          stroke="#3b82f6"
          strokeWidth={1.5}
          rx={2}
          pointerEvents="none"
        />
      </svg>
    </div>
  );
};
