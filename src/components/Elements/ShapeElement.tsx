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

  const isCircle = element.type === 'circle';
  const borderRadius = isCircle ? '50%' : `${element.borderRadius ?? 8}px`;

  return (
    <div
      className="shape-container"
      style={{
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor: element.fill,
        border: `${element.strokeWidth}px ${element.strokeStyle} ${element.stroke}`,
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxSizing: 'border-box',
        position: 'relative',
        userSelect: isEditing ? 'text' : 'none',
        cursor: isEditing ? 'text' : 'default',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
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
  );
};
