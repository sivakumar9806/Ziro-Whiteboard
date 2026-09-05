import React, { useState, useEffect, useRef } from 'react';
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
  const [progress, setProgress] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(element.title || '🎙️ Team Voice Memo');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Play realistic synthesized voice-note audio tone when playing
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioCtxRef.current = ctx;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          oscRef.current = osc;
        }
      } catch {
        // Fallback safely
      }

      const stepTime = (element.audioDuration || 14) * 10;
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (oscRef.current) {
              try { oscRef.current.stop(); } catch {}
            }
            return 0;
          }
          return prev + 1;
        });
      }, stepTime);
    } else {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
      }
      setProgress(0);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
      }
    };
  }, [isPlaying, element.audioDuration]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => !prev);
    onUpdate(element.id, { isPlaying: !isPlaying });
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onUpdate(element.id, { title: titleDraft.trim() || '🎙️ Team Voice Memo' });
  };

  const waveformHeights = [35, 60, 25, 80, 50, 95, 40, 75, 55, 90, 30, 65, 45, 85, 40, 70];

  return (
    <div
      className={`audio-memo-card ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
      style={{
        width: `${element.width || 240}px`,
        height: `${element.height || 140}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="audio-memo-header">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className={`audio-memo-icon-circle ${isPlaying ? 'pulse-glow' : ''}`}>
            <Mic size={14} className="text-white" />
          </div>
          {isEditingTitle ? (
            <input
              type="text"
              className="audio-memo-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              autoFocus
            />
          ) : (
            <span
              className="audio-memo-title"
              onDoubleClick={() => setIsEditingTitle(true)}
              title="Double click to rename"
            >
              {element.title || '🎙️ Team Voice Memo'}
            </span>
          )}
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

      {/* Body: Play Button + Animated Waveform */}
      <div className="audio-memo-body">
        <button
          type="button"
          className={`audio-memo-play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pause voice memo' : 'Play voice memo'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>

        {/* Dynamic Waveform Display */}
        <div className="audio-waveform-bars">
          {waveformHeights.map((h, i) => {
            const isBarPassed = progress >= (i / waveformHeights.length) * 100;
            return (
              <div
                key={i}
                className={`audio-wave-bar ${isPlaying ? 'animating' : ''} ${isBarPassed ? 'passed' : ''}`}
                style={{
                  height: isPlaying ? `${Math.min(100, h + Math.sin(Date.now() / 200 + i) * 20)}%` : `${h * 0.7}%`,
                  animationDelay: `${(i % 5) * 0.1}s`,
                }}
              />
            );
          })}
        </div>

        <span className="audio-memo-duration">
          {isPlaying ? `0:${Math.floor((progress / 100) * (element.audioDuration || 14)).toString().padStart(2, '0')}` : `0:${element.audioDuration || 14}`}
        </span>
      </div>

      {/* Footer Info */}
      <div className="audio-memo-footer">
        <span className="audio-memo-author">
          By <strong>{element.authorName || 'Team Member'}</strong>
        </span>
        {isPlaying ? (
          <span className="audio-memo-status active">
            <Volume2 size={12} className="animate-pulse" /> Playing Note
          </span>
        ) : (
          <span className="audio-memo-status">Click ▶ to listen</span>
        )}
      </div>
    </div>
  );
};
