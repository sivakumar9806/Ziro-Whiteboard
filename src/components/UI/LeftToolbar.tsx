import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  StickyNote,
  Square,
  Circle,
  Diamond,
  MoveRight,
  PenTool,
  Type,
  Eraser,
  LayoutGrid,
  Check,
  Frame,
} from 'lucide-react';
import type { ToolType, StickyColor } from '../../types/whiteboard';

interface LeftToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  activeStickyColor: StickyColor;
  setActiveStickyColor: (color: StickyColor) => void;
  onOpenTemplates: () => void;
}

export const MIRO_STICKY_SWATCHES: { color: StickyColor; bg: string; border: string; label: string }[] = [
  { color: 'yellow', bg: '#fff9b1', border: '#fef08a', label: 'Sunshine Yellow' },
  { color: 'blue', bg: '#d0e7ff', border: '#bae6fd', label: 'Sky Blue' },
  { color: 'green', bg: '#d5f5e3', border: '#bbf7d0', label: 'Mint Green' },
  { color: 'pink', bg: '#f5d1c3', border: '#fecdd3', label: 'Soft Coral / Pink' },
  { color: 'orange', bg: '#ffe0b2', border: '#fed7aa', label: 'Tangerine Orange' },
  { color: 'purple', bg: '#e6d9ff', border: '#e9d5ff', label: 'Lavender Violet' },
  { color: 'cyan', bg: '#cbf0f8', border: '#a5f3fc', label: 'Aqua Cyan' },
  { color: 'gray', bg: '#f1f5f9', border: '#e2e8f0', label: 'Cool Slate' },
];

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeStickyColor,
  setActiveStickyColor,
  onOpenTemplates,
}) => {
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const currentSticky = MIRO_STICKY_SWATCHES.find((s) => s.color === activeStickyColor) || MIRO_STICKY_SWATCHES[0];

  return (
    <aside className="ziro-toolbar-container" aria-label="Ziro Whiteboard Tools">
      <nav className="ziro-toolbar-dock">
        {/* 1. Select Tool (V) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('select')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('select');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Select tool (V)"
          >
            {activeTool === 'select' && <div className="ziro-active-pill" />}
            <MousePointer size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'select' && (
            <div className="ziro-tooltip">
              <span>Select</span>
              <kbd>V</kbd>
            </div>
          )}
        </div>

        {/* 2. Pan / Hand Tool (H) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('pan')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'pan' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('pan');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Hand tool (H)"
          >
            {activeTool === 'pan' && <div className="ziro-active-pill" />}
            <Hand size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'pan' && (
            <div className="ziro-tooltip">
              <span>Hand (Pan)</span>
              <kbd>H</kbd>
            </div>
          )}
        </div>

        {/* 3. Templates (T) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('template')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className="ziro-tool-btn"
            onClick={() => {
              onOpenTemplates();
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Templates"
          >
            <LayoutGrid size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'template' && (
            <div className="ziro-tooltip">
              <span>Templates</span>
            </div>
          )}
        </div>

        <div className="ziro-group-divider" />

        {/* 4. Text Tool (T) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('text')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'text' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('text');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Text box (T)"
          >
            {activeTool === 'text' && <div className="ziro-active-pill" />}
            <Type size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'text' && (
            <div className="ziro-tooltip">
              <span>Text</span>
              <kbd>T</kbd>
            </div>
          )}
        </div>

        {/* 5. Sticky Note (N / S) */}
        <div
          className="ziro-tool-item relative"
          onMouseEnter={() => setHoveredTool('sticky')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'sticky' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('sticky');
              setShowStickyMenu((prev) => !prev);
              setShowShapesMenu(false);
            }}
            aria-label="Sticky note (S / N)"
          >
            {activeTool === 'sticky' && <div className="ziro-active-pill" />}
            <StickyNote size={20} strokeWidth={2.2} />
            <span
              className="ziro-sticky-pip"
              style={{ backgroundColor: currentSticky.bg, borderColor: currentSticky.border }}
            />
          </button>

          {hoveredTool === 'sticky' && !showStickyMenu && (
            <div className="ziro-tooltip">
              <span>Sticky Note</span>
              <kbd>N / S</kbd>
            </div>
          )}

          {/* Miro Sticky Note Color Flyout */}
          {showStickyMenu && (
            <>
              <div className="flyout-backdrop" onClick={() => setShowStickyMenu(false)} />
              <div className="ziro-flyout-card">
                <div className="ziro-flyout-title">STICKY NOTE COLOR</div>
                <div className="ziro-swatches-grid">
                  {MIRO_STICKY_SWATCHES.map((item) => (
                    <button
                      key={item.color}
                      className={`ziro-swatch-box ${activeStickyColor === item.color ? 'active' : ''}`}
                      style={{ backgroundColor: item.bg, borderColor: item.border }}
                      onClick={() => {
                        setActiveStickyColor(item.color);
                        setActiveTool('sticky');
                        setShowStickyMenu(false);
                      }}
                      title={item.label}
                    >
                      {activeStickyColor === item.color && <Check size={14} className="text-slate-800" strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 6. Shape Tool (Rectangle / Circle / Diamond) */}
        <div
          className="ziro-tool-item relative"
          onMouseEnter={() => setHoveredTool('shapes')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('rectangle');
              setShowShapesMenu((prev) => !prev);
              setShowStickyMenu(false);
            }}
            aria-label="Shapes (R / O)"
          >
            {(activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'diamond') && (
              <div className="ziro-active-pill" />
            )}
            {activeTool === 'circle' ? (
              <Circle size={20} strokeWidth={2.2} />
            ) : activeTool === 'diamond' ? (
              <Diamond size={20} strokeWidth={2.2} />
            ) : (
              <Square size={20} strokeWidth={2.2} />
            )}
          </button>

          {hoveredTool === 'shapes' && !showShapesMenu && (
            <div className="ziro-tooltip">
              <span>Shapes</span>
              <kbd>R</kbd>
            </div>
          )}

          {/* Shapes Picker Flyout */}
          {showShapesMenu && (
            <>
              <div className="flyout-backdrop" onClick={() => setShowShapesMenu(false)} />
              <div className="ziro-flyout-card">
                <div className="ziro-flyout-title">SHAPES</div>
                <div className="ziro-shapes-row">
                  <button
                    className={`ziro-shape-choice-btn ${activeTool === 'rectangle' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('rectangle');
                      setShowShapesMenu(false);
                    }}
                    title="Rectangle"
                  >
                    <Square size={18} strokeWidth={2} />
                    <span>Rectangle</span>
                  </button>
                  <button
                    className={`ziro-shape-choice-btn ${activeTool === 'circle' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('circle');
                      setShowShapesMenu(false);
                    }}
                    title="Circle"
                  >
                    <Circle size={18} strokeWidth={2} />
                    <span>Circle</span>
                  </button>
                  <button
                    className={`ziro-shape-choice-btn ${activeTool === 'diamond' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('diamond');
                      setShowShapesMenu(false);
                    }}
                    title="Diamond"
                  >
                    <Diamond size={18} strokeWidth={2} />
                    <span>Diamond</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 7. Connection Line / Arrow (A) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('arrow')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'arrow' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('arrow');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Connection Arrow (A / L)"
          >
            {activeTool === 'arrow' && <div className="ziro-active-pill" />}
            <MoveRight size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'arrow' && (
            <div className="ziro-tooltip">
              <span>Connection Arrow</span>
              <kbd>A / L</kbd>
            </div>
          )}
        </div>

        {/* 8. Freehand Pen (P) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('draw')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'draw' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('draw');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Pen / Draw (P)"
          >
            {activeTool === 'draw' && <div className="ziro-active-pill" />}
            <PenTool size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'draw' && (
            <div className="ziro-tooltip">
              <span>Pen</span>
              <kbd>P</kbd>
            </div>
          )}
        </div>

        {/* 9. Frame Container Tool (F) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('frame')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'frame' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('frame');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Frame container (F)"
          >
            {activeTool === 'frame' && <div className="ziro-active-pill" />}
            <Frame size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'frame' && (
            <div className="ziro-tooltip">
              <span>Frame</span>
              <kbd>F</kbd>
            </div>
          )}
        </div>

        <div className="ziro-group-divider" />

        {/* 10. Eraser Tool (E) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('eraser')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('eraser');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
            }}
            aria-label="Eraser (E)"
          >
            {activeTool === 'eraser' && <div className="ziro-active-pill" />}
            <Eraser size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'eraser' && (
            <div className="ziro-tooltip">
              <span>Eraser</span>
              <kbd>E</kbd>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};
