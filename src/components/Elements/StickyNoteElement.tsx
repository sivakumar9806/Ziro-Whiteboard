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

const THEME_COLORS = {
  yellow: {
    bg: '#fef9c3',
    border: '#fde047',
    shadow: 'rgba(234, 179, 8, 0.25)',
    text: '#713f12',
    accent: '#facc15',
  },
  coral: {
    bg: '#ffe4e6',
    border: '#fecdd3',
    shadow: 'rgba(244, 63, 94, 0.22)',
    text: '#881337',
    accent: '#fb7185',
  },
  blue: {
    bg: '#e0f2fe',
    border: '#bae6fd',
    shadow: 'rgba(14, 165, 233, 0.22)',
    text: '#0c4a6e',
    accent: '#38bdf8',
  },
  green: {
    bg: '#dcfce7',
    border: '#bbf7d0',
    shadow: 'rgba(34, 197, 94, 0.22)',
    text: '#14532d',
    accent: '#4ade80',
  },
  purple: {
    bg: '#f3e8ff',
    border: '#e9d5ff',
    shadow: 'rgba(168, 85, 247, 0.22)',
    text: '#581c87',
    accent: '#c084fc',
  },
  amber: {
    bg: '#ffedd5',
    border: '#fed7aa',
    shadow: 'rgba(249, 115, 22, 0.22)',
    text: '#7c2d12',
    accent: '#fb923c',
  },
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
  const [draftText, setDraftText] = useState(element.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const theme = THEME_COLORS[element.colorTheme] || THEME_COLORS.yellow;

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
      setDraftText(element.text);
      onFinishEditing?.();
    }
  };

  return (
    <div
      className="sticky-note-container"
      style={{
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor: theme.bg,
        boxShadow: isSelected
          ? `0 12px 28px -4px ${theme.shadow}, 0 4px 12px rgba(0,0,0,0.08)`
          : `0 6px 16px -2px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)`,
        border: `1px solid ${theme.border}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        userSelect: isEditing ? 'text' : 'none',
        cursor: isEditing ? 'text' : 'default',
        transition: 'box-shadow 0.15s ease',
        overflow: 'hidden',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: theme.accent,
          opacity: 0.6,
          borderTopLeftRadius: '7px',
          borderTopRightRadius: '7px',
        }}
      />

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
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
            lineHeight: 1.4,
            padding: 0,
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
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflow: 'hidden',
          }}
        >
          {element.text || <span style={{ opacity: 0.45, fontStyle: 'italic' }}>Empty sticky note</span>}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '18px',
          height: '18px',
          background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.06) 50%, rgba(0,0,0,0.12) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
