import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Users,
  Globe,
  Radio,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { CollaboratorPresence, User, RoomInfo } from '../../types/whiteboard';

interface ShareInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTitle: string;
  currentUser: User;
  collaborators: CollaboratorPresence[];
  roomInfo: RoomInfo;
  onJoinRoom: (newRoomId: string) => void;
}

export const ShareInviteModal: React.FC<ShareInviteModalProps> = ({
  isOpen,
  onClose,
  boardTitle,
  currentUser,
  collaborators,
  roomInfo,
  onJoinRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoinCustomRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomInput.trim()) return;
    setIsJoining(true);
    onJoinRoom(customRoomInput.trim());
    setTimeout(() => {
      setIsJoining(false);
      onClose();
    }, 400);
  };

  const activeParticipantsCount = collaborators.length + 1;

  return (
    <div className="modal-overlay ziro-share-modal-overlay" onClick={onClose}>
      <div className="ziro-share-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ziro-share-header">
          <div className="flex items-center gap-3">
            <div className="ziro-share-icon-wrap">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="ziro-share-title">Invite & Collaborate</h2>
              <p className="ziro-share-subtitle">
                Share <strong className="text-slate-800 font-semibold">{boardTitle}</strong> with your team
              </p>
            </div>
          </div>
          <button className="ziro-modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Live Status Banner */}
        <div className="ziro-collab-status-banner">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-emerald-500 animate-pulse" />
            <span className="font-semibold text-xs text-slate-800">
              Live Multi-User Mesh Active
            </span>
          </div>
          <div className="ziro-badge-online">
            <span className="ziro-green-dot" />
            <span>{activeParticipantsCount} {activeParticipantsCount === 1 ? 'person' : 'people'} in room</span>
          </div>
        </div>

        {/* Link Copy Box */}
        <div className="ziro-share-section">
          <label className="ziro-share-label">
            <Globe size={14} className="text-slate-500" />
            <span>Board Share Link (10+ users can edit concurrently)</span>
          </label>
          <div className="ziro-copy-input-group">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="ziro-share-url-input"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              className={`ziro-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-[12px] text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Anyone with this link can join, draw, chat, and edit in real time.</span>
          </div>
        </div>

        {/* Active Members Section */}
        <div className="ziro-share-section">
          <div className="flex items-center justify-between mb-2">
            <label className="ziro-share-label">
              <Users size={14} className="text-slate-500" />
              <span>Current Collaborators ({activeParticipantsCount})</span>
            </label>
            <span className="text-[11px] text-slate-400">WebRTC Live Synced</span>
          </div>

          <div className="ziro-collaborators-list">
            {/* Current User */}
            <div className="ziro-collab-user-row">
              <div
                className="ziro-user-avatar-sm"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {currentUser.name} <span className="text-blue-600 font-medium">(You)</span>
                </div>
                <div className="text-[11px] text-slate-400">{currentUser.email}</div>
              </div>
              <span className="ziro-pill-role">Host / Active</span>
            </div>

            {/* Remote Peers */}
            {collaborators.map((c) => (
              <div key={c.id} className="ziro-collab-user-row">
                <div
                  className="ziro-user-avatar-sm"
                  style={{ backgroundColor: c.user.avatarColor }}
                >
                  {c.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {c.user.name}
                  </div>
                  <div className="text-[11px] text-slate-400">Connected peer</div>
                </div>
                <span className="ziro-pill-online">
                  <span className="ziro-green-dot" /> Online
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Switch / Join Custom Room Form */}
        <div className="ziro-share-section ziro-switch-room-box">
          <label className="ziro-share-label">
            <Sparkles size={14} className="text-amber-500" />
            <span>Join or Create Team Room Code</span>
          </label>
          <form onSubmit={handleJoinCustomRoom} className="flex gap-2">
            <input
              type="text"
              placeholder={`e.g. sprint-${Math.floor(100 + Math.random() * 900)}`}
              value={customRoomInput}
              onChange={(e) => setCustomRoomInput(e.target.value)}
              className="ziro-custom-room-input"
            />
            <button
              type="submit"
              disabled={isJoining || !customRoomInput.trim()}
              className="ziro-join-room-btn"
            >
              <span>{isJoining ? 'Joining...' : 'Switch Room'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
          <div className="text-[11px] text-slate-400 mt-1">
            Current Room: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">{roomInfo.roomId || 'main-room'}</code>
          </div>
        </div>

        {/* Footer */}
        <div className="ziro-share-footer">
          <button className="ziro-btn-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
