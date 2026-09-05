import React, { useState } from 'react';
import { X, Vote, Trophy, RotateCcw } from 'lucide-react';
import type { CanvasElement } from '../../types/whiteboard';
import confetti from 'canvas-confetti';

interface VotingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: CanvasElement[];
  onAddVoteToElement?: (elementId: string) => void;
}

export const VotingSessionModal: React.FC<VotingSessionModalProps> = ({
  isOpen,
  onClose,
  elements,
}) => {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [votesLeft, setVotesLeft] = useState(5);
  const [sessionFinished, setSessionFinished] = useState(false);

  if (!isOpen) return null;

  // Filter sticky notes and shapes that can receive votes
  const votableElements = elements.filter(
    (el) => el.type === 'sticky' || (el.type !== 'frame' && el.type !== 'arrow')
  );

  const handleCastVote = (elId: string) => {
    if (votesLeft <= 0) return;
    setVotes((prev) => ({
      ...prev,
      [elId]: (prev[elId] || 0) + 1,
    }));
    setVotesLeft((prev) => prev - 1);
  };

  const handleRemoveVote = (elId: string) => {
    if (!votes[elId]) return;
    setVotes((prev) => ({
      ...prev,
      [elId]: prev[elId] - 1,
    }));
    setVotesLeft((prev) => prev + 1);
  };

  const handleFinishVoting = () => {
    setSessionFinished(true);
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.3 } });
  };

  const handleReset = () => {
    setVotes({});
    setVotesLeft(5);
    setSessionFinished(false);
  };

  // Get ranked elements
  const ranked = votableElements
    .map((el) => {
      let text = (el as any).text || (el as any).title || `Shape (${el.type})`;
      return {
        id: el.id,
        text: text.slice(0, 45),
        count: votes[el.id] || 0,
        type: el.type,
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card voting-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2.5">
            <div className="voting-icon-badge">
              <Vote size={22} className="text-white" />
            </div>
            <div>
              <h2 className="modal-title flex items-center gap-2">
                <span>Team Dot-Voting & Estimation</span>
                <span className="voting-pill">Team Superpower</span>
              </h2>
              <p className="modal-subtitle">
                Cast votes on ideas and sticky notes to prioritize features collaboratively.
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="voting-status-bar">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Your Votes Remaining:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`voting-dot-pill ${i < votesLeft ? 'available' : 'used'}`}
                >
                  🔴
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!sessionFinished ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleFinishVoting}
              >
                <Trophy size={14} />
                <span>Finish & View Results</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                <RotateCcw size={14} />
                <span>New Voting Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Ideas List for Voting */}
        <div className="voting-ideas-list">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">
            {sessionFinished ? '🏆 Final Voting Leaderboard' : 'Click "+ Vote" on canvas ideas:'}
          </div>

          {votableElements.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No sticky notes or shapes on canvas yet. Add sticky notes first to start voting!
            </div>
          ) : (
            <div className="voting-items-grid">
              {ranked.map((item, index) => (
                <div
                  key={item.id}
                  className={`voting-item-row ${item.count > 0 ? 'has-votes' : ''} ${
                    sessionFinished && index === 0 && item.count > 0 ? 'winner' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="voting-rank-number">#{index + 1}</span>
                    <span className="voting-item-text">{item.text}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="voting-tally-badge">
                      {item.count} {item.count === 1 ? 'vote' : 'votes'}
                    </span>

                    {!sessionFinished && (
                      <div className="flex items-center gap-1">
                        {item.count > 0 && (
                          <button
                            type="button"
                            className="vote-btn-minus"
                            onClick={() => handleRemoveVote(item.id)}
                            title="Remove vote"
                          >
                            -
                          </button>
                        )}
                        <button
                          type="button"
                          className="vote-btn-plus"
                          onClick={() => handleCastVote(item.id)}
                          disabled={votesLeft <= 0}
                          title="Add vote dot"
                        >
                          + Vote
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="voting-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Back to Whiteboard
          </button>
        </div>
      </div>
    </div>
  );
};
