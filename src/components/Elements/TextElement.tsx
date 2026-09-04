import React, { useState, useRef, useEffect } from 'react';
import type { TextElementData } from '../../types/whiteboard';

interface TextElementProps {
  element: TextElementData;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<TextElementData>) => void;
  isEditingDirectly?: boolean;
  onStartEditing?: () => void;
  onFinishEditing?: () => void;
}

export const TextElement: React.FC<TextElementProps> = ({
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
      style={{
        width: `${element.width}px`,
        minHeight: `${element.height}px`,
        padding: '6px 8px',
        borderRadius: '4px',
        backgroundColor: element.fill || 'transparent',
        boxSizing: 'border-box',
        userSelect: isEditing ? 'text' : 'none',
        cursor: isEditing ? 'text' : 'default',
        outline: isSelected && !isEditing ? '1px dashed #3b82f6' : 'none',
        outlineOffset: '2px',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            minHeight: `${element.height}px`,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            resize: 'none',
            fontFamily: "'Inter', sans-serif",
            fontSize: `${element.fontSize || 16}px`,
            fontWeight: element.fontWeight || 'normal',
            color: element.fontColor || '#1e293b',
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
            fontFamily: "'Inter', sans-serif",
            fontSize: `${element.fontSize || 16}px`,
            fontWeight: element.fontWeight || 'normal',
            color: element.fontColor || '#1e293b',
            textAlign: element.textAlign || 'left',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {element.text || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>Double click to edit</span>}
        </div>
      )}
    </div>
  );
};
