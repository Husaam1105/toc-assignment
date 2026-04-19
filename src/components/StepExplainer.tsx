import React from 'react';
import type { SimAction } from '../engine/types';
import { getStepExplanation } from '../engine/simulator';

interface StepExplainerProps {
  action: SimAction | null;
  stepNum: number;
  totalSteps: number;
}

export default function StepExplainer({ action, stepNum, totalSteps }: StepExplainerProps) {
  if (!action) return null;

  let icon = '💡';
  let accentColor = 'var(--accent)';
  let bg = 'var(--accent-light)';
  let borderColor = 'var(--accent)';

  if (action.type === 'expand') {
    icon = '↳'; accentColor = 'var(--var-color)'; bg = 'var(--var-bg)'; borderColor = 'var(--var-border)';
  } else if (action.type === 'match') {
    if (action.sym === '$' || action.sym === 'e') {
      icon = '↪'; accentColor = 'var(--text-muted)'; bg = 'var(--surface-2)'; borderColor = 'var(--border-strong)';
    } else {
      icon = '✓'; accentColor = 'var(--green)'; bg = 'var(--green-light)'; borderColor = 'var(--green-border)';
    }
  } else if (action.type === 'accept') {
    icon = '🎉'; accentColor = 'var(--green)'; bg = 'var(--green-light)'; borderColor = 'var(--green-border)';
  } else if (action.type === 'setup') {
    icon = '⚙'; accentColor = 'var(--text-muted)'; bg = 'var(--surface-2)'; borderColor = 'var(--border-strong)';
  }

  const explanation = getStepExplanation(action);

  return (
    <div style={{
      background: bg,
      border: `1.5px solid ${borderColor}`,
      borderRadius: 'var(--radius)',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        fontSize: '16px',
        width: '26px',
        height: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        borderRadius: '50%',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
        fontFamily: 'var(--font-ui)',
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: accentColor,
          marginBottom: '3px',
        }}>
          {action.type === 'setup' ? 'Initialize' : action.type.charAt(0).toUpperCase() + action.type.slice(1)}
          {totalSteps > 0 && (
            <span style={{ color: 'var(--text-subtle)', marginLeft: '8px', fontWeight: 500 }}>
              Step {stepNum} / {totalSteps}
            </span>
          )}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.5 }}>
          {explanation}
        </div>
      </div>
    </div>
  );
}
