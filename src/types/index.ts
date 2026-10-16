export type DifficultyId = 'easy' | 'standard' | 'expert' | 'master';

export interface DifficultyConfig {
  id: DifficultyId;
  name: string;
  tagline: string;
  rows: number;
  cols: number;
  pairsCount: number;
  mismatchDelayMs: number;
  targetMoves: number;       // <= this qualifies for promotion
  targetTimeSec: number;     // <= this qualifies for promotion
  demoteMoves: number;       // >= this triggers demotion
  demoteTimeSec: number;     // >= this triggers demotion
  badgeColor: string;
  accentColor: string;
}

export type CardStatus = 'face-down' | 'face-up' | 'matched';

export interface CardItem {
  id: string;          // e.g. "card-0", "card-1"
  pairId: string;      // e.g. "atom", "diamond"
  label: string;       // e.g. "Quantum Atom"
  icon: string;        // identifier for lucide icon
  color: string;       // theme color string
  status: CardStatus;
  isMismatch?: boolean;
  isMatchedFlash?: boolean;
}

export type GameStatus = 'idle' | 'in_progress' | 'paused' | 'won';

export type AdaptationAction = 'promoted' | 'demoted' | 'maintained';

export interface RuleEvaluation {
  ruleName: string;
  description: string;
  threshold: string;
  actual: string;
  met: boolean;
  influence: 'promote' | 'demote' | 'neutral';
}

export interface AdaptationResult {
  previousDifficulty: DifficultyId;
  nextDifficulty: DifficultyId;
  action: AdaptationAction;
  reason: string;
  detailedReason: string;
  evaluations: RuleEvaluation[];
  metrics: {
    moves: number;
    timeSeconds: number;
    pairsCount: number;
    accuracy: number;
    efficiency: number;
  };
  timestamp: string;
}

export interface SessionRecord {
  id: string;
  date: string;
  seed: string;
  difficulty: DifficultyId;
  difficultyName: string;
  gridSize: string;
  moves: number;
  timeSeconds: number;
  completedPairs: number;
  accuracy: number;
  efficiency: number;
  adaptation: AdaptationResult;
}

export interface DemoCheckResult {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  details: string[];
  timestamp?: string;
}
