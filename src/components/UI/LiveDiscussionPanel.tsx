import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Smile,
  X,
  ChevronDown,
  ChevronUp,
  Volume2,
} from 'lucide-react';
import type { ChatMessage, User, RoomInfo, CollaboratorPresence } from '../../types/whiteboard';

interface LiveDiscussionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  collaborators: CollaboratorPresence[];
  roomInfo: RoomInfo;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  isVoiceActive: boolean;
  isMicMuted: boolean;
  onStartVoice: () => void;
  onToggleMute: () => void;
  onStopVoice: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
}

export const LiveDiscussionPanel: React.FC<LiveDiscussionPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  collaborators,
  roomInfo,
  chatMessages,
  onSendMessage,
  onSendReaction,
  isVoiceActive,
  isMicMuted,
  onStartVoice,
  onToggleMute,
  onStopVoice,
  onToggleExpand,
  isExpanded,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isExpanded && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isExpanded, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const emojis = ['👍', '❤️', '🔥', '🎉', '💡', '🚀', '👏', '💯', '🤔', '👀'];

  return (
    <div className={`ziro-discussion-dock ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Dock Header */}
      <div className="ziro-discussion-header" onClick={onToggleExpand}>
        <div className="flex items-center gap-2">
          <div className="ziro-dock-pulse-icon">
            <MessageSquare size={16} className="text-blue-600" />
            <span className="ziro-pulse-ring" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Live Discussion</span>
              <span className="ziro-room-pill font-mono">{roomInfo.roomId || 'main'}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {collaborators.length + 1} participants in meeting
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="ziro-dock-action-btn"
            onClick={onToggleExpand}
            title={isExpanded ? 'Minimize Discussion' : 'Expand Discussion'}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            className="ziro-dock-action-btn"
            onClick={onClose}
            title="Close Discussion Panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="ziro-discussion-body">
          {/* Voice Call Strip */}
          <div className="ziro-voice-strip">
            <div className="flex items-center gap-2">
              {isVoiceActive ? (
                <div className="ziro-voice-active-indicator">
                  <Volume2 size={15} className="text-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">Voice Connected</span>
                </div>
              ) : (
                <div className="text-xs text-slate-600 font-medium">
                  Team Audio Discussion
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {isVoiceActive ? (
                <>
                  <button
                    className={`ziro-voice-btn ${isMicMuted ? 'muted' : 'unmuted'}`}
                    onClick={onToggleMute}
                    title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  >
                    {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isMicMuted ? 'Muted' : 'Speaking'}</span>
                  </button>
                  <button
                    className="ziro-voice-btn leave"
                    onClick={onStopVoice}
                    title="Leave Voice Call"
                  >
                    <PhoneOff size={14} />
                  </button>
                </>
              ) : (
                <button className="ziro-voice-btn join" onClick={onStartVoice}>
                  <PhoneCall size={13} />
                  <span>Join Audio</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Reaction Bar */}
          <div className="ziro-quick-reaction-bar">
            <span className="text-[11px] text-slate-400 mr-1 font-medium">Live Reactions:</span>
            {emojis.slice(0, 7).map((emoji) => (
              <button
                key={emoji}
                className="ziro-mini-emoji-btn"
                onClick={() => onSendReaction(emoji)}
                title={`Send ${emoji} to canvas`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Chat Messages List */}
          <div className="ziro-chat-message-list">
            {chatMessages.length === 0 ? (
              <div className="ziro-empty-chat">
                <p className="font-semibold text-slate-700 text-xs">No discussion notes yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type a message below or react to discuss changes in real time!
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isSelf = msg.senderId === currentUser.id || msg.senderName === currentUser.name;
                return (
                  <div
                    key={msg.id}
                    className={`ziro-chat-message-item ${isSelf ? 'self' : 'other'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="ziro-chat-avatar-dot"
                        style={{ backgroundColor: msg.senderAvatarColor || '#3b82f6' }}
                      >
                        {msg.senderName.charAt(0)}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700">
                        {isSelf ? 'You' : msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="ziro-chat-bubble">{msg.text}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Box */}
          <form onSubmit={handleSend} className="ziro-chat-input-bar">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Discuss changes with team..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="ziro-chat-text-input"
              />
              <button
                type="button"
                className="ziro-emoji-toggle-btn"
                onClick={() => setShowEmojiBar((prev) => !prev)}
                title="Pick Emoji"
              >
                <Smile size={16} />
              </button>

              {showEmojiBar && (
                <div className="ziro-chat-emoji-popover">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="ziro-emoji-item"
                      onClick={() => {
                        setInputText((prev) => prev + emoji);
                        setShowEmojiBar(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="ziro-chat-send-btn"
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
