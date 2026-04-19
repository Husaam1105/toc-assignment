import React from 'react';
import type { CFGGrammar } from '../engine/types';

interface StackItem {
  sym: string;
  id: number;
}

interface StackDisplayProps {
  stack: Array<StackItem | string>;
  variables: Set<string>;
}

export default function StackDisplay({ stack, variables }: StackDisplayProps) {
  const items = [...stack].reverse(); // top of stack first visually

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minWidth: '90px',
    }}>
      {/* Header */}
      <div style={{
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-subtle)',
        textAlign: 'center',
        padding: '6px 8px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderBottom: 'none',
        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
      }}>
        Stack
      </div>

      {/* Stack contents */}
      <div style={{
        flex: 1,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
        padding: '8px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {items.map((item, i) => {
          const sym = typeof item === 'string' ? item : item.sym;
          const isTop = i === 0;
          const disp = sym === 'e' ? 'ε' : sym;

          let bg = 'var(--surface-2)';
          let border = 'var(--border)';
          let color = 'var(--text-muted)';

          if (sym === '$') {
            bg = 'var(--surface-3)'; border = 'var(--border-strong)'; color = 'var(--text-subtle)';
          } else if (variables.has(sym)) {
            bg = 'var(--var-bg)'; border = 'var(--var-border)'; color = 'var(--var-color)';
          } else if (sym !== 'e') {
            bg = 'var(--term-bg)'; border = 'var(--term-border)'; color = 'var(--term-color)';
          }

          return (
            <div
              key={`${sym}-${i}`}
              className="pop-in"
              style={{
                padding: '6px',
                textAlign: 'center',
                background: isTop ? 'var(--accent-light)' : bg,
                border: `1.5px solid ${isTop ? 'var(--accent)' : border}`,
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '13px',
                color: isTop ? 'var(--accent)' : color,
                boxShadow: isTop ? '0 2px 8px var(--accent-ring)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {disp}
            </div>
          );
        })}

        {/* Stack bottom */}
        <div style={{
          height: '3px',
          background: 'var(--border-strong)',
          borderRadius: '2px',
          marginTop: 'auto',
          flexShrink: 0,
        }} />
      </div>
    </div>
  );
}
