import React, { useState, useRef } from 'react';
import {
  Undo2,
  Redo2,
  Download,
  Upload,
  Image as ImageIcon,
  FileJson,
  Trash2,
  HelpCircle,
  LayoutTemplate,
  Check,
  ChevronDown,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import type { BoardMetadata, User, CollaboratorPresence } from '../../types/whiteboard';

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
  onOpenTemplates,
  onOpenShortcuts,
  onOpenDashboard,
  onOpenAuth,
  currentUser,
  collaborators,
  isSimulating,
  onToggleSimulation,
  saveStatus,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(metadata.title);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim()) {
      onUpdateTitle(titleDraft.trim());
    } else {
      setTitleDraft(metadata.title);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
    if (e.target) e.target.value = '';
    setShowExportMenu(false);
  };

  return (
    <header className="top-nav-container">
      {/* Left: Brand, Dashboard Switcher & Editable Title */}
      <div className="top-nav-left">
        <button
          className="brand-badge clickable-brand"
          onClick={onOpenDashboard}
          title="Open My Boards Workspace"
        >
          <div className="brand-logo-icon">
            <span className="brand-m">M</span>
          </div>
          <span className="brand-name">MiroBoard</span>
        </button>

        <button
          className="nav-dashboard-btn"
          onClick={onOpenDashboard}
          title="Open Workspace Dashboard"
        >
          <LayoutDashboard size={15} />
          <span>My Boards</span>
        </button>

        <div className="divider-v" />

        <div className="title-section">
          {isEditingTitle ? (
            <input
              type="text"
              className="board-title-input"
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
            <h1
              className="board-title-text"
              onClick={() => {
                setTitleDraft(metadata.title);
                setIsEditingTitle(true);
              }}
              title="Click to rename board"
            >
              {metadata.title}
            </h1>
          )}

          <div className="save-status-badge" title="Automatically saved to local database">
            {saveStatus === 'saved' ? (
              <>
                <Check size={13} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Saved</span>
              </>
            ) : (
              <>
                <span className="saving-spinner" />
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Saving...</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Middle / Right: Actions, Real-time Collab Avatars, & User Profile */}
      <div className="top-nav-right">
        {/* Active Collaborators Presence Stack */}
        <div className="collaborators-avatar-stack" title={`${collaborators.length + 1} users active on this board`}>
          {/* Current User */}
          <div
            className="user-avatar-pill current-user-avatar"
            style={{ backgroundColor: currentUser.avatarColor }}
            onClick={onOpenAuth}
            title={`${currentUser.name} (You)`}
          >
            {currentUser.name.charAt(0)}
          </div>

          {/* Active Remote / Simulated Collaborators */}
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="user-avatar-pill remote-collab-avatar"
              style={{ backgroundColor: collab.user.avatarColor || '#3b82f6' }}
              title={`${collab.user.name} (Online)`}
            >
              {collab.user.name.charAt(0)}
            </div>
          ))}
        </div>

        {/* Real-time Collaboration Toggle */}
        <button
          className={`collab-sim-btn ${isSimulating ? 'active' : ''}`}
          onClick={onToggleSimulation}
          title={isSimulating ? 'Stop live collaborator simulation' : 'Simulate live colleagues working on canvas'}
        >
          <Users size={14} />
          <span>{isSimulating ? 'Live Collab ON' : 'Simulate Collab'}</span>
          {isSimulating && <span className="live-pulsing-dot" />}
        </button>

        <div className="divider-v" />

        {/* Undo & Redo */}
        <div className="action-button-group">
          <button
            className={`nav-icon-button ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            className={`nav-icon-button ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={18} />
          </button>
        </div>

        <div className="divider-v" />

        {/* Templates */}
        <button className="nav-text-button" onClick={onOpenTemplates} title="Browse Starter Templates">
          <LayoutTemplate size={16} style={{ color: '#6366f1' }} />
          <span>Templates</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            className="nav-text-button export-btn"
            onClick={() => setShowExportMenu((prev) => !prev)}
            title="Export or Import Board"
          >
            <Download size={16} />
            <span>Export</span>
            <ChevronDown size={14} />
          </button>

          {showExportMenu && (
            <>
              <div className="dropdown-backdrop" onClick={() => setShowExportMenu(false)} />
              <div className="export-dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportPng();
                  }}
                >
                  <ImageIcon size={16} style={{ color: '#3b82f6' }} />
                  <div className="dropdown-item-text">
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Export as PNG</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>High resolution image</span>
                  </div>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowExportMenu(false);
                    onExportJson();
                  }}
                >
                  <FileJson size={16} style={{ color: '#10b981' }} />
                  <div className="dropdown-item-text">
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Export as JSON</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Reusable board data</span>
                  </div>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} style={{ color: '#f59e0b' }} />
                  <div className="dropdown-item-text">
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>Import JSON</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Load board from file</span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
        </div>

        <div className="divider-v" />

        {/* Clear Board */}
        <button
          className="nav-icon-button clear-btn"
          onClick={onClearBoard}
          title="Clear Board Canvas"
        >
          <Trash2 size={17} />
        </button>

        {/* Shortcuts Help */}
        <button
          className="nav-icon-button help-btn"
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={18} />
        </button>
      </div>
    </header>
  );
};
