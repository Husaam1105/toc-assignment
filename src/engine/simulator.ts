import type { CFGGrammar, SimAction, TreeNodeData } from './types';

interface StackItem {
  sym: string;
  id: number;
}

export function solveString(cfg: CFGGrammar, inputStr: string): SimAction[] | null {
  let solution: SimAction[] | null = null;
  let nodeIdCounter = 0;

  function dfs(inIdx: number, stack: StackItem[], steps: SimAction[]): void {
    if (solution) return;
    if (stack.length === 0) {
      if (inIdx === inputStr.length) {
        solution = [...steps, { type: 'accept' }];
      }
      return;
    }

    const top = stack[stack.length - 1];

    if (top.sym === '$') {
      if (inIdx === inputStr.length) {
        dfs(inIdx, stack.slice(0, -1), [...steps, { type: 'match', sym: '$' }]);
      }
      return;
    }

    if (top.sym === 'e') {
      dfs(inIdx, stack.slice(0, -1), [...steps, { type: 'match', sym: 'e' }]);
      return;
    }

    if (cfg.terminals.has(top.sym) || cfg.isTerminal(top.sym)) {
      if (inIdx < inputStr.length && inputStr[inIdx] === top.sym) {
        dfs(inIdx + 1, stack.slice(0, -1), [...steps, { type: 'match', sym: top.sym }]);
      }
      return;
    }

    if (cfg.variables.has(top.sym) && cfg.rules[top.sym]) {
      for (const prod of cfg.rules[top.sym]) {
        const nextIds: number[] = [];
        const newStack = stack.slice(0, -1);
        for (let i = prod.length - 1; i >= 0; i--) {
          nodeIdCounter++;
          newStack.push({ sym: prod[i], id: nodeIdCounter });
          nextIds.unshift(nodeIdCounter);
        }
        dfs(inIdx, newStack, [
          ...steps,
          { type: 'expand', A: top.sym, rule: prod, targetId: top.id, nextIds },
        ]);
        if (solution) return;
      }
    }
  }

  dfs(
    0,
    [{ sym: '$', id: -1 }, { sym: cfg.startSymbol, id: 0 }],
    [{ type: 'setup', startObj: { sym: cfg.startSymbol, id: 0 } }]
  );

  return solution;
}

export function replayToStep(
  path: SimAction[],
  targetIndex: number,
  inputStr: string
): {
  stack: StackItem[];
  treeRoot: TreeNodeData | null;
  inputIdx: number;
} {
  let stack: StackItem[] = [];
  let treeRoot: TreeNodeData | null = null;
  let inputIdx = 0;

  function findNode(root: TreeNodeData | null, id: number): TreeNodeData | null {
    if (!root) return null;
    if (root.id === id) return root;
    for (const c of root.children) {
      const r = findNode(c, id);
      if (r) return r;
    }
    return null;
  }

  for (let i = 0; i <= targetIndex; i++) {
    const action = path[i];

    if (action.type === 'setup') {
      stack = [{ sym: '$', id: -1 }, action.startObj];
      treeRoot = { symbol: action.startObj.sym, id: action.startObj.id, children: [], expanded: false };
    } else if (action.type === 'expand') {
      stack.pop();
      for (let j = action.rule.length - 1; j >= 0; j--) {
        stack.push({ sym: action.rule[j], id: action.nextIds[j] });
      }
      const node = findNode(treeRoot, action.targetId);
      if (node) {
        node.children = action.rule.map((sym, idx) => ({
          symbol: sym,
          id: action.nextIds[idx],
          children: [],
          expanded: false,
        }));
        node.expanded = true;
      }
    } else if (action.type === 'match') {
      stack.pop();
      if (action.sym !== 'e' && action.sym !== '$') {
        inputIdx++;
      }
    }
  }

  return { stack, treeRoot, inputIdx };
}

export function generateSamples(cfg: CFGGrammar, count = 6): string[] {
  const samples: string[] = [];
  const maxDepth = 14;

  function generate(stack: string[], depth: number, str: string): void {
    if (samples.length >= count) return;
    if (stack.length === 0) {
      if (!samples.includes(str)) samples.push(str);
      return;
    }
    if (depth > maxDepth) return;
    const sym = stack[0];
    const rest = stack.slice(1);
    if (cfg.terminals.has(sym) || cfg.isTerminal(sym)) {
      generate(rest, depth + 1, str + sym);
    } else if (sym === 'e') {
      generate(rest, depth + 1, str);
    } else if (cfg.rules[sym]) {
      const rules = [...cfg.rules[sym]].sort(() => 0.5 - Math.random());
      for (const prod of rules) {
        generate([...prod, ...rest], depth + 1, str);
        if (samples.length >= count) return;
      }
    }
  }

  generate([cfg.startSymbol], 0, '');
  return samples;
}

export function getStepExplanation(action: SimAction): string {
  switch (action.type) {
    case 'setup':
      return `Push start symbol \u2018${action.startObj.sym}\u2019 and end marker \u2018$\u2019 onto the stack. Move to loop state q1.`;
    case 'expand': {
      const rhs = action.rule[0] === 'e' ? 'ε' : action.rule.join(' ');
      return `Expand \u2018${action.A}\u2019 → \u2018${rhs}\u2019. Pop ${action.A} from the stack, push ${rhs === 'ε' ? 'nothing (ε production)' : rhs}.`;
    }
    case 'match':
      if (action.sym === '$') return `End marker $ reached. All input consumed. Move to accept state q_acc.`;
      if (action.sym === 'e') return `ε on top of stack. Pop it silently. No input consumed.`;
      return `Match \u2018${action.sym}\u2019. Read \u2018${action.sym}\u2019 from input and pop \u2018${action.sym}\u2019 from stack.`;
    case 'accept':
      return `String accepted! All input consumed and stack is empty. Parse successful.`;
    default:
      return '';
  }
}
