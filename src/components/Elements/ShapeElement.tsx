import React, { useState, useRef, useEffect } from 'react';
import type { ShapeElementData } from '../../types/whiteboard';

interface ShapeElementProps {
  element: ShapeElementData;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<ShapeElementData>) => void;
  isEditingDirectly?: boolean;
  onStartEditing?: () => void;
  onFinishEditing?: () => void;
}

export const ShapeElement: React.FC<ShapeElementProps> = ({
  element,
  onUpdate,
  isEditingDirectly,
  onStartEditing,
  onFinishEditing,
}) => {
  const [isEditing, setIsEditing] = useState(isEditingDirectly || false);
  const [draftText, setDraftText] = useState(element.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingDirectly) {
      setIsEditing(true);
    }
  }, [isEditingDirectly]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onStartEditing?.();
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(element.id, { text: draftText });
    onFinishEditing?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setDraftText(element.text || '');
      onFinishEditing?.();
    }
  };

  const w = element.width;
  const h = element.height;
  const strokeW = element.strokeWidth || 2;
  const strokeDash = element.strokeStyle === 'dashed' ? '6 6' : undefined;

  // Render SVG Path based on shape type
  const renderShapePath = () => {
    switch (element.type) {
      case 'circle':
        return (
          <ellipse
            cx={w / 2}
            cy={h / 2}
            rx={(w - strokeW) / 2}
            ry={(h - strokeW) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );

      case 'diamond': {
        const d = `M ${w / 2} ${strokeW / 2} L ${w - strokeW / 2} ${h / 2} L ${w / 2} ${h - strokeW / 2} L ${strokeW / 2} ${h / 2} Z`;
        return (
          <path
            d={d}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );
      }

      case 'triangle': {
        const d = `M ${w / 2} ${strokeW / 2} L ${w - strokeW / 2} ${h - strokeW / 2} L ${strokeW / 2} ${h - strokeW / 2} Z`;
        return (
          <path
            d={d}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );
      }

      case 'star': {
        const cx = w / 2;
        const cy = h / 2;
        const outerR = Math.min(w, h) / 2 - strokeW;
        const innerR = outerR * 0.45;
        let d = '';
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          d += i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `;
        }
        d += 'Z';
        return (
          <path
            d={d}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );
      }

      case 'cloud': {
        const d = `M ${w * 0.25} ${h * 0.7} 
                   A ${w * 0.15} ${h * 0.25} 0 0 1 ${w * 0.25} ${h * 0.4} 
                   A ${w * 0.2} ${h * 0.3} 0 0 1 ${w * 0.55} ${h * 0.25} 
                   A ${w * 0.25} ${h * 0.3} 0 0 1 ${w * 0.8} ${h * 0.45} 
                   A ${w * 0.15} ${h * 0.25} 0 0 1 ${w * 0.75} ${h * 0.7} 
                   Z`;
        return (
          <path
            d={d}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );
      }

      case 'speech_bubble': {
        const r = 10;
        const tailW = Math.min(24, w * 0.2);
        const tailH = Math.min(16, h * 0.2);
        const bodyH = h - tailH;
        const d = `M ${r} 0 
                   H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} 
                   V ${bodyH - r} A ${r} ${r} 0 0 1 ${w - r} ${bodyH} 
                   H ${tailW * 2} 
                   L ${tailW} ${h} 
                   L ${tailW * 1.2} ${bodyH} 
                   H ${r} A ${r} ${r} 0 0 1 0 ${bodyH - r} 
                   V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
        return (
          <path
            d={d}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );
      }

      case 'rounded_rectangle':
        return (
          <rect
            x={strokeW / 2}
            y={strokeW / 2}
            width={w - strokeW}
            height={h - strokeW}
            rx={16}
            ry={16}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );

      case 'rectangle':
      default:
        return (
          <rect
            x={strokeW / 2}
            y={strokeW / 2}
            width={w - strokeW}
            height={h - strokeW}
            rx={element.borderRadius ?? 4}
            ry={element.borderRadius ?? 4}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={strokeW}
            strokeDasharray={strokeDash}
          />
        );
    }
  };

  return (
    <div
      className="shape-container"
      style={{
        width: `${w}px`,
        height: `${h}px`,
        position: 'relative',
        userSelect: isEditing ? 'text' : 'none',
        cursor: isEditing ? 'text' : 'default',
        overflow: 'visible',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* SVG Shape Graphic */}
      <svg
        width={w}
        height={h}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
          filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.04))',
        }}
      >
        {renderShapePath()}
      </svg>

      {/* Embedded Text Label */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '80%',
          height: '80%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={draftText}
            onChange={(e) => {
              setDraftText(e.target.value);
              onUpdate(element.id, { text: e.target.value });
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              resize: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: `${element.fontSize || 16}px`,
              color: element.fontColor || '#1e293b',
              textAlign: element.textAlign || 'center',
              lineHeight: 1.3,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
            placeholder="Type label..."
          />
        ) : (
          <div
            style={{
              width: '100%',
              fontFamily: "'Inter', sans-serif",
              fontSize: `${element.fontSize || 16}px`,
              color: element.fontColor || '#1e293b',
              textAlign: element.textAlign || 'center',
              lineHeight: 1.3,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              pointerEvents: 'none',
            }}
          >
            {element.text}
          </div>
        )}
      </div>
    </div>
  );
};
