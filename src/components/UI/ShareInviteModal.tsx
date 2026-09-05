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
  MessageCircle,
  Mail,
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

  // Construct absolute shareable URL with room parameter
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ziroboard.netlify.app';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const currentRoomId = roomInfo.roomId || 'main';
  const shareableUrl = `${origin}${pathname}?room=${currentRoomId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `👋 Join my live Ziro Whiteboard session: "${boardTitle}"! Click to edit with me in real-time: ${shareableUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Invitation to collaborate on "${boardTitle}" - Ziro Whiteboard`);
    const body = encodeURIComponent(
      `Hi,\n\nI invite you to collaborate with me on Ziro Whiteboard in real-time.\n\n👉 Join the live session here:\n${shareableUrl}\n\nSee you on the board!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
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
            <div className="ziro-share-icon-wrap" style={{ background: 'linear-gradient(135deg, #4262ff 0%, #3b82f6 100%)', color: '#fff' }}>
              <Users size={20} />
            </div>
            <div>
              <h2 className="ziro-share-title">Invite Colleague & Collaborate Live</h2>
              <p className="ziro-share-subtitle">
                Share <strong className="text-slate-800 font-semibold">{boardTitle}</strong> for instant multi-user editing
              </p>
            </div>
          </div>
          <button className="ziro-modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Live Status Banner */}
        <div className="ziro-collab-status-banner">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-emerald-500 animate-pulse" />
            <span className="font-semibold text-xs text-slate-800">
              {roomInfo.isHost ? '👑 You are Hosting this Session' : '🌐 Connected to Live Mesh'}
            </span>
          </div>
          <div className="ziro-badge-online">
            <span className="ziro-green-dot" />
            <span>{activeParticipantsCount} {activeParticipantsCount === 1 ? 'person active' : 'people collaborating'}</span>
          </div>
        </div>

        {/* Link Copy Box */}
        <div className="ziro-share-section">
          <label className="ziro-share-label">
            <Globe size={14} className="text-blue-600" />
            <span>Live Collab Invitation Link</span>
          </label>
          <div className="ziro-copy-input-group">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="ziro-share-url-input font-mono text-[12px]"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              className={`ziro-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
              title="Copy link to clipboard"
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

          {/* 1-Click Fast Social Sharing */}
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle size={14} />
              <span>Share to WhatsApp</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
              onClick={handleShareEmail}
            >
              <Mail size={14} />
              <span>Send Email Invite</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>When your colleague opens this link, both of you can draw, move shapes, add sticky notes, and voice chat concurrently.</span>
          </div>
        </div>

        {/* Active Members Section */}
        <div className="ziro-share-section">
          <div className="flex items-center justify-between mb-2">
            <label className="ziro-share-label">
              <Users size={14} className="text-slate-500" />
              <span>Active in Room ({activeParticipantsCount})</span>
            </label>
            <span className="text-[11px] text-slate-400">WebRTC P2P Sync Active</span>
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
                <div className="text-[11px] text-slate-400">{currentUser.email || 'Host'}</div>
              </div>
              <span className="ziro-pill-role">{roomInfo.isHost ? 'Host' : 'Active'}</span>
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
                  <div className="text-[11px] text-slate-400">Collaborator (Live)</div>
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
            <span>Join or Switch to a Different Room Code</span>
          </label>
          <form onSubmit={handleJoinCustomRoom} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. project-design-room"
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
            Current Room: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono font-semibold">{currentRoomId}</code>
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
