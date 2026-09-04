import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type {
  ToolType,
  CanvasElement,
  StickyColor,
  BoardMetadata,
} from './types/whiteboard';
import { loadBoardFromStorage, saveBoardToStorage } from './utils/storage';
import { exportToPng, exportToJson, importFromJsonFile } from './utils/export';
import type { BoardTemplate } from './utils/templates';
import { useHistory } from './hooks/useHistory';
import { useCanvasTransform } from './hooks/useCanvasTransform';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import { WhiteboardCanvas } from './components/Canvas/WhiteboardCanvas';
import { TopNav } from './components/UI/TopNav';
import { LeftToolbar } from './components/UI/LeftToolbar';
import { ContextPropertyBar } from './components/UI/ContextPropertyBar';
import { ZoomControls } from './components/UI/ZoomControls';
import { Minimap } from './components/UI/Minimap';
import { TemplatesModal } from './components/UI/TemplatesModal';
import { ShortcutsModal } from './components/UI/ShortcutsModal';

export const App: React.FC = () => {
  // 1. Initial State from LocalStorage
  const initialData = useRef(loadBoardFromStorage()).current;

  const [metadata, setMetadata] = useState<BoardMetadata>(initialData.metadata);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // 2. History & Elements Engine
  const {
    elements,
    setElements,
    setElementsTransient,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(initialData.elements);

  // 3. Canvas Viewport Engine
  const {
    viewport,
    setViewport,
    setPan,
    setPosition,
    zoomAtPoint,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToElements,
  } = useCanvasTransform(initialData.viewport);

  // 4. Tools & Interaction State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSpacePanning, setIsSpacePanning] = useState(false);

  // 5. Active Tool Options
  const [activeStickyColor, setActiveStickyColor] = useState<StickyColor>('yellow');
  const [activeStrokeColor] = useState<string>('#3b82f6');
  const [activeFillColor] = useState<string>('#ffffff');
  const [activeStrokeWidth] = useState<number>(2);

  // 6. UI Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  // Auto-save debounced effect
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveBoardToStorage({ metadata, elements, viewport });
      setSaveStatus('saved');
    }, 400);

    return () => clearTimeout(timer);
  }, [metadata, elements, viewport]);

  // Actions
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setElements((prev) => prev.filter((el) => !selectedIds.includes(el.id)));
    setSelectedIds([]);
  }, [selectedIds, setElements]);

  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const newElements: CanvasElement[] = selected.map((el) => {
      const newId = `${el.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (el.type === 'arrow') {
        return {
          ...el,
          id: newId,
          startX: el.startX + 24,
          startY: el.startY + 24,
          endX: el.endX + 24,
          endY: el.endY + 24,
          zIndex: elements.length + 1,
        };
      }
      if (el.type === 'draw') {
        return {
          ...el,
          id: newId,
          points: el.points.map((pt) => ({ x: pt.x + 24, y: pt.y + 24 })),
          zIndex: elements.length + 1,
        };
      }
      return {
        ...el,
        id: newId,
        x: el.x + 24,
        y: el.y + 24,
        zIndex: elements.length + 1,
      };
    });

    setElements((prev) => [...prev, ...newElements]);
    setSelectedIds(newElements.map((el) => el.id));
  }, [selectedIds, elements, setElements]);

  const selectAll = useCallback(() => {
    setSelectedIds(elements.map((el) => el.id));
  }, [elements]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleUpdateElements = useCallback((updates: Partial<CanvasElement>) => {
    setElements((prev) =>
      prev.map((el) => {
        if (selectedIds.includes(el.id)) {
          return { ...el, ...updates } as CanvasElement;
        }
        return el;
      })
    );
  }, [selectedIds, setElements]);

  const handleBringForward = useCallback(() => {
    if (selectedIds.length === 0) return;
    setElements((prev) => {
      const maxZ = Math.max(...prev.map((e) => e.zIndex), 0);
      return prev.map((el) =>
        selectedIds.includes(el.id) ? { ...el, zIndex: maxZ + 1 } : el
      );
    });
  }, [selectedIds, setElements]);

  const handleSendBackward = useCallback(() => {
    if (selectedIds.length === 0) return;
    setElements((prev) => {
      const minZ = Math.min(...prev.map((e) => e.zIndex), 1);
      return prev.map((el) =>
        selectedIds.includes(el.id) ? { ...el, zIndex: Math.max(0, minZ - 1) } : el
      );
    });
  }, [selectedIds, setElements]);

  const handleClearBoard = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all elements from this board?')) {
      setElements([]);
      setSelectedIds([]);
    }
  }, [setElements]);

  const handleSelectTemplate = useCallback((template: BoardTemplate | null) => {
    if (!template) {
      setElements([]);
      setSelectedIds([]);
      resetZoom();
      return;
    }

    setElements(template.elements);
    resetHistory(template.elements);
    setSelectedIds([]);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 },
      });
    } catch {
      // Safe fallback
    }

    const rect = document.querySelector('.whiteboard-canvas-viewport')?.getBoundingClientRect();
    if (rect) {
      setTimeout(() => fitToElements(template.elements, rect), 50);
    }
  }, [setElements, resetHistory, resetZoom, fitToElements]);

  const handleImportJson = useCallback(async (file: File) => {
    try {
      const board = await importFromJsonFile(file);
      setMetadata(board.metadata);
      setElements(board.elements);
      resetHistory(board.elements);
      if (board.viewport) {
        setViewport(board.viewport);
      }
      setSelectedIds([]);
      alert(`Board "${board.metadata.title}" loaded successfully!`);
    } catch (err) {
      alert(`Failed to import board: ${err instanceof Error ? err.message : 'Invalid JSON file'}`);
    }
  }, [setElements, resetHistory, setViewport]);

  const handleMinimapNavigate = useCallback((worldX: number, worldY: number) => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const newX = screenW / 2 - worldX * viewport.zoom;
    const newY = screenH / 2 - worldY * viewport.zoom;
    setPosition(newX, newY);
  }, [viewport.zoom, setPosition]);

  useKeyboardShortcuts({
    activeTool,
    setActiveTool,
    selectedIds,
    deleteSelected,
    duplicateSelected,
    selectAll,
    clearSelection,
    undo,
    redo,
    zoomIn: () => zoomIn(),
    zoomOut: () => zoomOut(),
    resetZoom,
    setIsSpacePanning,
    openShortcutsModal: () => setIsShortcutsOpen(true),
  });

  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));

  return (
    <div className="app-container" style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <TopNav
        metadata={metadata}
        onUpdateTitle={(title) => setMetadata((prev) => ({ ...prev, title }))}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onExportPng={() => exportToPng({ metadata, elements, viewport })}
        onExportJson={() => exportToJson({ metadata, elements, viewport })}
        onImportJson={handleImportJson}
        onClearBoard={handleClearBoard}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        saveStatus={saveStatus}
      />

      <LeftToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeStickyColor={activeStickyColor}
        setActiveStickyColor={setActiveStickyColor}
      />

      {selectedElements.length > 0 && (
        <ContextPropertyBar
          selectedElements={selectedElements}
          onUpdateElements={handleUpdateElements}
          onDeleteSelected={deleteSelected}
          onDuplicateSelected={duplicateSelected}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
        />
      )}

      <WhiteboardCanvas
        elements={elements}
        setElements={setElements}
        setElementsTransient={setElementsTransient}
        viewport={viewport}
        setViewport={setViewport}
        setPan={setPan}
        zoomAtPoint={zoomAtPoint}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        isSpacePanning={isSpacePanning}
        activeStickyColor={activeStickyColor}
        activeStrokeColor={activeStrokeColor}
        activeFillColor={activeFillColor}
        activeStrokeWidth={activeStrokeWidth}
      />

      <ZoomControls
        zoom={viewport.zoom}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onResetZoom={resetZoom}
        onFitToContent={() => {
          const rect = document.querySelector('.whiteboard-canvas-viewport')?.getBoundingClientRect();
          if (rect) fitToElements(elements, rect);
        }}
        showMinimap={showMinimap}
        onToggleMinimap={() => setShowMinimap((prev) => !prev)}
        onSetZoomExact={(z) => setViewport((prev) => ({ ...prev, zoom: z }))}
      />

      {showMinimap && (
        <Minimap
          elements={elements}
          viewport={viewport}
          onNavigateTo={handleMinimapNavigate}
          onClose={() => setShowMinimap(false)}
        />
      )}

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
