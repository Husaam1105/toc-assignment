import React from 'react';
import type { SimAction } from '../engine/types';

type PDAState = 'q0' | 'q1' | 'qaccept' | null;

interface PDADiagramProps {
  activeState: PDAState;
  startSymbol: string;
  currentAction?: SimAction | null;
}

export default function PDADiagram({ activeState, startSymbol, currentAction }: PDADiagramProps) {
  const W = 300;
  const H = 160;

  const states = [
    { id: 'q0',      label: 'q0',    sub: 'start',  cx: 60,  cy: 100 },
    { id: 'q1',      label: 'q1',    sub: 'loop',   cx: 155, cy: 100 },
    { id: 'qaccept', label: 'q_acc', sub: 'accept', cx: 250, cy: 100 },
  ];
  const r = 28;

  let activeEdge: 'start' | 'loop' | 'accept' | null = null;
  let loopLabel = 'ε,A→γ | a,a→ε';
  let startLabel = `ε,ε→${startSymbol}$`;
  let acceptLabel = 'ε,$→ε';

  if (currentAction) {
    if (currentAction.type === 'setup') {
      activeEdge = 'start';
    } else if (currentAction.type === 'match' && currentAction.sym === '$') {
      activeEdge = 'accept';
    } else if (currentAction.type === 'expand') {
      activeEdge = 'loop';
      const rhs = currentAction.rule[0] === 'e' ? 'ε' : currentAction.rule.join('');
      loopLabel = `ε,${currentAction.A}→${rhs}`;
    } else if (currentAction.type === 'match') {
      activeEdge = 'loop';
      const s = currentAction.sym === 'e' ? 'ε' : currentAction.sym;
      loopLabel = currentAction.sym === 'e' ? `ε,ε→ε` : `${s},${s}→ε`;
    }
  }

  function stateStyle(id: string) {
    const isActive = activeState === id;
    return {
      fill: isActive ? 'var(--accent)' : 'white',
      stroke: isActive ? 'var(--accent)' : 'var(--border-strong)',
      strokeWidth: 2,
    };
  }
  function textStyle(id: string) {
    return {
      fill: activeState === id ? 'white' : 'var(--text-muted)',
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      fontWeight: '600',
    };
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '8px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', marginBottom: '6px' }}>
        PDA State Machine
      </div>
      <style>{`
        @keyframes popText {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
      <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--border-strong)" />
          </marker>
          <marker id="arrowhead-active" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--accent)" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* q0 → q1 */}
        <line x1={60+r} y1={100} x2={155-r-2} y2={100}
          stroke={activeEdge === 'start' ? 'var(--accent)' : 'var(--border-strong)'} 
          strokeWidth={activeEdge === 'start' ? "2.5" : "1.5"} markerEnd={activeEdge === 'start' ? 'url(#arrowhead-active)' : 'url(#arrowhead)'} 
          style={{ transition: 'all 0.3s ease' }} />
        <text x={(60+155)/2} y={88} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: activeEdge === 'start' ? '12px' : '10px', fontWeight: activeEdge === 'start' ? 700 : 500, fill: activeEdge === 'start' ? 'var(--accent)' : 'var(--text-subtle)', transition: 'all 0.3s ease', transformOrigin: `${(60+155)/2}px 88px`, animation: activeEdge === 'start' ? 'popText 0.4s ease' : 'none' }}>
          {startLabel}
        </text>

        {/* Self-loop on q1 */}
        <path d={`M${155-18},${100-r} C${155-50},${100-95} ${155+50},${100-95} ${155+18},${100-r}`}
          fill="none" stroke={activeEdge === 'loop' ? 'var(--accent)' : 'var(--border-strong)'} 
          strokeWidth={activeEdge === 'loop' ? "2.5" : "1.5"} markerEnd={activeEdge === 'loop' ? 'url(#arrowhead-active)' : 'url(#arrowhead)'} 
          style={{ transition: 'all 0.3s ease' }} />
        <text x={155} y={15} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: activeEdge === 'loop' ? '12px' : '10px', fontWeight: activeEdge === 'loop' ? 700 : 500, fill: activeEdge === 'loop' ? 'var(--accent)' : 'var(--text-subtle)', transition: 'all 0.3s ease', transformOrigin: `155px 15px`, animation: activeEdge === 'loop' ? 'popText 0.4s ease' : 'none' }}>
          {loopLabel}
        </text>

        {/* q1 → q_acc */}
        <line x1={155+r} y1={100} x2={250-r-2} y2={100}
          stroke={activeEdge === 'accept' ? 'var(--accent)' : 'var(--border-strong)'} 
          strokeWidth={activeEdge === 'accept' ? "2.5" : "1.5"} markerEnd={activeEdge === 'accept' ? 'url(#arrowhead-active)' : 'url(#arrowhead)'} 
          style={{ transition: 'all 0.3s ease' }} />
        <text x={(155+250)/2} y={88} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: activeEdge === 'accept' ? '12px' : '10px', fontWeight: activeEdge === 'accept' ? 700 : 500, fill: activeEdge === 'accept' ? 'var(--accent)' : 'var(--text-subtle)', transition: 'all 0.3s ease', transformOrigin: `${(155+250)/2}px 88px`, animation: activeEdge === 'accept' ? 'popText 0.4s ease' : 'none' }}>
          {acceptLabel}
        </text>

        {/* Animated Token representing the action */}
        {activeEdge && currentAction && (
          <circle key={JSON.stringify(currentAction) + Math.random()} r="4" fill="var(--accent)" filter="url(#glow)">
            <animateMotion 
              dur="0.5s" 
              repeatCount="1" 
              fill="freeze"
              path={
                activeEdge === 'start' ? `M ${60+r} 100 L ${155-r-3} 100` :
                activeEdge === 'accept' ? `M ${155+r} 100 L ${250-r-3} 100` :
                `M${155-18},${100-r} C${155-50},${100-95} ${155+50},${100-95} ${155+18},${100-r}`
              }
            />
            <animate attributeName="opacity" values="0;1;1;0" keyTimes="0; 0.1; 0.9; 1" dur="0.5s" repeatCount="1" fill="freeze" />
          </circle>
        )}

        {/* State circles */}
        {states.map((s) => {
          const isActive = activeState === s.id;
          return (
            <g key={s.id} style={{ cursor: 'pointer' }} 
              onMouseEnter={(e) => { (e.currentTarget as any).style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))'; }}
              onMouseLeave={(e) => { (e.currentTarget as any).style.filter = 'none'; }}
            >
              <circle cx={s.cx} cy={s.cy} r={r} {...stateStyle(s.id)} style={{ transition: 'all 0.3s ease' }} />
              {s.id === 'qaccept' && (
                <circle cx={s.cx} cy={s.cy} r={r-4}
                  fill="none" stroke={isActive ? 'white' : 'var(--border-strong)'}
                  strokeWidth="1.5" style={{ transition: 'all 0.3s ease' }} />
              )}
            <text x={s.cx} y={s.cy + 1} textAnchor="middle" dominantBaseline="middle" {...textStyle(s.id)}>
              {s.label}
            </text>
            <text x={s.cx} y={s.cy + r + 12} textAnchor="middle"
              style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', fill: 'var(--text-subtle)' }}>
              {s.sub}
            </text>
          </g>
          );
        })}
      </svg>
    </div>
  );
}
