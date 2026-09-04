import React, { useState } from 'react';
import {
  X,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  Search,
  Layout,
  Clock,
  Layers,
} from 'lucide-react';
import type { BoardRecord } from '../../types/whiteboard';
import type { BoardTemplate } from '../../utils/templates';
import {
  getAllBoards,
  createNewBoard,
  duplicateBoardRecord,
  deleteBoardRecord,
  saveBoardRecord,
  setActiveBoardId,
} from '../../services/boardService';
import { TEMPLATES } from '../../utils/templates';

interface BoardsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoardId: string;
  onSwitchBoard: (board: BoardRecord) => void;
}

export const BoardsDashboardModal: React.FC<BoardsDashboardModalProps> = ({
  isOpen,
  onClose,
  activeBoardId,
  onSwitchBoard,
}) => {
  const [boards, setBoards] = useState<BoardRecord[]>(getAllBoards());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const filteredBoards = boards.filter((b) =>
    b.metadata.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = (template?: BoardTemplate) => {
    const title = template ? `${template.name}` : 'New Whiteboard';
    const elements = template ? template.elements : [];
    const newBoard = createNewBoard(title, elements);
    setBoards(getAllBoards());
    onSwitchBoard(newBoard);
    onClose();
  };

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const duplicated = duplicateBoardRecord(id);
    if (duplicated) {
      setBoards(getAllBoards());
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (boards.length <= 1) {
      alert('You must keep at least one board in your workspace.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this board?')) {
      const updated = deleteBoardRecord(id);
      setBoards(updated);
      if (activeBoardId === id) {
        onSwitchBoard(updated[0]);
      }
    }
  };

  const handleStartRename = (e: React.MouseEvent, board: BoardRecord) => {
    e.stopPropagation();
    setEditingBoardId(board.metadata.id);
    setEditTitle(board.metadata.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.KeyboardEvent, board: BoardRecord) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      const updated = {
        ...board,
        metadata: { ...board.metadata, title: editTitle.trim() },
      };
      saveBoardRecord(updated);
      setBoards(getAllBoards());
      if (activeBoardId === board.metadata.id) {
        onSwitchBoard(updated);
      }
    }
    setEditingBoardId(null);
  };

  const formatDate = (timestamp: number) => {
    const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${Math.round(diffHours)} hours ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card dashboard-modal-card">
        {/* Header */}
        <div className="dashboard-modal-header">
          <div className="flex items-center gap-3">
            <div className="dashboard-header-icon">
              <Layout size={22} className="text-blue-500" />
            </div>
            <div>
              <h2 className="modal-title">My Whiteboard Workspace</h2>
              <p className="modal-subtitle">Manage, switch, or create infinite boards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="dashboard-new-board-btn" onClick={() => handleCreateNew()}>
              <Plus size={16} />
              <span>New Board</span>
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar & Quick Templates Strip */}
        <div className="dashboard-toolbar-row">
          <div className="dashboard-search-wrapper">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              className="dashboard-search-input"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="dashboard-quick-templates">
            <span className="text-xs font-semibold text-slate-500">Quick Start:</span>
            {TEMPLATES.slice(0, 2).map((t) => (
              <button
                key={t.id}
                className="quick-template-chip"
                onClick={() => handleCreateNew(t)}
              >
                + {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Boards Grid */}
        <div className="boards-dashboard-grid">
          {filteredBoards.map((b) => {
            const isActive = b.metadata.id === activeBoardId;
            const isEditing = editingBoardId === b.metadata.id;

            return (
              <div
                key={b.metadata.id}
                className={`board-dashboard-card ${isActive ? 'active-board' : ''}`}
                onClick={() => {
                  setActiveBoardId(b.metadata.id);
                  onSwitchBoard(b);
                  onClose();
                }}
              >
                {/* Thumbnail Preview Area */}
                <div
                  className="board-card-thumbnail"
                  style={{ backgroundColor: b.metadata.thumbnailColor || '#3b82f6' }}
                >
                  <div className="thumbnail-pattern-overlay" />
                  <div className="thumbnail-badge">
                    <Layers size={13} />
                    <span>{b.elements.length} elements</span>
                  </div>
                  {isActive && (
                    <div className="current-active-badge">
                      <Check size={12} strokeWidth={3} />
                      <span>Current Board</span>
                    </div>
                  )}
                </div>

                {/* Info & Actions */}
                <div className="board-card-body">
                  <div className="board-card-title-row">
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="board-rename-input"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(e, b);
                            if (e.key === 'Escape') setEditingBoardId(null);
                          }}
                          autoFocus
                        />
                        <button
                          className="save-rename-btn"
                          onClick={(e) => handleSaveRename(e, b)}
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <h3 className="board-card-title" title={b.metadata.title}>
                        {b.metadata.title}
                      </h3>
                    )}
                  </div>

                  <div className="board-card-footer">
                    <div className="board-modified-time">
                      <Clock size={12} />
                      <span>{formatDate(b.metadata.lastModified)}</span>
                    </div>

                    <div className="board-card-actions">
                      <button
                        className="board-action-icon-btn"
                        onClick={(e) => handleStartRename(e, b)}
                        title="Rename board"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="board-action-icon-btn"
                        onClick={(e) => handleDuplicate(e, b.metadata.id)}
                        title="Duplicate board"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        className="board-action-icon-btn delete-action"
                        onClick={(e) => handleDelete(e, b.metadata.id)}
                        title="Delete board"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
