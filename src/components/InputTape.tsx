import React from 'react';

interface InputTapeProps {
  input: string;
  currentIdx: number;
}

export default function InputTape({ input, currentIdx }: InputTapeProps) {
  if (!input && input !== '') return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      padding: '12px 16px',
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      flexWrap: 'wrap',
      minHeight: '60px',
    }}>
      {input.length === 0 ? (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '13px' }}>
          ε (empty string)
        </span>
      ) : (
        <>
          {input.split('').map((ch, i) => {
            const consumed = i < currentIdx;
            const active   = i === currentIdx;
            return (
              <div
                key={i}
                style={{
                  width: '36px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: '16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid',
                  transition: 'all 0.2s ease',
                  borderColor: consumed ? 'transparent'
                    : active ? 'var(--accent)'
                    : 'var(--border)',
                  background: consumed ? 'transparent'
                    : active ? 'var(--accent-light)'
                    : 'var(--surface-2)',
                  color: consumed ? 'var(--text-subtle)'
                    : active ? 'var(--accent)'
                    : 'var(--text)',
                  textDecoration: consumed ? 'line-through' : 'none',
                  transform: active ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: active ? '0 4px 12px var(--accent-ring)' : 'none',
                }}
              >
                {ch}
              </div>
            );
          })}
          {/* Read head arrow */}
          {currentIdx < input.length && (
            <div style={{
              position: 'absolute',
              display: 'none', // subtle enough without extra arrow
            }} />
          )}
        </>
      )}
    </div>
  );
}
