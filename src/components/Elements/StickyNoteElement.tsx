import React, { useState, useRef, useEffect } from 'react';
import type { StickyElement } from '../../types/whiteboard';

interface StickyNoteElementProps {
  element: StickyElement;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<StickyElement>) => void;
  isEditingDirectly?: boolean;
  onStartEditing?: () => void;
  onFinishEditing?: () => void;
}

// Authentic Miro Sticky Note Color Palette
export const MIRO_STICKY_THEMES = {
  yellow: { bg: '#fff9b1', border: '#fef08a', text: '#3c3500', shadow: 'rgba(234, 179, 8, 0.15)' },
  blue: { bg: '#d0e7ff', border: '#bae6fd', text: '#002f6c', shadow: 'rgba(14, 165, 233, 0.15)' },
  green: { bg: '#d5f5e3', border: '#bbf7d0', text: '#0e4e26', shadow: 'rgba(34, 197, 94, 0.15)' },
  pink: { bg: '#f5d1c3', border: '#fecdd3', text: '#5c1b05', shadow: 'rgba(244, 63, 94, 0.15)' },
  orange: { bg: '#ffe0b2', border: '#fed7aa', text: '#632e00', shadow: 'rgba(249, 115, 22, 0.15)' },
  purple: { bg: '#e6d9ff', border: '#e9d5ff', text: '#38006b', shadow: 'rgba(168, 85, 247, 0.15)' },
  cyan: { bg: '#cbf0f8', border: '#a5f3fc', text: '#004953', shadow: 'rgba(6, 182, 212, 0.15)' },
  gray: { bg: '#f1f5f9', border: '#e2e8f0', text: '#334155', shadow: 'rgba(100, 116, 139, 0.12)' },
};

export const StickyNoteElement: React.FC<StickyNoteElementProps> = ({
  element,
  isSelected,
  onUpdate,
  isEditingDirectly,
  onStartEditing,
  onFinishEditing,
}) => {
  const [isEditing, setIsEditing] = useState(isEditingDirectly || false);
  const [draftText, setDraftText] = useState(element.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const theme = MIRO_STICKY_THEMES[element.colorTheme] || MIRO_STICKY_THEMES.yellow;

  useEffect(() => {
    setDraftText(element.text || '');
  }, [element.text]);

  useEffect(() => {
    if (isEditingDirectly) {
      setIsEditing(true);
    }
  }, [isEditingDirectly]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEditing = (e: React.MouseEvent) => {
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
    e.stopPropagation();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setDraftText(element.text || '');
      onFinishEditing?.();
    }
  };

  return (
    <div
      className="miro-sticky-note"
      style={{
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor: theme.bg,
        boxShadow: isSelected
          ? `0 14px 28px -4px ${theme.shadow}, 0 4px 10px rgba(0,0,0,0.06), 0 0 0 1.5px #4262ff`
          : `0 8px 18px -2px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)`,
        borderRadius: '3px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: isEditing ? 'text' : 'none',
        cursor: isEditing ? 'text' : 'pointer',
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'box-shadow 0.15s ease',
      }}
      onDoubleClick={handleStartEditing}
      onClick={(e) => {
        if (isSelected && !isEditing) {
          handleStartEditing(e);
        }
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
            fontSize: `${element.fontSize || 14}px`,
            color: element.fontColor || theme.text,
            textAlign: element.textAlign || 'left',
            lineHeight: 1.45,
            padding: 0,
            fontWeight: 500,
            cursor: 'text',
          }}
          placeholder="Type something..."
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            fontFamily: "'Inter', sans-serif",
            fontSize: `${element.fontSize || 14}px`,
            color: element.fontColor || theme.text,
            textAlign: element.textAlign || 'left',
            lineHeight: 1.45,
            fontWeight: 500,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          {element.text || <span style={{ opacity: 0.35, fontStyle: 'italic' }}>Empty sticky note</span>}
        </div>
      )}

      {/* Miro signature folded corner bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.12) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
