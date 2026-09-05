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
  const [isEditing, setIsEditing] = useState(isEditingDirectly ?? false);
  const [draftText, setDraftText] = useState(element.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync draft text when element text changes externally
  useEffect(() => {
    setDraftText(element.text || '');
  }, [element.text]);

  // Sync editing state
  useEffect(() => {
    if (isEditingDirectly !== undefined) {
      setIsEditing(isEditingDirectly);
    }
  }, [isEditingDirectly]);

  // Focus textarea when editing mode activates
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      // Move cursor to end of text
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
      // Auto-resize
      adjustHeight(textarea);
    }
  }, [isEditing]);

  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = `${Math.max(36, el.scrollHeight)}px`;
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onStartEditing?.();
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(element.id, { text: draftText });
    onFinishEditing?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDraftText(val);
    adjustHeight(e.target);
    onUpdate(element.id, { text: val });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      setIsEditing(false);
      onUpdate(element.id, { text: draftText });
      onFinishEditing?.();
    }
  };

  return (
    <div
      style={{
        width: `${element.width || 240}px`,
        minHeight: `${element.height || 40}px`,
        padding: '6px 10px',
        borderRadius: '4px',
        backgroundColor: element.fill || 'transparent',
        boxSizing: 'border-box',
        userSelect: isEditing ? 'text' : 'none',
        cursor: isEditing ? 'text' : 'pointer',
        outline: isSelected && !isEditing ? '1.5px dashed #3b82f6' : 'none',
        outlineOffset: '2px',
        position: 'relative',
      }}
      onClick={(e) => {
        if (!isEditing && isSelected) {
          handleStartEdit(e);
        }
      }}
      onDoubleClick={handleStartEdit}
      onPointerDown={(e) => {
        if (isEditing) {
          e.stopPropagation();
        }
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={draftText}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            minHeight: '36px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            resize: 'none',
            overflow: 'hidden',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: `${element.fontSize || 18}px`,
            fontWeight: element.fontWeight || 'normal',
            color: element.fontColor || '#0f172a',
            textAlign: element.textAlign || 'left',
            lineHeight: 1.4,
            padding: 0,
            display: 'block',
            boxSizing: 'border-box',
          }}
          placeholder="Type something here..."
        />
      ) : (
        <div
          style={{
            width: '100%',
            minHeight: '24px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: `${element.fontSize || 18}px`,
            fontWeight: element.fontWeight || 'normal',
            color: element.fontColor || '#0f172a',
            textAlign: element.textAlign || 'left',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {draftText || (
            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '15px' }}>
              Click to type text...
            </span>
          )}
        </div>
      )}
    </div>
  );
};
