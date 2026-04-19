import type { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 'anbn',
    name: 'aⁿbⁿ',
    subtitle: 'Equal a\'s and b\'s',
    grammar: 'S -> a S b | e',
    examples: ['ab', 'aabb', 'aaabbb', 'aaaabbbb'],
    difficulty: 1,
    emoji: '🔵',
    color: '#dbeafe',
  },
  {
    id: 'balanced',
    name: 'Balanced Parens',
    subtitle: 'Matching parentheses',
    grammar: 'S -> ( S ) S | e',
    examples: ['()', '(())', '()()', '((()))'],
    difficulty: 2,
    emoji: '🟣',
    color: '#ede9fe',
  },
  {
    id: 'palindrome',
    name: 'Even Palindromes',
    subtitle: 'Reads same forwards & backwards',
    grammar: 'S -> a S a | b S b | e',
    examples: ['aa', 'abba', 'baab', 'aabbaa'],
    difficulty: 2,
    emoji: '🟡',
    color: '#fef9c3',
  },
  {
    id: 'wcwr',
    name: 'wcwᴿ',
    subtitle: 'Marked palindrome with c',
    grammar: 'S -> a S a | b S b | c',
    examples: ['c', 'aca', 'bcb', 'abcba'],
    difficulty: 3,
    emoji: '🟢',
    color: '#dcfce7',
  },
  {
    id: 'custom',
    name: 'Custom Grammar',
    subtitle: 'Write your own CFG',
    grammar: 'S -> a S b | e',
    examples: [],
    difficulty: 1,
    emoji: '✏️',
    color: '#f3f4f6',
  },
];

export function getLevelById(id: string): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}
