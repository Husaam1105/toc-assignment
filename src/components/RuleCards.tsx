import React, { useRef } from 'react';
import type { ExpandAction, SimAction } from '../engine/types';
import type { CFGGrammar } from '../engine/types';

interface RuleCardsProps {
  grammar: CFGGrammar;
  topOfStack: string | null;     // current variable on top of stack
  correctRule: string[] | null;  // the rule in the solution path
  mode: 'auto' | 'manual';
  onRulePick: (rule: string[], isCorrect: boolean) => void;
  disabled: boolean;
}

export default function RuleCards({
  grammar,
  topOfStack,
  correctRule,
  mode,
  onRulePick,
  disabled,
}: RuleCardsProps) {
  if (mode === 'auto' || !topOfStack || !grammar.variables.has(topOfStack)) return null;

  const rules = grammar.rules[topOfStack] || [];

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '12px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '10px',
      }}>
        Which rule should expand{' '}
        <span className="sym-var">{topOfStack}</span>?
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {rules.map((rule, i) => {
          const rhs = rule[0] === 'e' ? 'ε' : rule.join(' ');
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => {
                const isCorrect =
                  correctRule !== null &&
                  JSON.stringify(rule) === JSON.stringify(correctRule);
                onRulePick(rule, isCorrect);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--border)',
                background: 'var(--surface-2)',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => {
                if (!disabled) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-light)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px var(--accent-ring)';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <span className="sym-var">{topOfStack}</span>
              <span style={{ color: 'var(--text-subtle)' }}>→</span>
              {rule[0] === 'e' ? (
                <span className="sym-eps">ε</span>
              ) : (
                rule.map((sym, j) => (
                  <span
                    key={j}
                    className={grammar.variables.has(sym) ? 'sym-var' : 'sym-term'}
                  >
                    {sym}
                  </span>
                ))
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
