import { describe, it, expect } from 'vitest';
import {
  evaluateAdaptation,
  calculateEfficiency,
  calculateAccuracy,
  DIFFICULTY_CONFIGS,
} from '../engine/rules';

describe('Documented Rules & Performance Adaptation Engine', () => {
  describe('Cognitive Metrics Calculation', () => {
    it('calculates efficiency percentage correctly based on optimal moves', () => {
      // 8 pairs, optimal = 8 moves
      expect(calculateEfficiency(8, 8)).toBe(100);
      expect(calculateEfficiency(16, 8)).toBe(50);
      expect(calculateEfficiency(32, 8)).toBe(25);
      expect(calculateEfficiency(0, 8)).toBe(0);
    });

    it('calculates accuracy percentage correctly', () => {
      expect(calculateAccuracy(8, 8)).toBe(100);
      expect(calculateAccuracy(8, 16)).toBe(50);
      expect(calculateAccuracy(8, 10)).toBe(80);
    });
  });

  describe('Standard 4x4 Adaptation Thresholds', () => {
    const config = DIFFICULTY_CONFIGS.standard;

    it('promotes to expert when moves <= targetMoves AND time <= targetTimeSec', () => {
      const moves = config.targetMoves; // 14
      const time = config.targetTimeSec; // 32

      const result = evaluateAdaptation('standard', moves, time);

      expect(result.action).toBe('promoted');
      expect(result.previousDifficulty).toBe('standard');
      expect(result.nextDifficulty).toBe('expert');
      expect(result.reason).toContain('Outstanding cognitive velocity');
      expect(result.detailedReason).toContain('Expert');
      expect(result.evaluations.every((e) => e.influence !== 'demote')).toBe(true);
    });

    it('demotes to easy when moves >= demoteMoves', () => {
      const moves = config.demoteMoves; // 22
      const time = 30; // within time limit, but moves exceeded

      const result = evaluateAdaptation('standard', moves, time);

      expect(result.action).toBe('demoted');
      expect(result.previousDifficulty).toBe('standard');
      expect(result.nextDifficulty).toBe('easy');
      expect(result.reason).toContain('High cognitive load detected');
      expect(result.reason).toContain('high move count');
    });

    it('demotes to easy when time >= demoteTimeSec', () => {
      const moves = 16; // within move limit
      const time = config.demoteTimeSec; // 65

      const result = evaluateAdaptation('standard', moves, time);

      expect(result.action).toBe('demoted');
      expect(result.previousDifficulty).toBe('standard');
      expect(result.nextDifficulty).toBe('easy');
      expect(result.reason).toContain('extended duration');
    });

    it('maintains standard when metrics fall in the stability envelope', () => {
      const moves = 16; // > 14 (no promote) and < 22 (no demote)
      const time = 40; // > 32s (no promote) and < 65s (no demote)

      const result = evaluateAdaptation('standard', moves, time);

      expect(result.action).toBe('maintained');
      expect(result.previousDifficulty).toBe('standard');
      expect(result.nextDifficulty).toBe('standard');
      expect(result.reason).toContain('Balanced session');
    });
  });

  describe('Boundary Tier Behavior', () => {
    it('maintains Master tier when promotion criteria met (cannot exceed max tier)', () => {
      const masterConfig = DIFFICULTY_CONFIGS.master;
      const result = evaluateAdaptation('master', masterConfig.targetMoves - 2, masterConfig.targetTimeSec - 10);

      expect(result.action).toBe('maintained');
      expect(result.nextDifficulty).toBe('master');
      expect(result.reason).toContain('Mastery achieved');
    });

    it('maintains Easy tier when demotion criteria met (cannot fall below base tier)', () => {
      const result = evaluateAdaptation('easy', 50, 120);

      expect(result.action).toBe('maintained');
      expect(result.nextDifficulty).toBe('easy');
      expect(result.reason).toContain('Warm-up round in progress');
    });
  });
});
