import React, { useState, useRef, useEffect } from 'react';
import type { FrameElementData } from '../../types/whiteboard';

interface FrameElementProps {
  element: FrameElementData;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<FrameElementData>) => void;
  isEditingDirectly?: boolean;
  onStartEditing?: () => void;
  onFinishEditing?: () => void;
}

export const FrameElement: React.FC<FrameElementProps> = ({
  element,
  isSelected,
  onUpdate,
  isEditingDirectly,
  onStartEditing,
  onFinishEditing,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(isEditingDirectly || false);
  const [draftTitle, setDraftTitle] = useState(element.title || 'Untitled Frame');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingDirectly) {
      setIsEditingTitle(true);
    }
  }, [isEditingDirectly]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleBlur = () => {
    setIsEditingTitle(false);
    onUpdate(element.id, { title: draftTitle.trim() || 'Untitled Frame' });
    onFinishEditing?.();
  };

  return (
    <div
      className="frame-container"
      style={{
        width: `${element.width}px`,
        height: `${element.height}px`,
        backgroundColor: element.fill || 'rgba(255, 255, 255, 0.65)',
        border: isSelected ? '1.5px solid #4262ff' : '1px solid #cbd5e1',
        borderRadius: '12px',
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Miro-style top title tab */}
      <div
        className="frame-header-tab"
        style={{
          position: 'absolute',
          top: '-26px',
          left: '0px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 10px',
          backgroundColor: isSelected ? '#4262ff' : '#64748b',
          color: '#ffffff',
          borderRadius: '6px 6px 0 0',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditingTitle(true);
          onStartEditing?.();
        }}
      >
        {isEditingTitle ? (
          <input
            ref={inputRef}
            type="text"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBlur();
              if (e.key === 'Escape') {
                setIsEditingTitle(false);
                setDraftTitle(element.title);
                onFinishEditing?.();
              }
            }}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#ffffff',
              outline: 'none',
              fontSize: '12px',
              fontWeight: 600,
              width: '120px',
            }}
          />
        ) : (
          <span>{element.title}</span>
        )}
      </div>
    </div>
  );
};
