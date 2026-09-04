import React from 'react';
import type { CanvasElement } from '../../types/whiteboard';
import { StickyNoteElement } from '../Elements/StickyNoteElement';
import { ShapeElement } from '../Elements/ShapeElement';
import { FrameElement } from '../Elements/FrameElement';
import { ArrowElement } from '../Elements/ArrowElement';
import { FreehandElement } from '../Elements/FreehandElement';
import { TextElement } from '../Elements/TextElement';
import { CommentElement } from '../Elements/CommentElement';

interface ElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete?: (id: string) => void;
  isEditingDirectly?: boolean;
  onStartEditing?: () => void;
  onFinishEditing?: () => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  onUpdate,
  onDelete,
  isEditingDirectly,
  onStartEditing,
  onFinishEditing,
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    zIndex: element.type === 'frame' ? 0 : element.zIndex,
    opacity: element.opacity ?? 1,
    transformOrigin: 'center center',
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
  };

  if (element.type === 'arrow') {
    return <ArrowElement element={element} isSelected={isSelected} />;
  }

  if (element.type === 'draw') {
    return <FreehandElement element={element} isSelected={isSelected} />;
  }

  const isShapeType = [
    'rectangle',
    'rounded_rectangle',
    'circle',
    'diamond',
    'triangle',
    'star',
    'cloud',
    'speech_bubble',
  ].includes(element.type);

  return (
    <div style={containerStyle} data-element-id={element.id}>
      {element.type === 'frame' && (
        <FrameElement
          element={element}
          isSelected={isSelected}
          onUpdate={onUpdate}
          isEditingDirectly={isEditingDirectly}
          onStartEditing={onStartEditing}
          onFinishEditing={onFinishEditing}
        />
      )}
      {element.type === 'sticky' && (
        <StickyNoteElement
          element={element}
          isSelected={isSelected}
          onUpdate={onUpdate}
          isEditingDirectly={isEditingDirectly}
          onStartEditing={onStartEditing}
          onFinishEditing={onFinishEditing}
        />
      )}
      {isShapeType && (
        <ShapeElement
          element={element as any}
          isSelected={isSelected}
          onUpdate={onUpdate}
          isEditingDirectly={isEditingDirectly}
          onStartEditing={onStartEditing}
          onFinishEditing={onFinishEditing}
        />
      )}
      {element.type === 'comment' && (
        <CommentElement
          element={element}
          isSelected={isSelected}
          onUpdate={(updates) => onUpdate(element.id, updates)}
          onDelete={() => onDelete?.(element.id)}
        />
      )}
      {element.type === 'text' && (
        <TextElement
          element={element}
          isSelected={isSelected}
          onUpdate={onUpdate}
          isEditingDirectly={isEditingDirectly}
          onStartEditing={onStartEditing}
          onFinishEditing={onFinishEditing}
        />
      )}
    </div>
  );
};
