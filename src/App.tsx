import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import type {
  ToolType,
  CanvasElement,
  StickyColor,
  BoardMetadata,
  User,
  BoardRecord,
  CollaboratorPresence,
  Point,
} from './types/whiteboard';
import { getCurrentUser } from './services/authService';
import {
  getAllBoards,
  getBoardById,
  getActiveBoardId,
  saveBoardRecord,
  setActiveBoardId,
} from './services/boardService';
import { realtimeService } from './services/realtimeService';
import { CollabSimulation } from './utils/collabSimulation';
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
import { BoardsDashboardModal } from './components/UI/BoardsDashboardModal';
import { AuthModal } from './components/UI/AuthModal';

export const App: React.FC = () => {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<User>(() => getCurrentUser());

  // 2. Active Board State
  const initialActiveBoard = useRef<BoardRecord>(
    (() => {
      const activeId = getActiveBoardId();
      const found = getBoardById(activeId);
      if (found) return found;
      const all = getAllBoards();
      return all[0];
    })()
  ).current;

  const [metadata, setMetadata] = useState<BoardMetadata>(initialActiveBoard.metadata);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // 3. History & Elements Engine
  const {
    elements,
    setElements,
    setElementsTransient,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(initialActiveBoard.elements);

  // 4. Canvas Viewport Engine
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
  } = useCanvasTransform(initialActiveBoard.viewport);

  // 5. Tools & Interaction State
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSpacePanning, setIsSpacePanning] = useState(false);

  // 6. Active Tool Options
  const [activeStickyColor, setActiveStickyColor] = useState<StickyColor>('yellow');
  const [activeStrokeColor] = useState<string>('#3b82f6');
  const [activeFillColor] = useState<string>('#ffffff');
  const [activeStrokeWidth] = useState<number>(2);

  // 7. Real-Time Collaboration & Presence State
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef<CollabSimulation | null>(null);

  // 8. UI Modals
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);

  // Auto-save debounced effect to local board database
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveBoardRecord({ metadata, elements, viewport });
      setSaveStatus('saved');
      // Broadcast element updates to open collaborator tabs
      realtimeService.broadcastElements(metadata.id, elements);
    }, 400);

    return () => clearTimeout(timer);
  }, [metadata, elements, viewport]);

  // Real-Time Cross-Tab Collaboration Listener
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((msg) => {
      if (msg.type === 'PRESENCE_UPDATE') {
        if (msg.payload.id === realtimeService.clientId) return; // ignore self
        if (msg.payload.boardId !== metadata.id) return; // different board

        setCollaborators((prev) => {
          const filtered = prev.filter((c) => c.id !== msg.payload.id);
          return [...filtered, msg.payload];
        });
      } else if (msg.type === 'ELEMENTS_SYNC') {
        if (msg.payload.senderId === realtimeService.clientId) return;
        if (msg.payload.boardId !== metadata.id) return;

        // Sync remote elements
        setElementsTransient(() => msg.payload.elements);
      } else if (msg.type === 'USER_LEFT') {
        setCollaborators((prev) => prev.filter((c) => c.id !== msg.payload.id));
      }
    });

    // Periodically prune stale collaborators (inactive > 10s)
    const pruneTimer = setInterval(() => {
      setCollaborators((prev) =>
        prev.filter((c) => c.isSimulated || Date.now() - c.lastActive < 10000)
      );
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(pruneTimer);
      realtimeService.broadcastLeave(metadata.id);
    };
  }, [metadata.id, setElementsTransient]);

  // Local Cursor broadcast handler
  const handleLocalCursorMove = useCallback(
    (worldPt: Point) => {
      const presence = realtimeService.createPresenceObject(
        currentUser,
        metadata.id,
        worldPt.x,
        worldPt.y
      );
      realtimeService.broadcastPresence(presence);
    },
    [currentUser, metadata.id]
  );

  // Toggle Live Collaborator Simulation
  const handleToggleSimulation = useCallback(() => {
    if (isSimulating) {
      simulationRef.current?.stop();
      simulationRef.current = null;
      setCollaborators((prev) => prev.filter((c) => !c.isSimulated));
      setIsSimulating(false);
    } else {
      const sim = new CollabSimulation(
        metadata.id,
        (presence) => {
          setCollaborators((prev) => {
            const others = prev.filter((c) => c.id !== presence.id);
            return [...others, presence];
          });
        },
        (newElement) => {
          setElements((prev) => [...prev, newElement]);
        }
      );
      sim.start();
      simulationRef.current = sim;
      setIsSimulating(true);
    }
  }, [isSimulating, metadata.id, setElements]);

  // Clean up simulation on unmount
  useEffect(() => {
    return () => {
      simulationRef.current?.stop();
    };
  }, []);

  // Board Switcher Handler
  const handleSwitchBoard = useCallback(
    (targetBoard: BoardRecord) => {
      setMetadata(targetBoard.metadata);
      setElements(targetBoard.elements);
      resetHistory(targetBoard.elements);
      if (targetBoard.viewport) {
        setViewport(targetBoard.viewport);
      }
      setActiveBoardId(targetBoard.metadata.id);
      setSelectedIds([]);
      setCollaborators([]);

      // Reset simulation if active
      if (isSimulating) {
        simulationRef.current?.stop();
        simulationRef.current = null;
        setIsSimulating(false);
      }
    },
    [setElements, resetHistory, setViewport, isSimulating]
  );

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
      {/* Top Navigation Bar with Multi-board & Collab Presences */}
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
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        collaborators={collaborators}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        saveStatus={saveStatus}
      />

      {/* Left Tool Dock */}
      <LeftToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeStickyColor={activeStickyColor}
        setActiveStickyColor={setActiveStickyColor}
      />

      {/* Contextual Properties Floating Dock */}
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

      {/* Main Interactive Whiteboard Canvas with Live Cursors */}
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
        collaborators={collaborators}
        onLocalCursorMove={handleLocalCursorMove}
      />

      {/* Bottom Right Zoom & Navigation Dock */}
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

      {/* Interactive Minimap */}
      {showMinimap && (
        <Minimap
          elements={elements}
          viewport={viewport}
          onNavigateTo={handleMinimapNavigate}
          onClose={() => setShowMinimap(false)}
        />
      )}

      {/* Workspace Boards Dashboard Modal */}
      <BoardsDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        activeBoardId={metadata.id}
        onSwitchBoard={handleSwitchBoard}
      />

      {/* User Accounts & Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => setCurrentUser(user)}
      />

      {/* Starter Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

export default App;
