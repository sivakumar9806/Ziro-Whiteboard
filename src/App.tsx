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
  ChatMessage,
  ReactionEvent,
  RoomInfo,
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
import { ShareInviteModal } from './components/UI/ShareInviteModal';
import { LiveDiscussionPanel } from './components/UI/LiveDiscussionPanel';
import { DataCollectionModal } from './components/UI/DataCollectionModal';
import { GuestAccessBanner } from './components/UI/GuestAccessBanner';
import { AIStudioModal } from './components/UI/AIStudioModal';
import { MermaidModal } from './components/UI/MermaidModal';
import { VotingSessionModal } from './components/UI/VotingSessionModal';
import { checkSessionApi } from './services/authService';

export const App: React.FC = () => {
  // 1. Authentication State
  const [currentUser, setCurrentUser] = useState<User>(() => getCurrentUser());
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isGuest = currentUser.id === 'user-guest';

  // Auto-restore session from backend if token exists
  useEffect(() => {
    checkSessionApi().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  // 2. Active Board State
  const initialActiveBoard = useRef<BoardRecord>(
    (() => {
      const activeId = getActiveBoardId();
      const found = getBoardById(activeId);
      const board = found || getAllBoards()[0];
      if (board && board.metadata && board.metadata.title) {
        board.metadata.title = board.metadata.title
          .replace(/My Miro Whiteboard/g, 'My Ziro Whiteboard')
          .replace(/Miro Whiteboard/g, 'Ziro Whiteboard');
      }
      return board;
    })()
  ).current;

  const [metadata, setMetadata] = useState<BoardMetadata>(() => ({
    ...initialActiveBoard.metadata,
    title: initialActiveBoard.metadata.title
      .replace(/My Miro Whiteboard/g, 'My Ziro Whiteboard')
      .replace(/Miro Whiteboard/g, 'Ziro Whiteboard'),
  }));
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
  const [activeStickyColor, setActiveStickyColor] = useState<StickyColor>('blue');
  const [activeStrokeColor] = useState<string>('#3b82f6');
  const [activeFillColor] = useState<string>('#ffffff');
  const [activeStrokeWidth] = useState<number>(2);

  // 7. Real-Time Collaboration & Room State
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationRef = useRef<CollabSimulation | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    roomId: 'main',
    connected: false,
    peerCount: 1,
  });

  // 8. Live Discussion, Chat & Voice State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [isDiscussionExpanded, setIsDiscussionExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [floatingReactions, setFloatingReactions] = useState<ReactionEvent[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(true);

  // 9. Other UI Modals & Superpowers
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showMinimap, setShowMinimap] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isMermaidOpen, setIsMermaidOpen] = useState(false);
  const [isVotingOpen, setIsVotingOpen] = useState(false);

  // Batch insert elements (e.g. from AI Studio or Mermaid Runner)
  const handleInsertBatchElements = useCallback((newElements: CanvasElement[]) => {
    setElements((prev) => [...prev, ...newElements]);
    setSelectedIds(newElements.map((el) => el.id));

    // Smoothly focus viewport onto the generated elements
    const rect = document.querySelector('.whiteboard-canvas-viewport')?.getBoundingClientRect();
    if (rect && newElements.length > 0) {
      setTimeout(() => {
        fitToElements(newElements, rect);
      }, 50);
    }
  }, [setElements, setSelectedIds, fitToElements]);

  // Insert interactive Voice Memo Audio Pin
  const handleAddVoiceMemo = useCallback(() => {
    if (isGuest) {
      setIsAuthOpen(true);
      return;
    }
    const cx = -viewport.x / viewport.zoom + window.innerWidth / (2 * viewport.zoom);
    const cy = -viewport.y / viewport.zoom + window.innerHeight / (2 * viewport.zoom);
    const newMemoId = `audio-memo-${Date.now()}`;
    const newMemo: CanvasElement = {
      id: newMemoId,
      type: 'audio_memo',
      x: cx - 120,
      y: cy - 70,
      width: 240,
      height: 140,
      title: '🎙️ Team Voice Memo',
      audioDuration: 14,
      authorName: currentUser.name || 'You',
      zIndex: elements.length + 10,
    };
    setElements((prev) => [...prev, newMemo]);
    setSelectedIds([newMemoId]);

    // Automatically center and zoom viewport on the new voice memo note
    const rect = document.querySelector('.whiteboard-canvas-viewport')?.getBoundingClientRect();
    if (rect) {
      setTimeout(() => {
        fitToElements([newMemo], rect);
      }, 50);
    }
  }, [isGuest, viewport, currentUser.name, elements.length, setElements, setSelectedIds, fitToElements]);

  // Determine active Room ID from URL or default board
  const getActiveRoomId = useCallback(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const roomParam = searchParams.get('room');
      if (roomParam) return roomParam;
      const hash = window.location.hash;
      if (hash.startsWith('#/room/')) {
        return hash.replace('#/room/', '');
      }
    }
    return metadata.id.replace(/[^a-zA-Z0-9_-]/g, '-');
  }, [metadata.id]);

  // Keep live peer service updated with latest board state provider
  useEffect(() => {
    realtimeService.setBoardStateProvider(() => ({
      elements,
      metadata,
    }));
  }, [elements, metadata]);

  // Connect to Live WebRTC Mesh Room on mount or when room changes
  useEffect(() => {
    const roomId = getActiveRoomId();
    realtimeService.joinRoom(roomId, currentUser);

    const unsubscribeStatus = realtimeService.subscribeRoomStatus((info) => {
      setRoomInfo(info);
    });

    return () => {
      unsubscribeStatus();
    };
  }, [getActiveRoomId, currentUser]);

  // Auto-save debounced effect to local board database & broadcast changes
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveBoardRecord({ metadata, elements, viewport });
      setSaveStatus('saved');
      // Broadcast element updates to all connected room peers & local tabs
      realtimeService.broadcastElements(metadata.id, elements);
    }, 300);

    return () => clearTimeout(timer);
  }, [metadata, elements, viewport]);

  // Real-Time Cross-Network & Cross-Tab Collaboration Listener
  useEffect(() => {
    const unsubscribe = realtimeService.subscribe((msg) => {
      if (msg.type === 'PRESENCE_UPDATE') {
        if (msg.payload.id === realtimeService.clientId) return; // ignore self

        setCollaborators((prev) => {
          const filtered = prev.filter((c) => c.id !== msg.payload.id);
          return [...filtered, msg.payload];
        });
      } else if (msg.type === 'ELEMENTS_SYNC') {
        if (msg.payload.senderId === realtimeService.clientId) return;

        // Sync remote elements from collaborator
        setElementsTransient(() => msg.payload.elements);
      } else if (msg.type === 'SYNC_BOARD_STATE') {
        if (msg.payload.senderId === realtimeService.clientId) return;
        if (msg.payload.elements && msg.payload.elements.length > 0) {
          setElementsTransient(() => msg.payload.elements);
          if (msg.payload.metadata?.title) {
            setMetadata((prev) => ({ ...prev, title: msg.payload.metadata!.title }));
          }
        }
      } else if (msg.type === 'CHAT_MESSAGE') {
        setChatMessages((prev) => [...prev, msg.payload]);
        if (!isDiscussionOpen) {
          setUnreadCount((c) => c + 1);
        }
      } else if (msg.type === 'REACTION_TRIGGER') {
        setFloatingReactions((prev) => [...prev, msg.payload]);
        try {
          confetti({
            particleCount: 25,
            spread: 60,
            origin: { y: 0.7, x: 0.5 },
          });
        } catch {
          // Safe fallback
        }
        setTimeout(() => {
          setFloatingReactions((prev) => prev.filter((r) => r.id !== msg.payload.id));
        }, 3000);
      } else if (msg.type === 'USER_LEFT') {
        setCollaborators((prev) => prev.filter((c) => c.id !== msg.payload.id));
      }
    });

    // Periodically prune stale collaborators (inactive > 12s)
    const pruneTimer = setInterval(() => {
      setCollaborators((prev) =>
        prev.filter((c) => c.isSimulated || Date.now() - c.lastActive < 12000)
      );
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(pruneTimer);
      realtimeService.broadcastLeave(metadata.id);
    };
  }, [metadata.id, setElementsTransient, isDiscussionOpen]);

  // Local Cursor broadcast handler
  const handleLocalCursorMove = useCallback(
    (worldPt: Point) => {
      const presence = realtimeService.createPresenceObject(
        currentUser,
        metadata.id,
        worldPt.x,
        worldPt.y,
        selectedIds[0]
      );
      realtimeService.broadcastPresence(presence);
    },
    [currentUser, metadata.id, selectedIds]
  );

  // Switch Room Action
  const handleJoinRoom = useCallback(
    (newRoomId: string) => {
      const clean = newRoomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('room', clean);
        window.history.pushState({}, '', url.toString());
      }
      realtimeService.joinRoom(clean, currentUser);
    },
    [currentUser]
  );

  // Send Discussion Message
  const handleSendMessage = useCallback(
    (text: string) => {
      const newMsg = realtimeService.broadcastChatMessage(text, currentUser);
      setChatMessages((prev) => [...prev, newMsg]);
    },
    [currentUser]
  );

  // Send Reaction
  const handleSendReaction = useCallback(
    (emoji: string) => {
      const reaction = realtimeService.broadcastReaction(emoji, currentUser);
      setFloatingReactions((prev) => [...prev, reaction]);
      try {
        confetti({
          particleCount: 30,
          spread: 70,
          origin: { y: 0.6, x: 0.5 },
        });
      } catch {
        // Safe fallback
      }
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 3000);
    },
    [currentUser]
  );

  // Voice Chat Controls
  const handleStartVoice = useCallback(async () => {
    const success = await realtimeService.startVoiceChat();
    if (success) {
      setIsVoiceActive(true);
      setIsMicMuted(false);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const isMuted = realtimeService.toggleMute();
    setIsMicMuted(isMuted);
  }, []);

  const handleStopVoice = useCallback(() => {
    realtimeService.stopVoiceChat();
    setIsVoiceActive(false);
    setIsMicMuted(true);
  }, []);

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

      handleJoinRoom(targetBoard.metadata.id);
    },
    [setElements, resetHistory, setViewport, isSimulating, handleJoinRoom]
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
        onExportPng={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          exportToPng({ metadata, elements, viewport });
        }}
        onExportJson={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          exportToJson({ metadata, elements, viewport });
        }}
        onImportJson={handleImportJson}
        onClearBoard={handleClearBoard}
        onOpenTemplates={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsTemplatesOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenDashboard={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsDashboardOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        currentUser={currentUser}
        collaborators={collaborators}
        isSimulating={isSimulating}
        onToggleSimulation={handleToggleSimulation}
        saveStatus={saveStatus}
        onOpenShareModal={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsShareModalOpen(true);
        }}
        onToggleDiscussion={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsDiscussionOpen((prev) => !prev);
          setUnreadCount(0);
        }}
        isDiscussionOpen={isDiscussionOpen}
        unreadMessagesCount={unreadCount}
        roomInfo={roomInfo}
      />

      {/* Guest Preview Notification Banner */}
      {isGuest && <GuestAccessBanner onOpenAuth={() => setIsAuthOpen(true)} />}

      {/* Left Miro Tool Dock */}
      <LeftToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeStickyColor={activeStickyColor}
        setActiveStickyColor={setActiveStickyColor}
        onOpenTemplates={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsTemplatesOpen(true);
        }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAIStudio={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsAIStudioOpen(true);
        }}
        onOpenMermaid={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsMermaidOpen(true);
        }}
        onOpenVoting={() => {
          if (isGuest) {
            setIsAuthOpen(true);
            return;
          }
          setIsVotingOpen(true);
        }}
        onAddVoiceMemo={handleAddVoiceMemo}
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

      {/* Floating Canvas Reactions Stream */}
      {floatingReactions.length > 0 && (
        <div className="ziro-floating-reactions-overlay">
          {floatingReactions.map((reaction) => (
            <div key={reaction.id} className="ziro-floating-emoji-item">
              <span className="ziro-floating-emoji-icon">{reaction.emoji}</span>
              <span className="ziro-floating-emoji-user">{reaction.senderName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Live Discussion, Chat & Voice Panel */}
      <LiveDiscussionPanel
        isOpen={isDiscussionOpen}
        onClose={() => setIsDiscussionOpen(false)}
        currentUser={currentUser}
        collaborators={collaborators}
        roomInfo={roomInfo}
        chatMessages={chatMessages}
        onSendMessage={handleSendMessage}
        onSendReaction={handleSendReaction}
        isVoiceActive={isVoiceActive}
        isMicMuted={isMicMuted}
        onStartVoice={handleStartVoice}
        onToggleMute={handleToggleMute}
        onStopVoice={handleStopVoice}
        onToggleExpand={() => setIsDiscussionExpanded((prev) => !prev)}
        isExpanded={isDiscussionExpanded}
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

      {/* 🤖 AI Whiteboard Studio Superpower Modal */}
      <AIStudioModal
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
        viewport={viewport}
        onInsertElements={handleInsertBatchElements}
      />

      {/* 📊 Mermaid & Markdown Diagram Compiler Modal */}
      <MermaidModal
        isOpen={isMermaidOpen}
        onClose={() => setIsMermaidOpen(false)}
        viewport={viewport}
        onInsertElements={handleInsertBatchElements}
      />

      {/* 🗳️ Interactive Team Dot-Voting & Priority Matrix Modal */}
      <VotingSessionModal
        isOpen={isVotingOpen}
        onClose={() => setIsVotingOpen(false)}
        elements={elements}
      />

      {/* Share & Multi-User Invite Modal */}
      <ShareInviteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        boardTitle={metadata.title}
        currentUser={currentUser}
        collaborators={collaborators}
        roomInfo={roomInfo}
        onJoinRoom={handleJoinRoom}
      />

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

      {/* Forms & Data Collection Modal */}
      <DataCollectionModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default App;
