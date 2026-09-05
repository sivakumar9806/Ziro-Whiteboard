import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Pause, Volume2, Trash2, Radio } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(element.title || '🎙️ Team Voice Memo');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordTimerRef = useRef<any>(null);

  // Stop playback when unmounting
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    };
  }, []);

  // 1. Playback Engine (Real Audio Blob or Speech Synthesis + Audio Chime)
  const handleTogglePlay = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    console.log('🎙️ [VOICE MEMO] Play button clicked! Element ID:', element.id);

    if (isPlaying) {
      console.log('🎙️ [VOICE MEMO] Pausing playback');
      setIsPlaying(false);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setProgress(0);
      return;
    }

    setIsPlaying(true);
    setProgress(0);

    // Play pleasant audible melody chime immediately
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        console.log('🎙️ [VOICE MEMO] AudioContext active, state:', ctx.state);
        // Sequence of pleasant chime tones: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteTime = ctx.currentTime + idx * 0.18;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0.3, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.36);
        });
        console.log('🎙️ [VOICE MEMO] AUDIO STARTED - Melodic chimes playing');
      }
    } catch (err) {
      console.error('🎙️ [VOICE MEMO] Web Audio chime error:', err);
    }

    // If we have a recorded audio blob URL, play it
    if (element.audioBlobUrl) {
      console.log('🎙️ [VOICE MEMO] Playing custom recorded audio blob');
      const audio = new Audio(element.audioBlobUrl);
      audioPlayerRef.current = audio;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };

      audio.play().then(() => {
        console.log('🎙️ [VOICE MEMO] Custom audio blob playing successfully');
      }).catch((err) => {
        console.warn('🎙️ [VOICE MEMO] Audio blob play warning, falling back to speech:', err);
        speakVoiceNote();
      });
    } else {
      speakVoiceNote();
    }
  };

  const speakVoiceNote = () => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const textToSpeak = `${element.title || 'Voice Note'}. By ${element.authorName || 'Team Member'}: This whiteboard note is approved!`;
        console.log('🎙️ [VOICE MEMO] Speaking voice note aloud:', textToSpeak);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        const durationEstimate = 4;
        let elapsed = 0;
        const progressInterval = setInterval(() => {
          elapsed += 0.1;
          setProgress(Math.min(95, (elapsed / durationEstimate) * 100));
        }, 100);

        utterance.onend = () => {
          console.log('🎙️ [VOICE MEMO] Speech playback completed');
          clearInterval(progressInterval);
          setIsPlaying(false);
          setProgress(100);
          setTimeout(() => setProgress(0), 400);
        };

        utterance.onerror = (err) => {
          console.error('🎙️ [VOICE MEMO] Speech synthesis error:', err);
          clearInterval(progressInterval);
          setIsPlaying(false);
          setProgress(0);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('🎙️ [VOICE MEMO] SpeechSynthesis exception:', err);
        simulateProgress();
      }
    } else {
      simulateProgress();
    }
  };

  const simulateProgress = () => {
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsPlaying(false);
        setProgress(0);
      }
    }, 150);
  };

  // 2. Real Microphone Recording Engine
  const handleToggleRecord = async (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();

    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onUpdate(element.id, {
          audioBlobUrl: audioUrl,
          audioDuration: recordSeconds || 5,
        });
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      alert('Microphone permission was not granted. Click Play to hear synthesized voice notes!');
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    onUpdate(element.id, { title: titleDraft.trim() || '🎙️ Team Voice Memo' });
  };

  const waveformHeights = [35, 60, 25, 80, 50, 95, 40, 75, 55, 90, 30, 65, 45, 85, 40, 70];

  return (
    <div
      className={`audio-memo-card ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''} ${isRecording ? 'recording' : ''}`}
      style={{
        width: `${element.width || 250}px`,
        height: `${element.height || 145}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="audio-memo-header">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <div className={`audio-memo-icon-circle ${isPlaying ? 'pulse-glow' : ''} ${isRecording ? 'recording-pulse' : ''}`}>
            {isRecording ? <Radio size={13} className="text-white animate-pulse" /> : <Mic size={14} className="text-white" />}
          </div>
          {isEditingTitle ? (
            <input
              type="text"
              className="audio-memo-title-input"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span
              className="audio-memo-title"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
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
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
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

      {/* Body: Play Button + Record Button + Animated Waveform */}
      <div className="audio-memo-body">
        {/* Play/Pause Button */}
        <button
          type="button"
          className={`audio-memo-play-btn ${isPlaying ? 'playing' : ''}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleTogglePlay(e);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleTogglePlay}
          title={isPlaying ? 'Pause voice memo' : 'Play voice memo aloud'}
          disabled={isRecording}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* Dynamic Waveform Display */}
        <div className="audio-waveform-bars">
          {waveformHeights.map((h, i) => {
            const isBarPassed = progress >= (i / waveformHeights.length) * 100;
            return (
              <div
                key={i}
                className={`audio-wave-bar ${isPlaying || isRecording ? 'animating' : ''} ${isBarPassed ? 'passed' : ''}`}
                style={{
                  height: isPlaying || isRecording ? `${Math.min(100, h + Math.sin(Date.now() / 200 + i) * 25)}%` : `${h * 0.7}%`,
                  animationDelay: `${(i % 5) * 0.08}s`,
                }}
              />
            );
          })}
        </div>

        {/* Record Mic Button */}
        <button
          type="button"
          className={`audio-memo-record-btn ${isRecording ? 'recording' : ''}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleToggleRecord(e);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleToggleRecord}
          title={isRecording ? 'Stop recording voice' : 'Record voice with microphone'}
        >
          <Mic size={13} />
          <span>{isRecording ? `${recordSeconds}s` : 'Rec'}</span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="audio-memo-footer">
        <span className="audio-memo-author">
          By <strong>{element.authorName || 'Team Member'}</strong>
        </span>
        {isPlaying ? (
          <span className="audio-memo-status active">
            <Volume2 size={12} className="animate-pulse" /> Speaking Out Loud
          </span>
        ) : isRecording ? (
          <span className="audio-memo-status recording-text">
            🔴 Recording mic...
          </span>
        ) : (
          <span className="audio-memo-status">
            {element.audioBlobUrl ? '🎵 Custom Audio' : '🔊 Click ▶ to Listen'}
          </span>
        )}
      </div>
    </div>
  );
};
