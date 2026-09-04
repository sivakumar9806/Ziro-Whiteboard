import React, { useState } from 'react';
import {
  MousePointer,
  Hand,
  StickyNote,
  Square,
  Circle,
  MoveRight,
  PenTool,
  Type,
  Eraser,
  Check,
} from 'lucide-react';
import type { ToolType, StickyColor } from '../../types/whiteboard';

interface LeftToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  activeStickyColor: StickyColor;
  setActiveStickyColor: (color: StickyColor) => void;
}

interface ToolDefinition {
  id: ToolType;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  group: 'navigate' | 'shapes' | 'draw' | 'manage';
  hasSubmenu?: boolean;
}

const STICKY_PALETTE: { color: StickyColor; bg: string; border: string; label: string }[] = [
  { color: 'yellow', bg: '#fef08a', border: '#fde047', label: 'Yellow' },
  { color: 'coral', bg: '#fecdd3', border: '#fda4af', label: 'Coral / Pink' },
  { color: 'blue', bg: '#bae6fd', border: '#7dd3fc', label: 'Sky Blue' },
  { color: 'green', bg: '#bbf7d0', border: '#86efac', label: 'Mint Green' },
  { color: 'purple', bg: '#e9d5ff', border: '#d8b4fe', label: 'Lavender' },
  { color: 'amber', bg: '#fed7aa', border: '#fdba74', label: 'Warm Amber' },
];

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeStickyColor,
  setActiveStickyColor,
}) => {
  const [showStickyMenu, setShowStickyMenu] = useState(false);
  const [hoveredTool, setHoveredTool] = useState<ToolType | null>(null);

  const tools: ToolDefinition[] = [
    { id: 'select', label: 'Select tool', icon: <MousePointer size={20} strokeWidth={2.2} />, shortcut: 'V', group: 'navigate' },
    { id: 'pan', label: 'Hand / Pan canvas', icon: <Hand size={20} strokeWidth={2.2} />, shortcut: 'H', group: 'navigate' },
    {
      id: 'sticky',
      label: 'Sticky Note',
      icon: <StickyNote size={20} strokeWidth={2.2} />,
      shortcut: 'S',
      group: 'shapes',
      hasSubmenu: true,
    },
    { id: 'rectangle', label: 'Rectangle Shape', icon: <Square size={20} strokeWidth={2.2} />, shortcut: 'R', group: 'shapes' },
    { id: 'circle', label: 'Circle Shape', icon: <Circle size={20} strokeWidth={2.2} />, shortcut: 'O', group: 'shapes' },
    { id: 'arrow', label: 'Connection Arrow', icon: <MoveRight size={20} strokeWidth={2.2} />, shortcut: 'A', group: 'shapes' },
    { id: 'draw', label: 'Freehand Pen', icon: <PenTool size={20} strokeWidth={2.2} />, shortcut: 'P', group: 'draw' },
    { id: 'text', label: 'Text Box', icon: <Type size={20} strokeWidth={2.2} />, shortcut: 'T', group: 'draw' },
    { id: 'eraser', label: 'Eraser', icon: <Eraser size={20} strokeWidth={2.2} />, shortcut: 'E', group: 'manage' },
  ];

  const currentStickyTheme = STICKY_PALETTE.find((p) => p.color === activeStickyColor) || STICKY_PALETTE[0];

  return (
    <aside className="left-toolbar-wrapper" aria-label="Whiteboard toolbar">
      <nav className="left-toolbar-dock">
        {tools.map((t, index) => {
          const isActive = activeTool === t.id;
          const isNextDifferentGroup =
            index < tools.length - 1 && tools[index + 1].group !== t.group;

          return (
            <React.Fragment key={t.id}>
              <div
                className="tool-item-container"
                onMouseEnter={() => setHoveredTool(t.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <button
                  className={`toolbar-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTool(t.id);
                    if (t.id === 'sticky') {
                      setShowStickyMenu((prev) => !prev);
                    } else {
                      setShowStickyMenu(false);
                    }
                  }}
                  aria-label={t.label}
                  aria-pressed={isActive}
                >
                  {/* Left active indicator pill */}
                  {isActive && <div className="active-pill-indicator" />}

                  <span className="tool-icon-wrapper">{t.icon}</span>

                  {/* For sticky notes: live selected color pip */}
                  {t.id === 'sticky' && (
                    <span
                      className="sticky-color-pip"
                      style={{ backgroundColor: currentStickyTheme.bg }}
                    />
                  )}
                </button>

                {/* Custom Interactive Tooltip */}
                {hoveredTool === t.id && !showStickyMenu && (
                  <div className="tool-custom-tooltip" role="tooltip">
                    <span className="tooltip-title">{t.label}</span>
                    <kbd className="tooltip-kbd">{t.shortcut}</kbd>
                  </div>
                )}

                {/* Sticky Note Color Quick Palette Flyout */}
                {t.id === 'sticky' && showStickyMenu && (
                  <>
                    <div className="flyout-backdrop" onClick={() => setShowStickyMenu(false)} />
                    <div className="sticky-color-flyout">
                      <div className="flyout-header">
                        <span className="flyout-title">Sticky Note Color</span>
                      </div>
                      <div className="sticky-color-grid">
                        {STICKY_PALETTE.map((item) => {
                          const isColorActive = activeStickyColor === item.color;
                          return (
                            <button
                              key={item.color}
                              className={`sticky-color-swatch ${isColorActive ? 'active' : ''}`}
                              style={{
                                backgroundColor: item.bg,
                                borderColor: item.border,
                              }}
                              onClick={() => {
                                setActiveStickyColor(item.color);
                                setActiveTool('sticky');
                                setShowStickyMenu(false);
                              }}
                              title={item.label}
                            >
                              {isColorActive && (
                                <Check size={14} className="swatch-check-icon" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Group Divider */}
              {isNextDifferentGroup && <div className="toolbar-group-divider" />}
            </React.Fragment>
          );
        })}
      </nav>
    </aside>
  );
};
