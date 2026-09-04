import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Minus,
  Plus,
  Lock,
  Unlock,
} from 'lucide-react';
import type { CanvasElement, StickyElement, ShapeElementData, TextElementData } from '../../types/whiteboard';
import { MIRO_STICKY_SWATCHES } from './LeftToolbar';

interface ContextPropertyBarProps {
  selectedElements: CanvasElement[];
  onUpdateElements: (updates: Partial<CanvasElement>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

const SHAPE_PALETTES = [
  { label: 'White', value: '#ffffff' },
  { label: 'Pastel Blue', value: '#eff6ff' },
  { label: 'Pastel Green', value: '#ecfdf5' },
  { label: 'Pastel Yellow', value: '#fffbeb' },
  { label: 'Pastel Rose', value: '#fff1f2' },
  { label: 'Pastel Purple', value: '#faf5ff' },
  { label: 'Deep Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Dark Slate', value: '#1e293b' },
];

export const ContextPropertyBar: React.FC<ContextPropertyBarProps> = ({
  selectedElements,
  onUpdateElements,
  onDeleteSelected,
  onDuplicateSelected,
  onBringForward,
  onSendBackward,
}) => {
  const [showColorPicker, setShowColorPicker] = useState<'fill' | 'stroke' | 'sticky' | null>(null);

  if (selectedElements.length === 0) return null;

  const first = selectedElements[0];
  const isSticky = first.type === 'sticky';
  const isShape = first.type === 'rectangle' || first.type === 'circle' || first.type === 'diamond';
  const isArrow = first.type === 'arrow';
  const isText = first.type === 'text';
  const isDraw = first.type === 'draw';
  const isLocked = first.locked || false;

  return (
    <div className="ziro-context-dock">
      {/* 1. Sticky Note Palette */}
      {isSticky && (
        <div className="prop-group">
          {MIRO_STICKY_SWATCHES.map(({ color, bg }) => (
            <button
              key={color}
              className={`color-dot-btn ${(first as StickyElement).colorTheme === color ? 'active' : ''}`}
              style={{ backgroundColor: bg }}
              onClick={() => onUpdateElements({ colorTheme: color } as Partial<StickyElement>)}
              title={color}
            />
          ))}
        </div>
      )}

      {/* 2. Shape Fill Color */}
      {isShape && (
        <div className="prop-group relative">
          <button
            className="prop-btn"
            onClick={() => setShowColorPicker((prev) => (prev === 'fill' ? null : 'fill'))}
            title="Fill Color"
          >
            <div
              className="color-preview-box"
              style={{ backgroundColor: (first as ShapeElementData).fill || '#ffffff' }}
            />
            <span>Fill</span>
          </button>

          {showColorPicker === 'fill' && (
            <div className="palette-popover">
              <div className="popover-title">FILL COLOR</div>
              <div className="popover-grid">
                {SHAPE_PALETTES.map((c) => (
                  <button
                    key={c.value}
                    className="swatch-btn"
                    style={{ backgroundColor: c.value }}
                    onClick={() => {
                      onUpdateElements({ fill: c.value } as Partial<ShapeElementData>);
                      setShowColorPicker(null);
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Stroke Color Picker */}
      {(isShape || isArrow || isDraw) && (
        <div className="prop-group relative">
          <button
            className="prop-btn"
            onClick={() => setShowColorPicker((prev) => (prev === 'stroke' ? null : 'stroke'))}
            title="Stroke Color"
          >
            <Palette size={15} />
            <div
              className="color-preview-box"
              style={{ backgroundColor: (first as ShapeElementData).stroke || '#4262ff' }}
            />
          </button>

          {showColorPicker === 'stroke' && (
            <div className="palette-popover">
              <div className="popover-title">STROKE COLOR</div>
              <div className="popover-grid">
                {SHAPE_PALETTES.map((c) => (
                  <button
                    key={c.value}
                    className="swatch-btn"
                    style={{ backgroundColor: c.value }}
                    onClick={() => {
                      onUpdateElements({ stroke: c.value } as Partial<ShapeElementData>);
                      setShowColorPicker(null);
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Stroke Width */}
      {(isShape || isArrow || isDraw) && (
        <div className="prop-group">
          {[1, 2, 4, 6].map((w) => {
            const currentWidth = (first as ShapeElementData).strokeWidth || 2;
            return (
              <button
                key={w}
                className={`stroke-width-btn ${currentWidth === w ? 'active' : ''}`}
                onClick={() => onUpdateElements({ strokeWidth: w } as Partial<ShapeElementData>)}
                title={`${w}px width`}
              >
                <div style={{ height: `${w}px`, width: '14px', backgroundColor: 'currentColor', borderRadius: '1px' }} />
              </button>
            );
          })}
        </div>
      )}

      {/* 5. Typography Controls */}
      {(isSticky || isShape || isText) && (
        <div className="prop-group">
          <button
            className="prop-btn"
            onClick={() => {
              const current = (first as TextElementData).fontSize || 14;
              onUpdateElements({ fontSize: Math.max(12, current - 2) } as Partial<TextElementData>);
            }}
            title="Smaller font"
          >
            <Minus size={13} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 600, minWidth: '22px', textAlign: 'center' }}>
            {(first as TextElementData).fontSize || 14}
          </span>
          <button
            className="prop-btn"
            onClick={() => {
              const current = (first as TextElementData).fontSize || 14;
              onUpdateElements({ fontSize: Math.min(64, current + 2) } as Partial<TextElementData>);
            }}
            title="Larger font"
          >
            <Plus size={13} />
          </button>

          <div className="prop-divider" />

          <button
            className={`prop-btn ${(first as TextElementData).textAlign === 'left' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ textAlign: 'left' } as Partial<TextElementData>)}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            className={`prop-btn ${((first as TextElementData).textAlign || 'center') === 'center' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ textAlign: 'center' } as Partial<TextElementData>)}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            className={`prop-btn ${(first as TextElementData).textAlign === 'right' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ textAlign: 'right' } as Partial<TextElementData>)}
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>
        </div>
      )}

      <div className="prop-divider" />

      {/* 6. Lock Toggle */}
      <button
        className={`prop-btn ${isLocked ? 'active' : ''}`}
        onClick={() => onUpdateElements({ locked: !isLocked })}
        title={isLocked ? 'Unlock element' : 'Lock element'}
      >
        {isLocked ? <Lock size={14} className="text-amber-500" /> : <Unlock size={14} />}
      </button>

      {/* 7. Layer Order */}
      <div className="prop-group">
        <button className="prop-btn" onClick={onBringForward} title="Bring to front">
          <BringToFront size={14} />
        </button>
        <button className="prop-btn" onClick={onSendBackward} title="Send to back">
          <SendToBack size={14} />
        </button>
      </div>

      <div className="prop-divider" />

      {/* 8. Duplicate & Delete */}
      <div className="prop-group">
        <button className="prop-btn" onClick={onDuplicateSelected} title="Duplicate (Ctrl+D)">
          <Copy size={14} />
        </button>
        <button className="prop-btn delete-btn" onClick={onDeleteSelected} title="Delete (Del)">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
