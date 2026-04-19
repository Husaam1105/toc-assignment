export interface CFGGrammar {
  rules: Record<string, string[][]>;
  variables: Set<string>;
  terminals: Set<string>;
  startSymbol: string;
  isTerminal(sym: string): boolean;
}

export interface SetupAction {
  type: 'setup';
  startObj: { sym: string; id: number };
}

export interface ExpandAction {
  type: 'expand';
  A: string;
  rule: string[];
  targetId: number;
  nextIds: number[];
}

export interface MatchAction {
  type: 'match';
  sym: string;
}

export interface AcceptAction {
  type: 'accept';
}

export type SimAction = SetupAction | ExpandAction | MatchAction | AcceptAction;

export interface TreeNodeData {
  symbol: string;
  id: number;
  children: TreeNodeData[];
  expanded: boolean;
}

export interface SimStepState {
  stack: Array<{ sym: string; id: number } | string>;
  treeRoot: TreeNodeData | null;
  inputIdx: number;
  currentAction: SimAction;
}

export interface Level {
  id: string;
  name: string;
  subtitle: string;
  grammar: string;
  examples: string[];
  difficulty: 1 | 2 | 3;
  emoji: string;
  color: string;
}

export type GameMode = 'auto' | 'manual';

export interface PDATransition {
  id: string;
  type: 'init' | 'expand' | 'match' | 'accept';
  label: string;
  A?: string;
  rule?: string[];
  sym?: string;
}
