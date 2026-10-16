import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from '../hooks/useMemoryGame';

describe('useMemoryGame State Machine & Concurrency Safeguards', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('initializes with 4x4 grid (8 pairs, 16 cards) and baseline idle state', () => {
    const { result } = renderHook(() => useMemoryGame({ initialDifficulty: 'standard', initialSeed: 'TEST-SEED-INIT' }));

    expect(result.current.cards.length).toBe(16);
    expect(result.current.currentConfig.pairsCount).toBe(8);
    expect(result.current.currentConfig.rows).toBe(4);
    expect(result.current.currentConfig.cols).toBe(4);
    expect(result.current.moves).toBe(0);
    expect(result.current.completedPairs).toBe(0);
    expect(result.current.status).toBe('idle');
    expect(result.current.isLocked).toBe(false);
    expect(result.current.cards.every((c) => c.status === 'face-down')).toBe(true);
  });

  it('flips first card face-up and transitions status to in_progress', () => {
    const { result } = renderHook(() => useMemoryGame({ initialSeed: 'TEST-FIRST-CLICK' }));

    act(() => {
      result.current.handleCardClick(0);
    });

    expect(result.current.cards[0].status).toBe('face-up');
    expect(result.current.selectedIndices).toEqual([0]);
    expect(result.current.status).toBe('in_progress');
    expect(result.current.moves).toBe(0); // Moves only increment when pair is attempted
  });

  it('safely ignores repeat clicks on the already revealed card', () => {
    const { result } = renderHook(() => useMemoryGame({ initialSeed: 'TEST-REPEAT-CLICK' }));

    act(() => {
      result.current.handleCardClick(0);
    });
    expect(result.current.cards[0].status).toBe('face-up');
    expect(result.current.moves).toBe(0);

    // Repeat click on card 0
    act(() => {
      result.current.handleCardClick(0);
    });

    // Card should still be face-up, moves still 0, selectedIndices still [0]
    expect(result.current.cards[0].status).toBe('face-up');
    expect(result.current.moves).toBe(0);
    expect(result.current.selectedIndices).toEqual([0]);
  });

  it('correctly resolves a matching pair and marks both as matched', () => {
    const { result } = renderHook(() => useMemoryGame({ initialSeed: 'TEST-MATCH-PAIR' }));

    const targetPairId = result.current.cards[0].pairId;
    const secondIndex = result.current.cards.findIndex((c, i) => i !== 0 && c.pairId === targetPairId);

    expect(secondIndex).toBeGreaterThan(0);

    // Click first card
    act(() => {
      result.current.handleCardClick(0);
    });
    // Click second matching card
    act(() => {
      result.current.handleCardClick(secondIndex);
    });

    expect(result.current.moves).toBe(1);
    expect(result.current.completedPairs).toBe(1);
    expect(result.current.cards[0].status).toBe('matched');
    expect(result.current.cards[secondIndex].status).toBe('matched');
    expect(result.current.selectedIndices).toEqual([]);
    expect(result.current.isLocked).toBe(false);
  });

  it('safely ignores clicks on already matched cards', () => {
    const { result } = renderHook(() => useMemoryGame({ initialSeed: 'TEST-CLICK-MATCHED' }));

    const targetPairId = result.current.cards[0].pairId;
    const secondIndex = result.current.cards.findIndex((c, i) => i !== 0 && c.pairId === targetPairId);

    // Match them
    act(() => {
      result.current.handleCardClick(0);
      result.current.handleCardClick(secondIndex);
    });

    expect(result.current.completedPairs).toBe(1);
    expect(result.current.moves).toBe(1);

    // Click the matched card 0 again
    act(() => {
      result.current.handleCardClick(0);
    });

    // Moves must not increment, card remains matched
    expect(result.current.moves).toBe(1);
    expect(result.current.cards[0].status).toBe('matched');
    expect(result.current.selectedIndices).toEqual([]);
  });

  it('locks the board on mismatch and prevents a third selection while resolving', () => {
    const { result } = renderHook(() => useMemoryGame({ initialSeed: 'TEST-MISMATCH-LOCK' }));

    // Find two distinct non-matching cards
    const idx1 = 0;
    const idx2 = result.current.cards.findIndex((c) => c.pairId !== result.current.cards[0].pairId);
    const idx3 = result.current.cards.findIndex((_, i) => i !== idx1 && i !== idx2);

    // Reveal card 1
    act(() => {
      result.current.handleCardClick(idx1);
    });
    // Reveal card 2 (mismatch)
    act(() => {
      result.current.handleCardClick(idx2);
    });

    // Board MUST be locked now!
    expect(result.current.isLocked).toBe(true);
    expect(result.current.moves).toBe(1);
    expect(result.current.cards[idx1].status).toBe('face-up');
    expect(result.current.cards[idx2].status).toBe('face-up');

    // ATTEMPT THIRD SELECTION WHILE LOCKED:
    act(() => {
      result.current.handleCardClick(idx3);
    });

    // Card 3 MUST NOT be revealed!
    expect(result.current.cards[idx3].status).toBe('face-down');
    expect(result.current.selectedIndices).toEqual([idx1, idx2]);

    // Fast-forward timeout to resolve mismatch
    act(() => {
      vi.advanceTimersByTime(result.current.currentConfig.mismatchDelayMs + 50);
    });

    // Now board must be unlocked and cards flipped back
    expect(result.current.isLocked).toBe(false);
    expect(result.current.cards[idx1].status).toBe('face-down');
    expect(result.current.cards[idx2].status).toBe('face-down');
    expect(result.current.selectedIndices).toEqual([]);
  });

  it('cancels pending mismatch timer on restart so old timer cannot corrupt new game', () => {
    const { result } = renderHook(() => useMemoryGame({ initialSeed: 'TEST-RESTART-TIMER' }));

    const idx1 = 0;
    const idx2 = result.current.cards.findIndex((c) => c.pairId !== result.current.cards[0].pairId);

    // Trigger mismatch
    act(() => {
      result.current.handleCardClick(idx1);
      result.current.handleCardClick(idx2);
    });

    expect(result.current.isLocked).toBe(true);
    expect(result.current.moves).toBe(1);

    // User triggers restart before mismatch delay expires
    act(() => {
      vi.advanceTimersByTime(200); // partial delay
      result.current.restart('NEW-SESSION-SEED');
    });

    // In new game: moves must be 0, board unlocked, fresh deck
    expect(result.current.moves).toBe(0);
    expect(result.current.isLocked).toBe(false);
    expect(result.current.status).toBe('idle');

    // In the new game, reveal card 0
    act(() => {
      result.current.handleCardClick(0);
    });
    expect(result.current.cards[0].status).toBe('face-up');

    // Advance time past the original game's timeout
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Card 0 in new game MUST STILL BE FACE-UP (not flipped down by old timeout!)
    expect(result.current.cards[0].status).toBe('face-up');
  });

  it('triggers win state and calculates performance-driven adaptation when all pairs matched', () => {
    const onWinMock = vi.fn();
    const { result } = renderHook(() => useMemoryGame({ initialSeed: 'TEST-WIN-CONDITION', onWin: onWinMock }));

    const pairsCount = result.current.currentConfig.pairsCount;

    // Deterministically find and match all pairs
    const matchedPairIds = new Set<string>();

    for (let i = 0; i < result.current.cards.length; i++) {
      const card = result.current.cards[i];
      if (matchedPairIds.has(card.pairId)) continue;

      const partnerIdx = result.current.cards.findIndex((c, idx) => idx !== i && c.pairId === card.pairId);
      if (partnerIdx !== -1) {
        act(() => {
          result.current.handleCardClick(i);
          result.current.handleCardClick(partnerIdx);
        });
        matchedPairIds.add(card.pairId);
      }
    }

    expect(result.current.completedPairs).toBe(pairsCount);
    expect(result.current.status).toBe('won');
    expect(result.current.adaptationResult).not.toBeNull();
    expect(onWinMock).toHaveBeenCalledTimes(1);
    expect(result.current.adaptationResult?.action).toBeDefined();
    expect(result.current.adaptationResult?.reason).toBeDefined();
  });
});
