import { AdaptationResult, DifficultyConfig, DifficultyId, RuleEvaluation } from '../types';

export const DIFFICULTY_CONFIGS: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: 'Casual',
    tagline: 'Relaxed 3×4 grid for quick pattern recognition',
    rows: 3,
    cols: 4,
    pairsCount: 6,
    mismatchDelayMs: 1100,
    targetMoves: 9,        // Optimal: 6, threshold: 9
    targetTimeSec: 22,
    demoteMoves: 16,       // Benchmark for base tier coaching
    demoteTimeSec: 45,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    accentColor: 'emerald',
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    tagline: 'Baseline 4×4 grid (8 pairs) evaluation',
    rows: 4,
    cols: 4,
    pairsCount: 8,
    mismatchDelayMs: 900,
    targetMoves: 14,       // Optimal: 8, threshold <= 14 (<= 1.75x optimal)
    targetTimeSec: 32,
    demoteMoves: 22,       // Threshold >= 22 (>= 2.75x optimal)
    demoteTimeSec: 65,
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    accentColor: 'indigo',
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    tagline: 'Expanded 4×5 grid (10 pairs) with faster pace',
    rows: 4,
    cols: 5,
    pairsCount: 10,
    mismatchDelayMs: 800,
    targetMoves: 18,       // Optimal: 10, threshold <= 18
    targetTimeSec: 45,
    demoteMoves: 28,
    demoteTimeSec: 90,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    accentColor: 'purple',
  },
  master: {
    id: 'master',
    name: 'Master',
    tagline: 'Complex 6×6 grid (18 pairs) ultimate challenge',
    rows: 6,
    cols: 6,
    pairsCount: 18,
    mismatchDelayMs: 700,
    targetMoves: 32,       // Optimal: 18, threshold <= 32
    targetTimeSec: 95,
    demoteMoves: 50,
    demoteTimeSec: 150,
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    accentColor: 'rose',
  },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ['easy', 'standard', 'expert', 'master'];

/**
 * Calculates cognitive efficiency rating:
 * Optimal moves = number of pairs.
 * Efficiency % = (optimal / actual) * 100
 */
export function calculateEfficiency(moves: number, pairsCount: number): number {
  if (moves <= 0 || pairsCount <= 0) return 0;
  return Math.min(100, Math.round((pairsCount / moves) * 100));
}

/**
 * Accuracy percentage: (completedPairs / moves) * 100
 */
export function calculateAccuracy(completedPairs: number, moves: number): number {
  if (moves <= 0) return 0;
  return Math.min(100, Math.round((completedPairs / moves) * 100));
}

/**
 * Evaluates performance against documented thresholds and provides an explainable adaptation result.
 */
export function evaluateAdaptation(
  currentDiffId: DifficultyId,
  moves: number,
  timeSeconds: number
): AdaptationResult {
  const currentConfig = DIFFICULTY_CONFIGS[currentDiffId];
  const currentIndex = DIFFICULTY_ORDER.indexOf(currentDiffId);
  const efficiency = calculateEfficiency(moves, currentConfig.pairsCount);
  const accuracy = calculateAccuracy(currentConfig.pairsCount, moves);

  const evaluations: RuleEvaluation[] = [];

  // Check Promotion Rule:
  // Must beat BOTH move threshold and time threshold, AND not be at max level
  const movesPromoteMet = moves <= currentConfig.targetMoves;
  const timePromoteMet = timeSeconds <= currentConfig.targetTimeSec;
  const canPromote = currentIndex < DIFFICULTY_ORDER.length - 1;

  evaluations.push({
    ruleName: 'Move Efficiency Target',
    description: `Requires ≤ ${currentConfig.targetMoves} moves (optimal is ${currentConfig.pairsCount})`,
    threshold: `≤ ${currentConfig.targetMoves} moves`,
    actual: `${moves} moves`,
    met: movesPromoteMet,
    influence: movesPromoteMet ? 'promote' : 'neutral',
  });

  evaluations.push({
    ruleName: 'Completion Velocity Target',
    description: `Requires completion within ≤ ${currentConfig.targetTimeSec}s`,
    threshold: `≤ ${currentConfig.targetTimeSec}s`,
    actual: `${timeSeconds.toFixed(1)}s`,
    met: timePromoteMet,
    influence: timePromoteMet ? 'promote' : 'neutral',
  });

  // Check Demotion Rule:
  // High moves OR excessive elapsed time, AND not be at min level
  const movesDemoteMet = moves >= currentConfig.demoteMoves;
  const timeDemoteMet = timeSeconds >= currentConfig.demoteTimeSec;
  const canDemote = currentIndex > 0;

  evaluations.push({
    ruleName: 'Cognitive Strain (Moves)',
    description: `Triggers recovery if moves ≥ ${currentConfig.demoteMoves}`,
    threshold: `≥ ${currentConfig.demoteMoves} moves`,
    actual: `${moves} moves`,
    met: movesDemoteMet,
    influence: movesDemoteMet ? 'demote' : 'neutral',
  });

  evaluations.push({
    ruleName: 'Cognitive Strain (Time)',
    description: `Triggers recovery if active time ≥ ${currentConfig.demoteTimeSec}s`,
    threshold: `≥ ${currentConfig.demoteTimeSec}s`,
    actual: `${timeSeconds.toFixed(1)}s`,
    met: timeDemoteMet,
    influence: timeDemoteMet ? 'demote' : 'neutral',
  });

  let action: 'promoted' | 'demoted' | 'maintained' = 'maintained';
  let nextDiffId = currentDiffId;
  let reason = '';
  let detailedReason = '';

  if (canPromote && movesPromoteMet && timePromoteMet) {
    action = 'promoted';
    nextDiffId = DIFFICULTY_ORDER[currentIndex + 1];
    const nextConfig = DIFFICULTY_CONFIGS[nextDiffId];
    reason = `Outstanding cognitive velocity! Completed in ${moves} moves (≤${currentConfig.targetMoves}) and ${timeSeconds.toFixed(1)}s (≤${currentConfig.targetTimeSec}s).`;
    detailedReason = `Both promotion criteria satisfied with ${efficiency}% efficiency. Upgraded to ${nextConfig.name} (${nextConfig.rows}×${nextConfig.cols} grid, ${nextConfig.pairsCount} pairs) to sustain optimal cognitive engagement.`;
  } else if (canDemote && (movesDemoteMet || timeDemoteMet)) {
    action = 'demoted';
    nextDiffId = DIFFICULTY_ORDER[currentIndex - 1];
    const nextConfig = DIFFICULTY_CONFIGS[nextDiffId];
    const trigger = movesDemoteMet && timeDemoteMet
      ? `exceeded both move limit (${moves} ≥ ${currentConfig.demoteMoves}) and time limit (${timeSeconds.toFixed(1)}s ≥ ${currentConfig.demoteTimeSec}s)`
      : movesDemoteMet
      ? `high move count (${moves} ≥ ${currentConfig.demoteMoves})`
      : `extended duration (${timeSeconds.toFixed(1)}s ≥ ${currentConfig.demoteTimeSec}s)`;
    
    reason = `High cognitive load detected: ${trigger}.`;
    detailedReason = `Adjusted downward to ${nextConfig.name} (${nextConfig.rows}×${nextConfig.cols} grid, ${nextConfig.pairsCount} pairs) with a relaxed ${nextConfig.mismatchDelayMs}ms inspection window to rebuild recall confidence.`;
  } else {
    action = 'maintained';
    nextDiffId = currentDiffId;
    if (currentIndex === DIFFICULTY_ORDER.length - 1 && movesPromoteMet && timePromoteMet) {
      reason = `Mastery achieved! You reached peak level with ${moves} moves and ${timeSeconds.toFixed(1)}s.`;
      detailedReason = `All promotion criteria met, but you are already at maximum difficulty (${currentConfig.name}). Maintained at Master tier.`;
    } else if (currentIndex === 0 && (movesDemoteMet || timeDemoteMet)) {
      reason = `Warm-up round in progress. Take your time to memorize positions.`;
      detailedReason = `Performance was below target, but Casual tier is the foundational level. Maintained for further practice.`;
    } else {
      reason = `Balanced session: ${moves} moves and ${timeSeconds.toFixed(1)}s fall within the target stability envelope.`;
      detailedReason = `Performance was steady (moves between ${currentConfig.targetMoves + 1}–${currentConfig.demoteMoves - 1}, time between ${currentConfig.targetTimeSec + 1}s–${currentConfig.demoteTimeSec - 1}s). Retaining current difficulty (${currentConfig.name}) for reinforcement.`;
    }
  }

  return {
    previousDifficulty: currentDiffId,
    nextDifficulty: nextDiffId,
    action,
    reason,
    detailedReason,
    evaluations,
    metrics: {
      moves,
      timeSeconds: parseFloat(timeSeconds.toFixed(1)),
      pairsCount: currentConfig.pairsCount,
      accuracy,
      efficiency,
    },
    timestamp: new Date().toISOString(),
  };
}
