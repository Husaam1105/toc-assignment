import React, { useRef, useLayoutEffect, useState } from 'react';
import type { TreeNodeData, CFGGrammar } from '../engine/types';

interface ParseTreeProps {
  treeRoot: TreeNodeData | null;
  grammar: CFGGrammar;
  activeId?: number;
}

interface NodePos { x: number; y: number; id: number; }

export default function ParseTree({ treeRoot, grammar, activeId }: ParseTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  useLayoutEffect(() => {
    if (!treeRoot || !containerRef.current) { setLines([]); return; }
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLines: typeof lines = [];

    function measureLines(node: TreeNodeData) {
      const parentEl = document.getElementById(`tn-${node.id}`);
      if (!parentEl || !node.children.length) return;
      const pr = parentEl.getBoundingClientRect();
      const pX = pr.left + pr.width / 2 - containerRect.left + containerRef.current!.scrollLeft;
      const pY = pr.top + pr.height     - containerRect.top  + containerRef.current!.scrollTop;

      node.children.forEach((child) => {
        const childEl = document.getElementById(`tn-${child.id}`);
        if (!childEl) return;
        const cr = childEl.getBoundingClientRect();
        const cX = cr.left + cr.width / 2 - containerRect.left + containerRef.current!.scrollLeft;
        const cY = cr.top                   - containerRect.top  + containerRef.current!.scrollTop;
        newLines.push({ x1: pX, y1: pY, x2: cX, y2: cY });
        measureLines(child);
      });
    }

    measureLines(treeRoot);
    setLines(newLines);
  }, [treeRoot, activeId]);

  if (!treeRoot) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        color: 'var(--text-subtle)', fontSize: '13px', boxShadow: 'var(--shadow-sm)',
      }}>
        Parse tree will appear here
      </div>
    );
  }

  function renderNode(node: TreeNodeData): React.ReactNode {
    const isVar = grammar.variables.has(node.symbol);
    const isEps = node.symbol === 'e';
    const isActive = node.id === activeId;
    const disp = isEps ? 'ε' : node.symbol;

    let bg = 'var(--surface-2)';
    let border = 'var(--border-strong)';
    let color = 'var(--text-muted)';

    if (isActive) {
      bg = 'var(--accent-light)'; border = 'var(--accent)'; color = 'var(--accent)';
    } else if (isVar) {
      bg = 'var(--var-bg)'; border = 'var(--var-border)'; color = 'var(--var-color)';
    } else if (!isEps) {
      bg = 'var(--term-bg)'; border = 'var(--term-border)'; color = 'var(--term-color)';
    }

    return (
      <div
        key={node.id}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 6px' }}
      >
        <div
          id={`tn-${node.id}`}
          className={node.expanded ? 'pop-in' : ''}
          style={{
            width: '34px', height: '34px',
            borderRadius: '50%',
            background: bg,
            border: `2px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: '11px',
            color: color,
            zIndex: 2,
            position: 'relative',
            marginBottom: '28px',
            transition: 'all 0.2s ease',
            transform: isActive ? 'scale(1.15)' : 'scale(1)',
            boxShadow: isActive ? '0 0 0 4px var(--accent-ring)' : 'none',
            animation: node.expanded ? 'nodeAppear 0.3s ease' : 'none',
          }}
        >
          {disp}
        </div>
        {node.children.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {node.children.map((c) => renderNode(c))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        position: 'relative',
        overflow: 'auto',
        padding: '20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* SVG lines layer */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
      >
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="var(--border-strong)"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* DOM tree */}
      <div style={{ display: 'flex', justifyContent: 'center', width: 'max-content', minWidth: '100%', position: 'relative', zIndex: 2 }}>
        {renderNode(treeRoot)}
      </div>
    </div>
  );
}
