import React, { useState } from 'react';
import { Check, Trash2, Send } from 'lucide-react';
import type { CommentElementData } from '../../types/whiteboard';

interface CommentElementProps {
  element: CommentElementData;
  isSelected: boolean;
  onUpdate: (updates: Partial<CommentElementData>) => void;
  onDelete: () => void;
}

export const CommentElement: React.FC<CommentElementProps> = ({
  element,
  isSelected,
  onUpdate,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(isSelected || !element.text);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(element.text);

  const initials = element.authorName
    ? element.authorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const handleAddReply = () => {
    if (!replyText.trim()) return;
    const newReply = {
      id: 'reply_' + Date.now(),
      authorName: 'Current User',
      authorAvatarColor: '#4262ff',
      text: replyText.trim(),
      createdAt: Date.now(),
    };
    onUpdate({
      replies: [...(element.replies || []), newReply],
    });
    setReplyText('');
  };

  const handleSaveText = () => {
    onUpdate({ text: editText.trim() });
  };

  return (
    <div
      className={`ziro-comment-container ${element.resolved ? 'resolved' : ''}`}
      style={{
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
    >
      {/* Pin Icon / Avatar */}
      <button
        className="ziro-comment-pin-btn"
        style={{ backgroundColor: element.resolved ? '#94a3b8' : element.authorAvatarColor || '#4262ff' }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title={`Comment by ${element.authorName}`}
      >
        {element.resolved ? (
          <Check size={16} color="#ffffff" strokeWidth={3} />
        ) : (
          <span className="ziro-comment-initials">{initials}</span>
        )}
      </button>

      {/* Popover Thread Card */}
      {isOpen && (
        <div
          className="ziro-comment-card"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="ziro-comment-card-header">
            <div className="ziro-comment-author-badge">
              <div
                className="ziro-comment-avatar-mini"
                style={{ backgroundColor: element.authorAvatarColor || '#4262ff' }}
              >
                {initials}
              </div>
              <div>
                <div className="ziro-comment-author-name">{element.authorName}</div>
                <div className="ziro-comment-time">Just now</div>
              </div>
            </div>
            <div className="ziro-comment-card-actions">
              <button
                className={`ziro-comment-resolve-btn ${element.resolved ? 'active' : ''}`}
                onClick={() => onUpdate({ resolved: !element.resolved })}
                title={element.resolved ? 'Re-open comment' : 'Mark as resolved'}
              >
                <Check size={14} />
              </button>
              <button
                className="ziro-comment-delete-btn"
                onClick={onDelete}
                title="Delete comment"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="ziro-comment-body">
            {!element.text ? (
              <div className="ziro-comment-input-wrap">
                <textarea
                  className="ziro-comment-textarea"
                  placeholder="Write a comment..."
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveText();
                    }
                  }}
                />
                <button className="ziro-comment-submit-btn" onClick={handleSaveText}>
                  Post
                </button>
              </div>
            ) : (
              <p className="ziro-comment-text">{element.text}</p>
            )}

            {/* Replies Thread */}
            {element.replies && element.replies.length > 0 && (
              <div className="ziro-comment-replies">
                {element.replies.map((reply) => (
                  <div key={reply.id} className="ziro-comment-reply-item">
                    <div
                      className="ziro-comment-avatar-micro"
                      style={{ backgroundColor: reply.authorAvatarColor }}
                    >
                      {reply.authorName[0]}
                    </div>
                    <div className="ziro-comment-reply-content">
                      <div className="ziro-comment-reply-author">{reply.authorName}</div>
                      <div className="ziro-comment-reply-text">{reply.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {element.text && (
              <div className="ziro-comment-reply-input">
                <input
                  type="text"
                  placeholder="Reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddReply();
                    }
                  }}
                />
                <button onClick={handleAddReply} title="Send reply">
                  <Send size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
