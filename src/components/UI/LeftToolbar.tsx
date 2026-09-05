import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  StickyNote,
  Square,
  Circle,
  Diamond,
  Triangle,
  Star,
  Cloud,
  MessageSquare,
  MoveRight,
  PenTool,
  Type,
  Eraser,
  LayoutGrid,
  Check,
  Frame,
  MessageCircle,
  MoreHorizontal,
  Smartphone,
  Monitor,
  Columns,
  Sparkles,
  Zap,
  GitBranch,
  Vote,
  Mic,
} from 'lucide-react';
import type { ToolType, StickyColor } from '../../types/whiteboard';

interface LeftToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  activeStickyColor: StickyColor;
  setActiveStickyColor: (color: StickyColor) => void;
  onOpenTemplates: () => void;
  onOpenShortcuts?: () => void;
  onOpenAIStudio?: () => void;
  onOpenMermaid?: () => void;
  onOpenVoting?: () => void;
  onAddVoiceMemo?: () => void;
}

export const MIRO_STICKY_SWATCHES: { color: StickyColor; bg: string; border: string; label: string }[] = [
  { color: 'yellow', bg: '#fff9b1', border: '#fef08a', label: 'Sunshine Yellow' },
  { color: 'green', bg: '#d5f692', border: '#bbf7d0', label: 'Mint Green' },
  { color: 'cyan', bg: '#c0f2ee', border: '#a5f3fc', label: 'Turquoise Cyan' },
  { color: 'blue', bg: '#a6c8ff', border: '#93c5fd', label: 'Sky Blue' },
  { color: 'purple', bg: '#d0bfff', border: '#d8b4fe', label: 'Lavender Purple' },
  { color: 'pink', bg: '#ffd5dc', border: '#fecdd3', label: 'Pastel Rose' },
  { color: 'orange', bg: '#ffdfa9', border: '#fed7aa', label: 'Peach Orange' },
  { color: 'gray', bg: '#e0e0e0', border: '#cbd5e1', label: 'Cool Smoke' },
];

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeStickyColor,
  setActiveStickyColor,
  onOpenTemplates,
  onOpenShortcuts,
  onOpenAIStudio,
  onOpenMermaid,
  onOpenVoting,
  onAddVoiceMemo,
}) => {
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showFramesMenu, setShowFramesMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const currentSticky = MIRO_STICKY_SWATCHES.find((s) => s.color === activeStickyColor) || MIRO_STICKY_SWATCHES[0];

  const isShapeActive = [
    'rectangle',
    'rounded_rectangle',
    'circle',
    'diamond',
    'triangle',
    'star',
    'cloud',
    'speech_bubble',
  ].includes(activeTool);

  return (
    <aside className="ziro-toolbar-container" aria-label="Ziro Whiteboard Tools">
      <nav className="ziro-toolbar-dock">
        {/* 0. 🤖 AI Studio Superpower (Top Feature) */}
        {onOpenAIStudio && (
          <div
            className="ziro-tool-item relative"
            onMouseEnter={() => setHoveredTool('ai_studio')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <button
              className="ziro-tool-btn ziro-ai-tool-btn"
              onClick={() => {
                onOpenAIStudio();
                setShowStickyMenu(false);
                setShowShapesMenu(false);
                setShowFramesMenu(false);
                setShowMoreMenu(false);
              }}
              aria-label="AI Whiteboard Studio"
            >
              <Sparkles size={20} className="text-indigo-600 animate-pulse" strokeWidth={2.4} />
            </button>
            {hoveredTool === 'ai_studio' && (
              <div className="ziro-tooltip ziro-ai-tooltip">
                <span className="font-semibold">🤖 AI Whiteboard Studio</span>
                <span className="ziro-tooltip-sub">Prompt-to-Flowchart</span>
              </div>
            )}
          </div>
        )}

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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
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

        {/* 3. 🔦 Presentation Laser Pointer */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('laser')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'laser' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('laser');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
              setShowFramesMenu(false);
              setShowMoreMenu(false);
            }}
            aria-label="Laser Pointer"
          >
            {activeTool === 'laser' && <div className="ziro-active-pill" />}
            <Zap size={20} className={activeTool === 'laser' ? 'text-amber-500' : ''} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'laser' && (
            <div className="ziro-tooltip">
              <span>🔦 Laser Pointer</span>
              <span className="ziro-tooltip-sub">Glowing Trail</span>
            </div>
          )}
        </div>

        {/* 4. Templates (T) */}
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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
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

        {/* 5. Text Tool (T) */}
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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
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

        {/* 6. Sticky Note (N / S) */}
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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
            }}
            aria-label="Sticky note (N / S)"
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

        {/* 7. Shape Tool (Flyout with 8 shapes) */}
        <div
          className="ziro-tool-item relative"
          onMouseEnter={() => setHoveredTool('shapes')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${isShapeActive ? 'active' : ''}`}
            onClick={() => {
              if (!isShapeActive) setActiveTool('rectangle');
              setShowShapesMenu((prev) => !prev);
              setShowStickyMenu(false);
              setShowFramesMenu(false);
              setShowMoreMenu(false);
            }}
            aria-label="Shapes (R / O)"
          >
            {isShapeActive && <div className="ziro-active-pill" />}
            {activeTool === 'circle' ? (
              <Circle size={20} strokeWidth={2.2} />
            ) : activeTool === 'diamond' ? (
              <Diamond size={20} strokeWidth={2.2} />
            ) : activeTool === 'triangle' ? (
              <Triangle size={20} strokeWidth={2.2} />
            ) : activeTool === 'star' ? (
              <Star size={20} strokeWidth={2.2} />
            ) : activeTool === 'speech_bubble' ? (
              <MessageSquare size={20} strokeWidth={2.2} />
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
              <div className="ziro-flyout-card" style={{ width: '220px' }}>
                <div className="ziro-flyout-title">ALL SHAPES</div>
                <div className="ziro-shapes-matrix">
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'rectangle' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('rectangle');
                      setShowShapesMenu(false);
                    }}
                    title="Rectangle"
                  >
                    <Square size={20} strokeWidth={2} />
                    <span>Rectangle</span>
                  </button>
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'rounded_rectangle' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('rounded_rectangle');
                      setShowShapesMenu(false);
                    }}
                    title="Rounded Rectangle"
                  >
                    <Square size={20} strokeWidth={2} style={{ borderRadius: '6px' }} />
                    <span>Rounded</span>
                  </button>
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'circle' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('circle');
                      setShowShapesMenu(false);
                    }}
                    title="Circle"
                  >
                    <Circle size={20} strokeWidth={2} />
                    <span>Circle</span>
                  </button>
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'diamond' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('diamond');
                      setShowShapesMenu(false);
                    }}
                    title="Diamond (Flowchart Decision)"
                  >
                    <Diamond size={20} strokeWidth={2} />
                    <span>Diamond</span>
                  </button>
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'triangle' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('triangle');
                      setShowShapesMenu(false);
                    }}
                    title="Triangle"
                  >
                    <Triangle size={20} strokeWidth={2} />
                    <span>Triangle</span>
                  </button>
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'star' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('star');
                      setShowShapesMenu(false);
                    }}
                    title="Star"
                  >
                    <Star size={20} strokeWidth={2} />
                    <span>Star</span>
                  </button>
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'cloud' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('cloud');
                      setShowShapesMenu(false);
                    }}
                    title="Cloud"
                  >
                    <Cloud size={20} strokeWidth={2} />
                    <span>Cloud</span>
                  </button>
                  <button
                    className={`ziro-shape-matrix-btn ${activeTool === 'speech_bubble' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTool('speech_bubble');
                      setShowShapesMenu(false);
                    }}
                    title="Speech Bubble / Callout"
                  >
                    <MessageSquare size={20} strokeWidth={2} />
                    <span>Callout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 8. Connection Line / Arrow (A) */}
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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
            }}
            aria-label="Connection Arrow (A / L)"
          >
            {activeTool === 'arrow' && <div className="ziro-active-pill" />}
            <MoveRight size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'arrow' && (
            <div className="ziro-tooltip">
              <span>Connection Line</span>
              <kbd>A / L</kbd>
            </div>
          )}
        </div>

        {/* 9. Freehand Pen (P) */}
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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
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

        {/* 10. Frame Container Tool (F) */}
        <div
          className="ziro-tool-item relative"
          onMouseEnter={() => setHoveredTool('frame')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'frame' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('frame');
              setShowFramesMenu((prev) => !prev);
              setShowStickyMenu(false);
              setShowShapesMenu(false);
              setShowMoreMenu(false);
            }}
            aria-label="Frame container (F)"
          >
            {activeTool === 'frame' && <div className="ziro-active-pill" />}
            <Frame size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'frame' && !showFramesMenu && (
            <div className="ziro-tooltip">
              <span>Frames</span>
              <kbd>F</kbd>
            </div>
          )}

          {/* Frames Flyout */}
          {showFramesMenu && (
            <>
              <div className="flyout-backdrop" onClick={() => setShowFramesMenu(false)} />
              <div className="ziro-flyout-card" style={{ width: '200px' }}>
                <div className="ziro-flyout-title">FRAME PRESETS</div>
                <div className="ziro-frames-menu">
                  <button
                    className="ziro-frame-menu-btn"
                    onClick={() => {
                      setActiveTool('frame');
                      setShowFramesMenu(false);
                    }}
                  >
                    <Monitor size={16} />
                    <span>16:9 Presentation</span>
                  </button>
                  <button
                    className="ziro-frame-menu-btn"
                    onClick={() => {
                      setActiveTool('frame');
                      setShowFramesMenu(false);
                    }}
                  >
                    <Smartphone size={16} />
                    <span>Phone / Mobile</span>
                  </button>
                  <button
                    className="ziro-frame-menu-btn"
                    onClick={() => {
                      setActiveTool('frame');
                      setShowFramesMenu(false);
                    }}
                  >
                    <Columns size={16} />
                    <span>Kanban Frame</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 11. Comment Tool (C) */}
        <div
          className="ziro-tool-item"
          onMouseEnter={() => setHoveredTool('comment')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className={`ziro-tool-btn ${activeTool === 'comment' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('comment');
              setShowStickyMenu(false);
              setShowShapesMenu(false);
              setShowFramesMenu(false);
              setShowMoreMenu(false);
            }}
            aria-label="Comment (C)"
          >
            {activeTool === 'comment' && <div className="ziro-active-pill" />}
            <MessageCircle size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'comment' && (
            <div className="ziro-tooltip">
              <span>Comment</span>
              <kbd>C</kbd>
            </div>
          )}
        </div>

        <div className="ziro-group-divider" />

        {/* 12. 🎙️ Voice Memo Pin Tool */}
        {onAddVoiceMemo && (
          <div
            className="ziro-tool-item"
            onMouseEnter={() => setHoveredTool('voice_memo')}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <button
              className="ziro-tool-btn"
              onClick={() => {
                onAddVoiceMemo();
                setShowStickyMenu(false);
                setShowShapesMenu(false);
                setShowFramesMenu(false);
                setShowMoreMenu(false);
              }}
              aria-label="Record Voice Memo Note"
            >
              <Mic size={20} className="text-violet-600" strokeWidth={2.2} />
            </button>
            {hoveredTool === 'voice_memo' && (
              <div className="ziro-tooltip">
                <span>🎙️ Voice Memo Pin</span>
                <span className="ziro-tooltip-sub">Audio Sticky</span>
              </div>
            )}
          </div>
        )}

        {/* 13. Eraser Tool (E) */}
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
              setShowFramesMenu(false);
              setShowMoreMenu(false);
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

        {/* 14. More Tools & Superpower Apps (>> / ...) */}
        <div
          className="ziro-tool-item relative"
          onMouseEnter={() => setHoveredTool('more')}
          onMouseLeave={() => setHoveredTool(null)}
        >
          <button
            className="ziro-tool-btn"
            onClick={() => {
              setShowMoreMenu((prev) => !prev);
              setShowStickyMenu(false);
              setShowShapesMenu(false);
              setShowFramesMenu(false);
            }}
            aria-label="More tools & apps"
          >
            <MoreHorizontal size={20} strokeWidth={2.2} />
          </button>
          {hoveredTool === 'more' && !showMoreMenu && (
            <div className="ziro-tooltip">
              <span>More Superpowers</span>
            </div>
          )}

          {showMoreMenu && (
            <>
              <div className="flyout-backdrop" onClick={() => setShowMoreMenu(false)} />
              <div className="ziro-flyout-card" style={{ width: '230px' }}>
                <div className="ziro-flyout-title">ZIRO SUPERPOWER APPS</div>
                <div className="ziro-frames-menu">
                  {onOpenAIStudio && (
                    <button
                      className="ziro-frame-menu-btn"
                      onClick={() => {
                        onOpenAIStudio();
                        setShowMoreMenu(false);
                      }}
                    >
                      <Sparkles size={16} className="text-indigo-600" />
                      <span>AI Whiteboard Studio</span>
                    </button>
                  )}
                  {onOpenMermaid && (
                    <button
                      className="ziro-frame-menu-btn"
                      onClick={() => {
                        onOpenMermaid();
                        setShowMoreMenu(false);
                      }}
                    >
                      <GitBranch size={16} className="text-blue-600" />
                      <span>Mermaid Diagram Runner</span>
                    </button>
                  )}
                  {onOpenVoting && (
                    <button
                      className="ziro-frame-menu-btn"
                      onClick={() => {
                        onOpenVoting();
                        setShowMoreMenu(false);
                      }}
                    >
                      <Vote size={16} className="text-emerald-600" />
                      <span>Live Team Dot-Voting</span>
                    </button>
                  )}
                  <button
                    className="ziro-frame-menu-btn"
                    onClick={() => {
                      onOpenTemplates();
                      setShowMoreMenu(false);
                    }}
                  >
                    <LayoutGrid size={16} />
                    <span>Template Library</span>
                  </button>
                  <button
                    className="ziro-frame-menu-btn"
                    onClick={() => {
                      onOpenShortcuts?.();
                      setShowMoreMenu(false);
                    }}
                  >
                    <Type size={16} />
                    <span>Keyboard Shortcuts</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>
    </aside>
  );
};

