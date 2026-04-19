import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LEVELS } from '../engine/levels';
import type { Level } from '../engine/types';

const LEVEL_THEMES: Record<string, { gradient: string; glow: string; tag: string; tagColor: string; bgTint: string }> = {
  anbn:      { gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', glow: 'rgba(59, 130, 246, 0.25)', tag: 'beginner', tagColor: '#2563eb', bgTint: '#eff6ff' },
  balanced:  { gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', glow: 'rgba(139, 92, 246, 0.25)', tag: 'medium', tagColor: '#7c3aed', bgTint: '#f5f3ff' },
  palindrome:{ gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', glow: 'rgba(245, 158, 11, 0.25)', tag: 'medium', tagColor: '#d97706', bgTint: '#fffbeb' },
  wcwr:      { gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', glow: 'rgba(16, 185, 129, 0.25)', tag: 'hard', tagColor: '#059669', bgTint: '#ecfdf5' },
  custom:    { gradient: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', glow: 'rgba(100, 116, 139, 0.2)', tag: 'free play', tagColor: '#475569', bgTint: '#f8fafc' },
};

function DifficultyDots({ count, activeColor }: { count: 1 | 2 | 3; activeColor: string }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          width: i <= count ? '16px' : '8px',
          height: '5px',
          borderRadius: '3px',
          background: i <= count ? activeColor : 'rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease',
        }} />
      ))}
    </div>
  );
}

function LevelCard({ level, onClick, index }: { level: Level; onClick: () => void; index: number }) {
  const [hovered, setHovered] = React.useState(false);
  const theme = LEVEL_THEMES[level.id] || LEVEL_THEMES.custom;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fade-up"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hovered ? theme.tagColor : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '0',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px ${theme.tagColor}33`
          : 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animationDelay: `${index * 80}ms`,
        position: 'relative',
      }}
    >
      {/* Visual Header */}
      <div style={{
        background: theme.bgTint,
        padding: '28px 24px 22px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
      }}>
        {/* Background gradient blob */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          background: theme.gradient, opacity: 0.1,
          transition: 'transform 0.5s ease',
          transform: hovered ? 'scale(1.5)' : 'scale(1)',
        }} />

        {/* Top row — emoji + tag */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '40px', lineHeight: 1,
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: hovered ? 'scale(1.2) rotate(-5deg)' : 'scale(1) rotate(0deg)',
          }}>
            {level.emoji}
          </div>
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: theme.tagColor,
            background: 'white',
            padding: '4px 10px',
            borderRadius: '100px',
            boxShadow: 'var(--shadow-sm)',
            border: `1px solid var(--border)`,
          }}>
            {theme.tag}
          </span>
        </div>

        {/* Title Group */}
        <div style={{ marginTop: '20px', position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontWeight: 800,
            fontSize: '22px',
            color: 'var(--text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginBottom: '4px',
          }}>
            {level.name}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
            {level.subtitle}
          </p>
        </div>
      </div>

      {/* Body Info */}
      <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {/* Difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Difficulty</span>
          <DifficultyDots count={level.difficulty} activeColor={theme.tagColor} />
        </div>

        {/* Grammar Block */}
        {level.id !== 'custom' ? (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: theme.tagColor,
            background: 'white',
            border: `1px solid ${theme.tagColor}22`,
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
          }}>
            {level.grammar}
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-subtle)',
            fontStyle: 'italic',
            padding: '10px 12px',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
          }}>
            Create your own rules...
          </div>
        )}

        {/* Example Tags */}
        {level.examples.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {level.examples.slice(0, 3).map((ex) => (
              <span key={ex} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
              }}>
                {ex}
              </span>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Play Button */}
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius)',
          background: hovered ? theme.tagColor : 'var(--surface-2)',
          border: `1px solid ${hovered ? theme.tagColor : 'var(--border)'}`,
          color: hovered ? 'white' : theme.tagColor,
          fontWeight: 700,
          fontSize: '13px',
          textAlign: 'center',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: hovered ? `0 8px 16px ${theme.glow}` : 'none',
        }}>
          {hovered ? 'Start Playing' : 'View Level'}
        </div>
      </div>
    </div>
  );
}

export default function LevelSelect() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative ambient blobs */}
      <div style={{
        position: 'fixed', top: '-10%', left: '-5%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-10%', right: '-5%',
        width: '35vw', height: '35vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '80px 24px 100px', position: 'relative' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }} className="fade-up">
          <h1 style={{
            fontSize: '72px',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '24px',
            color: 'var(--text)',
          }}>
            Parse <span style={{ color: 'var(--accent)' }}>Quest</span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto 40px',
            fontWeight: 500,
          }}>
            An interactive journey into the world of Context-Free Grammars and the machines that parse them.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Auto mode', icon: '🤖', theme: '#6366f1' },
              { label: 'Manual mode', icon: '🕹️', theme: '#10b981' },
            ].map((m) => (
              <div key={m.label} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '12px', padding: '10px 20px',
                borderRadius: '100px',
                background: 'white',
                border: `1px solid var(--border)`,
                color: 'var(--text)',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)',
              }}>
                <span style={{ background: m.theme + '15', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {m.icon}
                </span>
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Level Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {LEVELS.map((level, i) => (
            <LevelCard
              key={level.id}
              level={level}
              index={i}
              onClick={() => navigate(`/play/${level.id}`)}
            />
          ))}
        </div>

        {/* Simple Footer */}
        <footer style={{ marginTop: '100px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em', marginBottom: '8px' }}>
            Husaamuddin Ahmed | S20240010147 | UG-2 CSE | IIIT Sri City
          </p>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            CFG ↔ PDA Equivalence Simulator
          </p>
        </footer>
      </div>
    </div>
  );
}
