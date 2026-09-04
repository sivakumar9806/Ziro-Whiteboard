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
} from 'lucide-react';
import type { CanvasElement, StickyColor, StickyElement, ShapeElementData, TextElementData } from '../../types/whiteboard';

interface ContextPropertyBarProps {
  selectedElements: CanvasElement[];
  onUpdateElements: (updates: Partial<CanvasElement>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

const COLOR_SWATCHES = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Slate', value: '#1e293b' },
  { label: 'White', value: '#ffffff' },
  { label: 'Soft Blue', value: '#eff6ff' },
  { label: 'Soft Green', value: '#ecfdf5' },
  { label: 'Soft Amber', value: '#fffbeb' },
];

const STICKY_COLORS: { color: StickyColor; hex: string }[] = [
  { color: 'yellow', hex: '#fef08a' },
  { color: 'coral', hex: '#fecdd3' },
  { color: 'blue', hex: '#bae6fd' },
  { color: 'green', hex: '#bbf7d0' },
  { color: 'purple', hex: '#e9d5ff' },
  { color: 'amber', hex: '#fed7aa' },
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
  const isShape = first.type === 'rectangle' || first.type === 'circle';
  const isArrow = first.type === 'arrow';
  const isText = first.type === 'text';
  const isDraw = first.type === 'draw';

  return (
    <div className="context-property-dock">
      {/* 1. Sticky Note Color Theme Swatches */}
      {isSticky && (
        <div className="prop-group">
          {STICKY_COLORS.map(({ color, hex }) => (
            <button
              key={color}
              className={`color-dot-btn ${(first as StickyElement).colorTheme === color ? 'active' : ''}`}
              style={{ backgroundColor: hex }}
              onClick={() => onUpdateElements({ colorTheme: color } as Partial<StickyElement>)}
              title={color}
            />
          ))}
        </div>
      )}

      {/* 2. Shape Fill Color Picker */}
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
            <span style={{ fontSize: '12px' }}>Fill</span>
          </button>

          {showColorPicker === 'fill' && (
            <div className="palette-popover">
              <div className="popover-title">Fill Color</div>
              <div className="popover-grid">
                {COLOR_SWATCHES.map((c) => (
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

      {/* 3. Stroke Color Picker (for Shape, Arrow, Draw) */}
      {(isShape || isArrow || isDraw) && (
        <div className="prop-group relative">
          <button
            className="prop-btn"
            onClick={() => setShowColorPicker((prev) => (prev === 'stroke' ? null : 'stroke'))}
            title="Border / Stroke Color"
          >
            <Palette size={16} />
            <div
              className="color-preview-box"
              style={{ backgroundColor: (first as ShapeElementData).stroke || '#3b82f6' }}
            />
          </button>

          {showColorPicker === 'stroke' && (
            <div className="palette-popover">
              <div className="popover-title">Stroke Color</div>
              <div className="popover-grid">
                {COLOR_SWATCHES.map((c) => (
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

      {/* 4. Stroke Width Selector */}
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

      {/* 5. Stroke Style (Solid / Dashed) */}
      {(isShape || isArrow) && (
        <div className="prop-group">
          <button
            className={`prop-btn ${((first as ShapeElementData).strokeStyle || 'solid') === 'solid' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ strokeStyle: 'solid' } as Partial<ShapeElementData>)}
            title="Solid line"
          >
            <div style={{ width: '16px', height: '2px', backgroundColor: 'currentColor' }} />
          </button>
          <button
            className={`prop-btn ${(first as ShapeElementData).strokeStyle === 'dashed' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ strokeStyle: 'dashed' } as Partial<ShapeElementData>)}
            title="Dashed line"
          >
            <div style={{ width: '16px', height: '2px', borderTop: '2px dashed currentColor' }} />
          </button>
        </div>
      )}

      {/* 6. Typography Controls (Font Size & Align) */}
      {(isSticky || isShape || isText) && (
        <div className="prop-group">
          <button
            className="prop-btn"
            onClick={() => {
              const current = ((first as TextElementData).fontSize || 16);
              onUpdateElements({ fontSize: Math.max(12, current - 2) } as Partial<TextElementData>);
            }}
            title="Decrease font size"
          >
            <Minus size={14} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '0 4px' }}>
            {((first as TextElementData).fontSize || 16)}px
          </span>
          <button
            className="prop-btn"
            onClick={() => {
              const current = ((first as TextElementData).fontSize || 16);
              onUpdateElements({ fontSize: Math.min(64, current + 2) } as Partial<TextElementData>);
            }}
            title="Increase font size"
          >
            <Plus size={14} />
          </button>

          <div className="prop-divider" />

          {/* Alignment */}
          <button
            className={`prop-btn ${(first as TextElementData).textAlign === 'left' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ textAlign: 'left' } as Partial<TextElementData>)}
            title="Align Left"
          >
            <AlignLeft size={15} />
          </button>
          <button
            className={`prop-btn ${((first as TextElementData).textAlign || 'center') === 'center' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ textAlign: 'center' } as Partial<TextElementData>)}
            title="Align Center"
          >
            <AlignCenter size={15} />
          </button>
          <button
            className={`prop-btn ${(first as TextElementData).textAlign === 'right' ? 'active' : ''}`}
            onClick={() => onUpdateElements({ textAlign: 'right' } as Partial<TextElementData>)}
            title="Align Right"
          >
            <AlignRight size={15} />
          </button>
        </div>
      )}

      <div className="prop-divider" />

      {/* 7. Layer Ordering */}
      <div className="prop-group">
        <button className="prop-btn" onClick={onBringForward} title="Bring Forward">
          <BringToFront size={16} />
        </button>
        <button className="prop-btn" onClick={onSendBackward} title="Send Backward">
          <SendToBack size={16} />
        </button>
      </div>

      <div className="prop-divider" />

      {/* 8. Actions: Duplicate & Delete */}
      <div className="prop-group">
        <button className="prop-btn" onClick={onDuplicateSelected} title="Duplicate (Ctrl+D)">
          <Copy size={16} />
        </button>
        <button className="prop-btn delete-btn" onClick={onDeleteSelected} title="Delete (Del)">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
