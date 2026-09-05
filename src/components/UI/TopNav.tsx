import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Image as ImageIcon,
  FileJson,
  Trash2,
  HelpCircle,
  Check,
  ChevronDown,
  Star,
  Share2,
  Play,
  Users,
  Smile,
  Timer,
  Menu,
  MessageSquare,
  Radio,
} from 'lucide-react';
import type { BoardMetadata, User, CollaboratorPresence, RoomInfo } from '../../types/whiteboard';

interface TopNavProps {
  metadata: BoardMetadata;
  onUpdateTitle: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportPng: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onClearBoard: () => void;
  onOpenTemplates: () => void;
  onOpenShortcuts: () => void;
  onOpenDashboard: () => void;
  onOpenAuth: () => void;
  currentUser: User;
  collaborators: CollaboratorPresence[];
  isSimulating: boolean;
  onToggleSimulation: () => void;
  saveStatus: 'saved' | 'saving';
  onToggleStar?: () => void;
  onOpenShareModal: () => void;
  onToggleDiscussion: () => void;
  isDiscussionOpen: boolean;
  unreadMessagesCount: number;
  roomInfo: RoomInfo;
}

export const TopNav: React.FC<TopNavProps> = ({
  metadata,
  onUpdateTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportPng,
  onExportJson,
  onImportJson,
  onClearBoard,
  onOpenShortcuts,
  onOpenDashboard,
  onOpenAuth,
  currentUser,
  collaborators,
  isSimulating,
  onToggleSimulation,
  saveStatus,
  onOpenShareModal,
  onToggleDiscussion,
  isDiscussionOpen,
  unreadMessagesCount,
  roomInfo,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(metadata.title);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [isStarred, setIsStarred] = useState(metadata.isStarred || false);
  const [showReactions, setShowReactions] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            confetti({ particleCount: 60, spread: 90, origin: { y: 0.3 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim()) {
      onUpdateTitle(titleDraft.trim());
    } else {
      setTitleDraft(metadata.title);
    }
  };

  return (
    <header className="ziro-top-bar" aria-label="Ziro Navigation Bar">
      {/* Left Section: Logo, Main Menu, Breadcrumbs, Title, Star & Save status */}
      <div className="ziro-top-left">
        {/* Main Menu Hamburger */}
        <div className="relative">
          <button
            className="ziro-menu-btn"
            onClick={() => setShowMainMenu((prev) => !prev)}
            title="Main Menu"
          >
            <Menu size={18} strokeWidth={2.2} />
          </button>

          {showMainMenu && (
            <>
              <div className="flyout-backdrop" onClick={() => setShowMainMenu(false)} />
              <div className="ziro-main-menu-popover">
                <div className="ziro-menu-header">
                  <div className="ziro-brand-icon" style={{ backgroundColor: '#4262ff', color: '#ffffff' }}>
                    <span>Z</span>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Ziro Whiteboard</div>
                    <div className="text-xs text-slate-500">Collaborative Workspace</div>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowMainMenu(false);
                    onOpenDashboard();
                  }}
                >
                  <span>My Boards</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowMainMenu(false);
                    onExportPng();
                  }}
                >
                  <ImageIcon size={15} className="text-blue-500" />
                  <span>Export as PNG</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowMainMenu(false);
                    onExportJson();
                  }}
                >
                  <FileJson size={15} className="text-emerald-500" />
                  <span>Export as JSON</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowMainMenu(false);
                    onOpenShortcuts();
                  }}
                >
                  <HelpCircle size={15} className="text-slate-500" />
                  <span>Keyboard Shortcuts</span>
                </button>

                <button
                  className="dropdown-item text-red-600"
                  onClick={() => {
                    setShowMainMenu(false);
                    onClearBoard();
                  }}
                >
                  <Trash2 size={15} className="text-red-500" />
                  <span>Clear Entire Canvas</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Ziro Brand Logo */}
        <button className="ziro-logo-button" onClick={onOpenDashboard} title="Go to Ziro Dashboard">
          <div className="ziro-logo-badge" style={{ backgroundColor: '#4262ff' }}>
            <span className="ziro-logo-letter" style={{ color: '#ffffff' }}>Z</span>
          </div>
          <span className="ziro-logo-text">ziro</span>
        </button>

        <div className="ziro-v-sep" />

        {/* Board Title & Star */}
        <div className="ziro-title-container">
          {isEditingTitle ? (
            <input
              type="text"
              className="ziro-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                  setTitleDraft(metadata.title);
                }
              }}
              autoFocus
            />
          ) : (
            <div className="ziro-title-display" onClick={() => setIsEditingTitle(true)}>
              <span className="ziro-title-text">{metadata.title}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          )}

          {/* Star Favorite Button */}
          <button
            className={`ziro-star-btn ${isStarred ? 'starred' : ''}`}
            onClick={() => setIsStarred((prev) => !prev)}
            title={isStarred ? 'Starred' : 'Star board'}
          >
            <Star size={15} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : '#94a3b8'} />
          </button>

          {/* Cloud Auto-save Status */}
          <div className="ziro-save-pill" title="Changes saved automatically">
            {saveStatus === 'saved' ? (
              <>
                <Check size={12} className="text-emerald-500" strokeWidth={2.5} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <span className="ziro-saving-dot" />
                <span>Saving...</span>
              </>
            )}
          </div>

          {/* Live WebRTC Room Badge */}
          <button
            className="ziro-room-status-badge"
            onClick={onOpenShareModal}
            title="Click to view live room & invite link"
          >
            <Radio size={12} className="text-emerald-500 animate-pulse" />
            <span className="ziro-room-name-text">Room: {roomInfo.roomId || 'main'}</span>
            <span className="ziro-room-count-pill">{collaborators.length + 1}</span>
          </button>
        </div>
      </div>

      {/* Right Section: Undo/Redo, Collab Avatars, Simulation Toggle, Present & Share */}
      <div className="ziro-top-right">
        {/* Undo / Redo */}
        <div className="ziro-history-buttons">
          <button
            className={`ziro-top-icon-btn ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} strokeWidth={2.2} />
          </button>
          <button
            className={`ziro-top-icon-btn ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="ziro-v-sep" />

        {/* Real-time Collaboration Mode Toggle */}
        <button
          className={`ziro-collab-toggle-btn ${isSimulating ? 'active' : ''}`}
          onClick={onToggleSimulation}
          title="Simulate live multi-user collaboration"
        >
          <Users size={14} strokeWidth={2} />
          <span>{isSimulating ? 'Live Collab (Active)' : 'Collab Simulation'}</span>
          {isSimulating && <span className="ziro-pulse-dot" />}
        </button>

        {/* Active Collaborators Avatar Stack */}
        <div className="ziro-avatar-stack">
          {/* User Profile */}
          <div
            className="ziro-avatar-circle current-user"
            style={{ backgroundColor: currentUser.avatarColor }}
            onClick={onOpenAuth}
            title={`${currentUser.name} (You) - Click to manage account`}
          >
            {currentUser.name.charAt(0)}
          </div>

          {/* Remote Collaborators */}
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="ziro-avatar-circle"
              style={{ backgroundColor: c.user.avatarColor }}
              title={`${c.user.name} (Online)`}
            >
              {c.user.name.charAt(0)}
            </div>
          ))}
        </div>

        {/* Reaction quick popup */}
        <div className="relative">
          <button
            className="ziro-top-icon-btn"
            onClick={() => setShowReactions((prev) => !prev)}
            title="Reactions"
          >
            <Smile size={16} strokeWidth={2} />
          </button>

          {showReactions && (
            <>
              <div className="flyout-backdrop" onClick={() => setShowReactions(false)} />
              <div className="ziro-reactions-popover">
                {['👍', '❤️', '🔥', '🎉', '💡', '🚀', '👏', '💯'].map((emoji) => (
                  <button
                    key={emoji}
                    className="ziro-emoji-btn"
                    onClick={() => {
                      setShowReactions(false);
                      confetti({
                        particleCount: 30,
                        spread: 70,
                        origin: { y: 0.2, x: 0.75 },
                      });
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Timer Widget */}
        <div className="relative">
          <button
            className={`ziro-top-icon-btn ${showTimer ? 'active' : ''} ${isTimerRunning ? 'text-blue-600 bg-blue-50' : ''}`}
            onClick={() => setShowTimer((prev) => !prev)}
            title="Meeting Timer & Stopwatch"
          >
            <Timer size={16} strokeWidth={2} />
            {isTimerRunning && (
              <span style={{ fontSize: '11px', fontWeight: 700, marginLeft: '4px', color: '#4262ff' }}>
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
              </span>
            )}
          </button>

          {showTimer && (
            <>
              <div className="flyout-backdrop" onClick={() => setShowTimer(false)} />
              <div className="ziro-timer-card">
                <div className="ziro-timer-title">MEETING TIMER</div>
                <div className="ziro-timer-display">
                  {Math.floor(timerSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="ziro-timer-presets">
                  <button type="button" onClick={() => setTimerSeconds((prev) => prev + 60)}>+1m</button>
                  <button type="button" onClick={() => setTimerSeconds((prev) => prev + 300)}>+5m</button>
                  <button type="button" onClick={() => setTimerSeconds((prev) => prev + 600)}>+10m</button>
                </div>
                <div className="ziro-timer-actions">
                  <button
                    type="button"
                    className="ziro-timer-start-btn"
                    onClick={() => {
                      if (timerSeconds === 0) setTimerSeconds(300);
                      setIsTimerRunning((r) => !r);
                    }}
                  >
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    type="button"
                    className="ziro-timer-reset-btn"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(300);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Live Discussion & Meeting Chat Button */}
        <button
          className={`ziro-discussion-toggle-btn ${isDiscussionOpen ? 'active' : ''}`}
          onClick={onToggleDiscussion}
          title="Open Live Discussion, Chat & Voice"
        >
          <MessageSquare size={15} strokeWidth={2.2} />
          <span>Discussion</span>
          {unreadMessagesCount > 0 && (
            <span className="ziro-unread-count-badge">{unreadMessagesCount}</span>
          )}
        </button>

        {/* Presentation Mode Button */}
        <button
          className="ziro-present-btn"
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          title="Presentation Mode (Fullscreen)"
        >
          <Play size={14} fill="currentColor" />
          <span>Present</span>
        </button>

        {/* Prominent Miro Blue Share Button */}
        <button className="ziro-share-btn" onClick={onOpenShareModal} title="Share & Invite Collaborators">
          <Share2 size={14} strokeWidth={2.2} />
          <span>Share</span>
        </button>

        {/* Export & Download Menu */}
        <div className="relative">
          <button
            className="ziro-export-btn"
            onClick={() => setShowExportMenu((prev) => !prev)}
            title="Export Board"
          >
            <Download size={15} strokeWidth={2.2} />
            <ChevronDown size={12} />
          </button>

          {showExportMenu && (
            <>
              <div className="dropdown-backdrop" onClick={() => setShowExportMenu(false)} />
              <div className="ziro-export-popover">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportPng();
                  }}
                >
                  <ImageIcon size={16} className="text-blue-500" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">Save as Image (PNG)</span>
                    <span className="text-[10px] text-slate-400">High-res vector render</span>
                  </div>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportJson();
                  }}
                >
                  <FileJson size={16} className="text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">Save as JSON</span>
                    <span className="text-[10px] text-slate-400">Backup board file</span>
                  </div>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} className="text-amber-500" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">Open JSON File</span>
                    <span className="text-[10px] text-slate-400">Restore from disk</span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportJson(file);
                    setShowExportMenu(false);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
