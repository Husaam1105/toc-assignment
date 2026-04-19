import React from 'react';
import type { GameMode } from '../engine/types';

interface PlaybackControlsProps {
  mode: GameMode;
  onModeChange: (m: GameMode) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  canPrev: boolean;
  canNext: boolean;
  hasPath: boolean;
}

const IcnBtn = ({
  children, onClick, disabled = false, active = false, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        border: active
          ? '1px solid var(--accent)'
          : `1px solid ${hovered && !disabled ? 'var(--border-strong)' : 'var(--border)'}`,
        background: active
          ? 'var(--accent)'
          : hovered && !disabled
          ? 'var(--surface-3)'
          : 'var(--surface-2)',
        color: active ? 'white' : hovered && !disabled ? 'var(--text)' : 'var(--text-muted)',
        boxShadow: active ? 'var(--accent-glow)' : 'none',
        minWidth: '36px',
      }}
    >
      {children}
    </button>
  );
};

export default function PlaybackControls({
  mode, onModeChange, isPlaying, onPlay, onPrev, onNext, onReset,
  speed, onSpeedChange, canPrev, canNext, hasPath,
}: PlaybackControlsProps) {

  const speedLabel = speed <= 300 ? 'Fast' : speed <= 800 ? 'Normal' : 'Slow';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '10px 16px',
      boxShadow: 'var(--shadow-md)',
      flexWrap: 'wrap',
    }}>
      {/* Mode toggle */}
      <div style={{
        display: 'flex',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '3px',
        gap: '2px',
        flexShrink: 0,
      }}>
        {(['auto', 'manual'] as GameMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              border: 'none',
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? 'white' : 'var(--text-muted)',
              boxShadow: mode === m ? 'var(--accent-glow)' : 'none',
              letterSpacing: '0.02em',
            }}
          >
            {m === 'auto' ? '🤖 Auto' : '🕹️ Manual'}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />

      {/* Playback */}
      <IcnBtn onClick={onPrev} disabled={!canPrev || !hasPath} title="Previous step (←)">◀</IcnBtn>
      <IcnBtn onClick={onPlay} active={true} disabled={!hasPath} title="Play/Pause (Space)">
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </IcnBtn>
      <IcnBtn onClick={onNext} disabled={!canNext || !hasPath} title="Next step (→)">▶</IcnBtn>

      <div style={{ width: '1px', height: '28px', background: 'var(--border)', flexShrink: 0 }} />

      {/* Speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-subtle)' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>{speedLabel}</span>
        <input
          type="range" min={100} max={2000} value={speed} dir="rtl"
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: '72px', cursor: 'pointer', accentColor: 'var(--accent)' }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-subtle)', minWidth: '38px' }}>{speed}ms</span>
      </div>

      {/* Reset */}
      <div style={{ marginLeft: 'auto' }}>
        <IcnBtn onClick={onReset} title="Reset">↺ Reset</IcnBtn>
      </div>
    </div>
  );
}
