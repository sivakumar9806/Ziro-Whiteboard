import React, { useRef, useState, useCallback } from 'react';
import type {
  ToolType,
  CanvasElement,
  ViewportTransform,
  Point,
  SelectionBounds,
  ResizeHandle,
  StickyColor,
} from '../../types/whiteboard';
import {
  screenToWorld,
  getElementsBounds,
  isPointInElement,
  isElementInBox,
  calculateResize,
} from '../../utils/geometry';
import { GridBackground } from './GridBackground';
import { ElementRenderer } from './ElementRenderer';
import { SelectionBox } from './SelectionBox';
import { MarqueeSelect } from './MarqueeSelect';

interface WhiteboardCanvasProps {
  elements: CanvasElement[];
  setElements: (elements: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => void;
  setElementsTransient: (updater: (prev: CanvasElement[]) => CanvasElement[]) => void;
  viewport: ViewportTransform;
  setViewport: React.Dispatch<React.SetStateAction<ViewportTransform>>;
  setPan: (dx: number, dy: number) => void;
  zoomAtPoint: (factor: number, screenPoint: Point, containerRect: DOMRect) => void;
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  isSpacePanning: boolean;
  activeStickyColor: StickyColor;
  activeStrokeColor: string;
  activeFillColor: string;
  activeStrokeWidth: number;
}

type InteractionMode =
  | 'idle'
  | 'panning'
  | 'dragging'
  | 'resizing'
  | 'drawing'
  | 'marquee'
  | 'creating_shape'
  | 'creating_arrow';

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  elements,
  setElements,
  setElementsTransient,
  viewport,
  setPan,
  zoomAtPoint,
  activeTool,
  setActiveTool,
  selectedIds,
  setSelectedIds,
  isSpacePanning,
  activeStickyColor,
  activeStrokeColor,
  activeFillColor,
  activeStrokeWidth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');
  const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [marqueeBounds, setMarqueeBounds] = useState<SelectionBounds | null>(null);
  const [activeResizeHandle, setActiveResizeHandle] = useState<ResizeHandle | null>(null);
  const [initialSelectedBounds, setInitialSelectedBounds] = useState<SelectionBounds | null>(null);
  const [initialElementsSnapshot, setInitialElementsSnapshot] = useState<CanvasElement[]>([]);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);

  // Freehand drawing in-progress points
  const [currentDrawPoints, setCurrentDrawPoints] = useState<Point[]>([]);

  // Arrow / Shape creation in-progress
  const [creationStart, setCreationStart] = useState<Point | null>(null);
  const [creationCurrent, setCreationCurrent] = useState<Point | null>(null);

  // Selected elements calculation
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  const selectionBounds = getElementsBounds(selectedElements);
  const singleSelectedElement = selectedElements.length === 1 ? selectedElements[0] : undefined;

  // -------------------------------------------------------------
  // Pointer Down Handlers
  // -------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const screenPt: Point = { x: e.clientX, y: e.clientY };
    const worldPt = screenToWorld(screenPt, viewport, containerRect);

    // 1. Pan gestures: Middle click or Spacebar held or Pan tool selected
    if (e.button === 1 || isSpacePanning || activeTool === 'pan') {
      setInteractionMode('panning');
      setDragStartPoint(screenPt);
      containerRef.current.setPointerCapture(e.pointerId);
      return;
    }

    if (e.button !== 0) return;

    // 2. Eraser tool
    if (activeTool === 'eraser') {
      const hit = [...elements].reverse().find((el) => isPointInElement(worldPt, el));
      if (hit) {
        setElements((prev) => prev.filter((el) => el.id !== hit.id));
        setSelectedIds((prev) => prev.filter((id) => id !== hit.id));
      }
      return;
    }

    // 3. Freehand Draw tool
    if (activeTool === 'draw') {
      setInteractionMode('drawing');
      setCurrentDrawPoints([worldPt]);
      containerRef.current.setPointerCapture(e.pointerId);
      return;
    }

    // 4. Arrow creation tool
    if (activeTool === 'arrow') {
      setInteractionMode('creating_arrow');
      setCreationStart(worldPt);
      setCreationCurrent(worldPt);
      containerRef.current.setPointerCapture(e.pointerId);
      return;
    }

    // 5. Shape creation tools (Rectangle, Circle)
    if (activeTool === 'rectangle' || activeTool === 'circle') {
      setInteractionMode('creating_shape');
      setCreationStart(worldPt);
      setCreationCurrent(worldPt);
      containerRef.current.setPointerCapture(e.pointerId);
      return;
    }

    // 6. Sticky Note Quick Click Creation
    if (activeTool === 'sticky') {
      const newStickyId = `sticky-${Date.now()}`;
      const newSticky: CanvasElement = {
        id: newStickyId,
        type: 'sticky',
        x: worldPt.x - 100,
        y: worldPt.y - 90,
        width: 200,
        height: 180,
        colorTheme: activeStickyColor,
        text: '',
        fontSize: 14,
        textAlign: 'left',
        zIndex: elements.length + 1,
      };
      setElements((prev) => [...prev, newSticky]);
      setSelectedIds([newStickyId]);
      setActiveTool('select');
      setEditingElementId(newStickyId);
      return;
    }

    // 7. Text Quick Click Creation
    if (activeTool === 'text') {
      const newTextId = `text-${Date.now()}`;
      const newText: CanvasElement = {
        id: newTextId,
        type: 'text',
        x: worldPt.x,
        y: worldPt.y,
        width: 220,
        height: 48,
        text: '',
        fontSize: 18,
        fontColor: activeStrokeColor || '#1e293b',
        textAlign: 'left',
        zIndex: elements.length + 1,
      };
      setElements((prev) => [...prev, newText]);
      setSelectedIds([newTextId]);
      setActiveTool('select');
      setEditingElementId(newTextId);
      return;
    }

    // 8. Select Tool: Hit testing
    if (activeTool === 'select') {
      const hitElement = [...elements].reverse().find((el) => isPointInElement(worldPt, el));

      if (hitElement) {
        const isAlreadySelected = selectedIds.includes(hitElement.id);

        if (e.shiftKey) {
          setSelectedIds((prev) =>
            isAlreadySelected ? prev.filter((id) => id !== hitElement.id) : [...prev, hitElement.id]
          );
        } else if (!isAlreadySelected) {
          setSelectedIds([hitElement.id]);
        }

        setInteractionMode('dragging');
        setDragStartPoint(worldPt);
        setInitialElementsSnapshot(elements);
        containerRef.current.setPointerCapture(e.pointerId);
      } else {
        if (!e.shiftKey) {
          setSelectedIds([]);
        }
        setInteractionMode('marquee');
        setDragStartPoint(worldPt);
        setMarqueeBounds({ x: worldPt.x, y: worldPt.y, width: 0, height: 0 });
        containerRef.current.setPointerCapture(e.pointerId);
      }
    }
  };

  // -------------------------------------------------------------
  // Pointer Move Handlers
  // -------------------------------------------------------------
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const screenPt: Point = { x: e.clientX, y: e.clientY };
    const worldPt = screenToWorld(screenPt, viewport, containerRect);

    if (interactionMode === 'panning') {
      const dx = screenPt.x - dragStartPoint.x;
      const dy = screenPt.y - dragStartPoint.y;
      setPan(dx, dy);
      setDragStartPoint(screenPt);
      return;
    }

    if (interactionMode === 'drawing') {
      setCurrentDrawPoints((prev) => [...prev, worldPt]);
      return;
    }

    if (interactionMode === 'dragging') {
      const dx = worldPt.x - dragStartPoint.x;
      const dy = worldPt.y - dragStartPoint.y;

      setElementsTransient(() => {
        return initialElementsSnapshot.map((el) => {
          if (selectedIds.includes(el.id)) {
            if (el.type === 'arrow') {
              return {
                ...el,
                startX: el.startX + dx,
                startY: el.startY + dy,
                endX: el.endX + dx,
                endY: el.endY + dy,
              };
            }
            if (el.type === 'draw') {
              return {
                ...el,
                points: el.points.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })),
              };
            }
            return {
              ...el,
              x: el.x + dx,
              y: el.y + dy,
            };
          }
          return el;
        });
      });
      return;
    }

    if (interactionMode === 'resizing' && activeResizeHandle && initialSelectedBounds && singleSelectedElement) {
      if (activeResizeHandle === 'arrow-start' && singleSelectedElement.type === 'arrow') {
        setElementsTransient((prev) =>
          prev.map((el) => (el.id === singleSelectedElement.id ? { ...el, startX: worldPt.x, startY: worldPt.y } : el))
        );
        return;
      }

      if (activeResizeHandle === 'arrow-end' && singleSelectedElement.type === 'arrow') {
        setElementsTransient((prev) =>
          prev.map((el) => (el.id === singleSelectedElement.id ? { ...el, endX: worldPt.x, endY: worldPt.y } : el))
        );
        return;
      }

      const deltaX = worldPt.x - dragStartPoint.x;
      const deltaY = worldPt.y - dragStartPoint.y;
      const newBounds = calculateResize(initialSelectedBounds, activeResizeHandle, deltaX, deltaY);

      setElementsTransient((prev) =>
        prev.map((el) => {
          if (el.id === singleSelectedElement.id) {
            return {
              ...el,
              x: newBounds.x,
              y: newBounds.y,
              width: newBounds.width,
              height: newBounds.height,
            };
          }
          return el;
        })
      );
      return;
    }

    if (interactionMode === 'marquee') {
      const minX = Math.min(dragStartPoint.x, worldPt.x);
      const minY = Math.min(dragStartPoint.y, worldPt.y);
      const width = Math.abs(worldPt.x - dragStartPoint.x);
      const height = Math.abs(worldPt.y - dragStartPoint.y);

      const box: SelectionBounds = { x: minX, y: minY, width, height };
      setMarqueeBounds(box);

      const matchingIds = elements.filter((el) => isElementInBox(el, box)).map((el) => el.id);
      setSelectedIds(matchingIds);
      return;
    }

    if (interactionMode === 'creating_arrow' || interactionMode === 'creating_shape') {
      setCreationCurrent(worldPt);
      return;
    }
  };

  // -------------------------------------------------------------
  // Pointer Up Handlers
  // -------------------------------------------------------------
  const handlePointerUp = (e: React.PointerEvent) => {
    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    if (interactionMode === 'drawing' && currentDrawPoints.length > 0) {
      const newDrawElement: CanvasElement = {
        id: `draw-${Date.now()}`,
        type: 'draw',
        x: currentDrawPoints[0].x,
        y: currentDrawPoints[0].y,
        width: 10,
        height: 10,
        points: currentDrawPoints,
        stroke: activeStrokeColor || '#1e293b',
        strokeWidth: activeStrokeWidth || 3,
        zIndex: elements.length + 1,
      };
      setElements((prev) => [...prev, newDrawElement]);
      setCurrentDrawPoints([]);
    }

    if (interactionMode === 'creating_arrow' && creationStart && creationCurrent) {
      const dist = Math.hypot(creationCurrent.x - creationStart.x, creationCurrent.y - creationStart.y);
      const endPt = dist < 20 ? { x: creationStart.x + 120, y: creationStart.y } : creationCurrent;

      const newArrow: CanvasElement = {
        id: `arrow-${Date.now()}`,
        type: 'arrow',
        x: Math.min(creationStart.x, endPt.x),
        y: Math.min(creationStart.y, endPt.y),
        width: Math.abs(endPt.x - creationStart.x) || 10,
        height: Math.abs(endPt.y - creationStart.y) || 10,
        startX: creationStart.x,
        startY: creationStart.y,
        endX: endPt.x,
        endY: endPt.y,
        stroke: activeStrokeColor || '#3b82f6',
        strokeWidth: activeStrokeWidth || 3,
        strokeStyle: 'solid',
        arrowHead: 'end',
        zIndex: elements.length + 1,
      };
      setElements((prev) => [...prev, newArrow]);
      setSelectedIds([newArrow.id]);
      setActiveTool('select');
      setCreationStart(null);
      setCreationCurrent(null);
    }

    if (interactionMode === 'creating_shape' && creationStart && creationCurrent) {
      const width = Math.max(Math.abs(creationCurrent.x - creationStart.x), 120);
      const height = Math.max(Math.abs(creationCurrent.y - creationStart.y), 80);
      const x = Math.min(creationStart.x, creationCurrent.x);
      const y = Math.min(creationStart.y, creationCurrent.y);

      const shapeType = activeTool === 'circle' ? 'circle' : 'rectangle';
      const newShapeId = `shape-${Date.now()}`;
      const newShape: CanvasElement = {
        id: newShapeId,
        type: shapeType,
        x,
        y,
        width,
        height,
        fill: activeFillColor || (shapeType === 'circle' ? '#eff6ff' : '#ffffff'),
        stroke: activeStrokeColor || '#3b82f6',
        strokeWidth: activeStrokeWidth || 2,
        strokeStyle: 'solid',
        borderRadius: shapeType === 'rectangle' ? 12 : undefined,
        text: '',
        fontSize: 16,
        fontColor: '#1e293b',
        textAlign: 'center',
        zIndex: elements.length + 1,
      };

      setElements((prev) => [...prev, newShape]);
      setSelectedIds([newShapeId]);
      setActiveTool('select');
      setEditingElementId(newShapeId);
      setCreationStart(null);
      setCreationCurrent(null);
    }

    if (interactionMode === 'dragging' || interactionMode === 'resizing') {
      setElements((prev) => [...prev]);
    }

    setInteractionMode('idle');
    setMarqueeBounds(null);
    setActiveResizeHandle(null);
    setInitialSelectedBounds(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const screenPt: Point = { x: e.clientX, y: e.clientY };

    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      zoomAtPoint(zoomFactor, screenPt, containerRect);
    } else {
      e.preventDefault();
      setPan(-e.deltaX, -e.deltaY);
    }
  };

  const handleResizeStart = (handle: ResizeHandle, e: React.PointerEvent) => {
    e.stopPropagation();
    if (!containerRef.current || !selectionBounds) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const screenPt: Point = { x: e.clientX, y: e.clientY };
    const worldPt = screenToWorld(screenPt, viewport, containerRect);

    setInteractionMode('resizing');
    setActiveResizeHandle(handle);
    setDragStartPoint(worldPt);
    setInitialSelectedBounds(selectionBounds);
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handleUpdateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === id) {
          return { ...el, ...updates } as CanvasElement;
        }
        return el;
      })
    );
  }, [setElements]);

  const getCursor = () => {
    if (interactionMode === 'panning' || isSpacePanning || activeTool === 'pan') {
      return interactionMode === 'panning' ? 'grabbing' : 'grab';
    }
    if (activeTool === 'eraser') return 'crosshair';
    if (activeTool === 'draw') return 'crosshair';
    if (activeTool === 'arrow' || activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'text' || activeTool === 'sticky') {
      return 'crosshair';
    }
    if (interactionMode === 'dragging') return 'move';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      className="whiteboard-canvas-viewport"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f8fafc',
        cursor: getCursor(),
        touchAction: 'none',
        userSelect: 'none',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <GridBackground viewport={viewport} />

      <div
        className="canvas-world-layer"
        style={{
          position: 'absolute',
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          width: 0,
          height: 0,
        }}
      >
        {elements.map((element) => (
          <ElementRenderer
            key={element.id}
            element={element}
            isSelected={selectedIds.includes(element.id)}
            onUpdate={handleUpdateElement}
            isEditingDirectly={editingElementId === element.id}
            onStartEditing={() => setEditingElementId(element.id)}
            onFinishEditing={() => setEditingElementId(null)}
          />
        ))}

        {interactionMode === 'drawing' && currentDrawPoints.length > 0 && (
          <ElementRenderer
            element={{
              id: 'preview-draw',
              type: 'draw',
              x: currentDrawPoints[0].x,
              y: currentDrawPoints[0].y,
              width: 10,
              height: 10,
              points: currentDrawPoints,
              stroke: activeStrokeColor || '#1e293b',
              strokeWidth: activeStrokeWidth || 3,
              zIndex: 99999,
            }}
            isSelected={false}
            onUpdate={() => {}}
          />
        )}

        {interactionMode === 'creating_arrow' && creationStart && creationCurrent && (
          <ElementRenderer
            element={{
              id: 'preview-arrow',
              type: 'arrow',
              x: Math.min(creationStart.x, creationCurrent.x),
              y: Math.min(creationStart.y, creationCurrent.y),
              width: Math.abs(creationCurrent.x - creationStart.x) || 10,
              height: Math.abs(creationCurrent.y - creationStart.y) || 10,
              startX: creationStart.x,
              startY: creationStart.y,
              endX: creationCurrent.x,
              endY: creationCurrent.y,
              stroke: activeStrokeColor || '#3b82f6',
              strokeWidth: activeStrokeWidth || 3,
              strokeStyle: 'solid',
              arrowHead: 'end',
              zIndex: 99999,
            }}
            isSelected={false}
            onUpdate={() => {}}
          />
        )}

        {interactionMode === 'creating_shape' && creationStart && creationCurrent && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(creationStart.x, creationCurrent.x)}px`,
              top: `${Math.min(creationStart.y, creationCurrent.y)}px`,
              width: `${Math.abs(creationCurrent.x - creationStart.x)}px`,
              height: `${Math.abs(creationCurrent.y - creationStart.y)}px`,
              backgroundColor: activeFillColor || (activeTool === 'circle' ? 'rgba(239, 246, 255, 0.5)' : 'rgba(255, 255, 255, 0.5)'),
              border: `${activeStrokeWidth || 2}px dashed ${activeStrokeColor || '#3b82f6'}`,
              borderRadius: activeTool === 'circle' ? '50%' : '12px',
              zIndex: 99999,
              pointerEvents: 'none',
            }}
          />
        )}

        {selectionBounds && selectedIds.length > 0 && interactionMode !== 'drawing' && interactionMode !== 'creating_arrow' && (
          <SelectionBox
            bounds={selectionBounds}
            zoom={viewport.zoom}
            singleElement={singleSelectedElement}
            onResizeStart={handleResizeStart}
          />
        )}

        <MarqueeSelect bounds={marqueeBounds} />
      </div>
    </div>
  );
};
