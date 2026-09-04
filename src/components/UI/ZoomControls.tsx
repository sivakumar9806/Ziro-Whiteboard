import React, { useState } from 'react';
import { Minus, Plus, Maximize2, Map, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToContent: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  onSetZoomExact: (zoomLevel: number) => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToContent,
  showMinimap,
  onToggleMinimap,
  onSetZoomExact,
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const zoomPercent = Math.round(zoom * 100);

  const presets = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];

  return (
    <div className="zoom-controls-dock">
      {/* Zoom Out */}
      <button className="zoom-btn" onClick={onZoomOut} title="Zoom Out (Ctrl+Minus)">
        <Minus size={15} />
      </button>

      {/* Percentage Selector */}
      <div className="relative">
        <button
          className="zoom-percent-btn"
          onClick={() => setShowPresets((prev) => !prev)}
          title="Zoom Level"
        >
          {zoomPercent}%
        </button>

        {showPresets && (
          <>
            <div className="flyout-backdrop" onClick={() => setShowPresets(false)} />
            <div className="zoom-presets-menu">
              {presets.map((p) => (
                <button
                  key={p}
                  className={`zoom-preset-item ${Math.abs(zoom - p) < 0.05 ? 'active' : ''}`}
                  onClick={() => {
                    onSetZoomExact(p);
                    setShowPresets(false);
                  }}
                >
                  {Math.round(p * 100)}%
                </button>
              ))}
              <div className="dropdown-divider" />
              <button
                className="zoom-preset-item"
                onClick={() => {
                  onFitToContent();
                  setShowPresets(false);
                }}
              >
                Fit to Content
              </button>
            </div>
          </>
        )}
      </div>

      {/* Zoom In */}
      <button className="zoom-btn" onClick={onZoomIn} title="Zoom In (Ctrl+Plus)">
        <Plus size={15} />
      </button>

      <div className="zoom-divider" />

      {/* Reset 100% */}
      <button className="zoom-btn" onClick={onResetZoom} title="Reset to 100% (Ctrl+0)">
        <RotateCcw size={15} />
      </button>

      {/* Fit to View */}
      <button className="zoom-btn" onClick={onFitToContent} title="Fit to all elements">
        <Maximize2 size={15} />
      </button>

      {/* Toggle Minimap */}
      <button
        className={`zoom-btn ${showMinimap ? 'active' : ''}`}
        onClick={onToggleMinimap}
        title="Toggle Minimap"
      >
        <Map size={15} />
      </button>
    </div>
  );
};
