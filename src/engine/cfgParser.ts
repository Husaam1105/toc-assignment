import type { CFGGrammar } from './types';

export function parseCFGText(text: string): CFGGrammar {
  const rules: Record<string, string[][]> = {};
  const variables = new Set<string>();
  const terminals = new Set<string>();
  let startSymbol = 'S';

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('//'));

  if (lines.length === 0) {
    return makeCFG(rules, variables, terminals, startSymbol);
  }

  // Pass 1: identify variables (left-hand sides)
  lines.forEach((line) => {
    const parts = line.split('->').map((p) => p.trim());
    if (parts.length === 2 && parts[0]) variables.add(parts[0]);
  });

  // Pass 2: build rules
  let isFirst = true;
  lines.forEach((line) => {
    const parts = line.split('->').map((p) => p.trim());
    if (parts.length !== 2) return;
    const [lhs, rhsStr] = parts;
    if (isFirst) {
      startSymbol = lhs;
      isFirst = false;
    }
    if (!rules[lhs]) rules[lhs] = [];

    rhsStr
      .split('|')
      .map((s) => s.trim())
      .forEach((alt) => {
        const symbols = alt.split(/\s+/).filter(Boolean);
        const prod: string[] = [];
        symbols.forEach((sym) => {
          const isEps = sym === 'e' || sym === 'epsilon' || sym === 'ε';
          prod.push(isEps ? 'e' : sym);
          if (!isEps && !variables.has(sym)) terminals.add(sym);
        });
        rules[lhs].push(prod);
      });
  });

  return makeCFG(rules, variables, terminals, startSymbol);
}

function makeCFG(
  rules: Record<string, string[][]>,
  variables: Set<string>,
  terminals: Set<string>,
  startSymbol: string
): CFGGrammar {
  return {
    rules,
    variables,
    terminals,
    startSymbol,
    isTerminal(sym: string): boolean {
      if (sym === 'e' || sym === 'epsilon' || sym === 'ε') return false;
      return !variables.has(sym);
    },
  };
}

export function validateCFG(cfg: CFGGrammar): string | null {
  const generating = new Set<string>();
  
  let changed = true;
  while (changed) {
    changed = false;
    for (const v of cfg.variables) {
      if (!generating.has(v)) {
        if (!cfg.rules[v]) continue;
        for (const prod of cfg.rules[v]) {
          let allGen = true;
          for (const sym of prod) {
            if (sym !== 'e' && !cfg.terminals.has(sym) && !generating.has(sym)) {
              allGen = false;
              break;
            }
          }
          if (allGen) {
            generating.add(v);
            changed = true;
            break;
          }
        }
      }
    }
  }

  if (!generating.has(cfg.startSymbol)) {
    return `Start symbol '${cfg.startSymbol}' can never derive a finite string (missing base cases).`;
  }

  return null;
}

export function buildPDATransitions(cfg: CFGGrammar) {
  const transitions = [];

  // Init
  transitions.push({
    id: 'tr-init',
    type: 'init' as const,
    label: `δ(q0, ε, ε) → (q1, ${cfg.startSymbol}$)`,
  });

  // Expand transitions
  let idx = 0;
  for (const v of cfg.variables) {
    if (!cfg.rules[v]) continue;
    for (const prod of cfg.rules[v]) {
      const rhs = prod[0] === 'e' ? 'ε' : prod.join(' ');
      transitions.push({
        id: `tr-exp-${idx++}`,
        type: 'expand' as const,
        label: `δ(q1, ε, ${v}) → (q1, ${rhs})`,
        A: v,
        rule: prod,
      });
    }
  }

  // Match transitions
  for (const t of cfg.terminals) {
    transitions.push({
      id: `tr-match-${t}`,
      type: 'match' as const,
      label: `δ(q1, ${t}, ${t}) → (q1, ε)`,
      sym: t,
    });
  }

  // Accept
  transitions.push({
    id: 'tr-accept',
    type: 'accept' as const,
    label: `δ(q1, ε, $) → (q_acc, ε)`,
  });

  return transitions;
}
