import React, { useState } from 'react';
import { Mic, Play, Pause, Volume2, Trash2 } from 'lucide-react';
import type { AudioMemoElementData } from '../../types/whiteboard';

interface AudioMemoElementProps {
  element: AudioMemoElementData;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<AudioMemoElementData>) => void;
  onDelete?: (id: string) => void;
}

export const AudioMemoElement: React.FC<AudioMemoElementProps> = ({
  element,
  isSelected,
  onUpdate,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
    onUpdate(element.id, { isPlaying: !isPlaying });
  };

  return (
    <div
      className={`audio-memo-card ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
      style={{
        width: `${element.width}px`,
        height: `${element.height}px`,
      }}
    >
      <div className="audio-memo-header">
        <div className="flex items-center gap-1.5">
          <div className="audio-memo-icon-circle">
            <Mic size={14} className="text-white" />
          </div>
          <span className="audio-memo-title">{element.title || 'Voice Note'}</span>
        </div>
        {isSelected && (
          <button
            type="button"
            className="audio-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(element.id);
            }}
            title="Delete voice note"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="audio-memo-body">
        <button
          type="button"
          className="audio-play-btn"
          onClick={togglePlay}
          title={isPlaying ? 'Pause voice memo' : 'Play voice memo'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        {/* Animated Sound Waveform */}
        <div className="audio-waveform-bars">
          {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 50, 85].map((h, i) => (
            <div
              key={i}
              className={`audio-wave-bar ${isPlaying ? 'animating' : ''}`}
              style={{
                height: isPlaying ? `${Math.min(100, h + Math.random() * 20)}%` : `${h * 0.6}%`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>

        <span className="audio-memo-duration">
          0:{element.audioDuration?.toString().padStart(2, '0') || '12'}
        </span>
      </div>

      <div className="audio-memo-footer">
        <span className="text-[10px] text-slate-400">By {element.authorName || 'Team Member'}</span>
        {isPlaying && (
          <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
            <Volume2 size={11} className="animate-pulse" /> Playing
          </span>
        )}
      </div>
    </div>
  );
};
