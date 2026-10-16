import { useState, useEffect, useRef, useCallback } from 'react';
import { CardItem, DifficultyId, GameStatus, AdaptationResult } from '../types';
import { DIFFICULTY_CONFIGS, evaluateAdaptation } from '../engine/rules';
import { generateDeck } from '../utils/cards';
import { soundManager } from '../utils/sound';
import { saveSessionRecord } from '../utils/storage';

export interface UseMemoryGameProps {
  initialSeed?: string;
  initialDifficulty?: DifficultyId;
  onWin?: (result: AdaptationResult) => void;
}

export function useMemoryGame({
  initialSeed = 'SESSION-4X4-ALPHA',
  initialDifficulty = 'standard',
  onWin,
}: UseMemoryGameProps = {}) {
  const [seed, setSeed] = useState<string>(initialSeed);
  const [difficultyId, setDifficultyId] = useState<DifficultyId>(initialDifficulty);
  
  const initialDeck = generateDeck(DIFFICULTY_CONFIGS[initialDifficulty].pairsCount, initialSeed);
  const [cards, setCards] = useState<CardItem[]>(initialDeck);
  const cardsRef = useRef<CardItem[]>(initialDeck);

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const selectedIndicesRef = useRef<number[]>([]);

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const isLockedRef = useRef<boolean>(false);

  const [moves, setMoves] = useState<number>(0);
  const movesRef = useRef<number>(0);

  const [completedPairs, setCompletedPairs] = useState<number>(0);
  const completedPairsRef = useRef<number>(0);

  const [status, setStatus] = useState<GameStatus>('idle');
  const statusRef = useRef<GameStatus>('idle');

  const [elapsedActiveTime, setElapsedActiveTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [adaptationResult, setAdaptationResult] = useState<AdaptationResult | null>(null);

  // Timer & Generation references to guard against race conditions
  const roundGenRef = useRef<number>(1);
  const pendingMismatchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const currentConfig = DIFFICULTY_CONFIGS[difficultyId];

  // Clean up any pending timeout helper
  const clearPendingMismatch = useCallback(() => {
    if (pendingMismatchTimeoutRef.current !== null) {
      clearTimeout(pendingMismatchTimeoutRef.current);
      pendingMismatchTimeoutRef.current = null;
    }
  }, []);

  // Stop active game timer interval
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Safe restart / new round initialization
  const restart = useCallback((newSeed?: string, newDiffId?: DifficultyId) => {
    // 1. Invalidate any in-flight mismatch callbacks
    roundGenRef.current += 1;
    clearPendingMismatch();
    stopTimer();

    const targetSeed = newSeed !== undefined ? newSeed : seed;
    const targetDiff = newDiffId !== undefined ? newDiffId : difficultyId;

    if (newSeed !== undefined) setSeed(newSeed);
    if (newDiffId !== undefined) setDifficultyId(targetDiff);

    const config = DIFFICULTY_CONFIGS[targetDiff];
    const newDeck = generateDeck(config.pairsCount, targetSeed);

    cardsRef.current = newDeck;
    setCards(newDeck);

    selectedIndicesRef.current = [];
    setSelectedIndices([]);

    isLockedRef.current = false;
    setIsLocked(false);

    movesRef.current = 0;
    setMoves(0);

    completedPairsRef.current = 0;
    setCompletedPairs(0);

    statusRef.current = 'idle';
    setStatus('idle');

    setElapsedActiveTime(0);
    setIsPaused(false);
    setStreak(0);
    setMaxStreak(0);
    setAdaptationResult(null);

    accumulatedTimeRef.current = 0;
    startTimeRef.current = 0;
  }, [seed, difficultyId, clearPendingMismatch, stopTimer]);

  // Handle active game timer with pause support
  useEffect(() => {
    if (status === 'in_progress' && !isPaused) {
      startTimeRef.current = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const sessionElapsed = (now - startTimeRef.current) / 1000;
        const total = accumulatedTimeRef.current + sessionElapsed;
        setElapsedActiveTime(parseFloat(total.toFixed(1)));
      }, 100);
    } else {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        if (startTimeRef.current > 0) {
          accumulatedTimeRef.current += (Date.now() - startTimeRef.current) / 1000;
          startTimeRef.current = 0;
        }
      }
    }

    return () => {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [status, isPaused]);

  // Pause on window blur / tab invisibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && statusRef.current === 'in_progress') {
        setIsPaused(true);
      }
    };

    const handleWindowBlur = () => {
      if (statusRef.current === 'in_progress') {
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      clearPendingMismatch();
      stopTimer();
    };
  }, [clearPendingMismatch, stopTimer]);

  // Main Card Click Handler
  const handleCardClick = useCallback((index: number) => {
    // 1. Reject click if game won or currently locked
    if (statusRef.current === 'won' || isLockedRef.current) {
      return;
    }

    const currentCards = cardsRef.current;

    // 2. Reject out-of-bounds click
    if (index < 0 || index >= currentCards.length) {
      return;
    }

    const clickedCard = currentCards[index];

    // 3. Reject click on already matched card (REQUIREMENT: inert)
    if (clickedCard.status === 'matched') {
      return;
    }

    // 4. Reject click on currently face-up card (REQUIREMENT: handle repeat clicks on same card)
    if (clickedCard.status === 'face-up' || selectedIndicesRef.current.includes(index)) {
      return;
    }

    // Unpause if paused by blur
    if (isPaused) {
      setIsPaused(false);
    }

    // Start timer on first move
    if (statusRef.current === 'idle') {
      statusRef.current = 'in_progress';
      setStatus('in_progress');
      startTimeRef.current = Date.now();
    }

    soundManager.playFlip();

    // CASE 1: First card selection of a turn
    if (selectedIndicesRef.current.length === 0) {
      const updatedCards = currentCards.map((c, i) => (i === index ? { ...c, status: 'face-up' as const } : c));
      cardsRef.current = updatedCards;
      setCards(updatedCards);

      selectedIndicesRef.current = [index];
      setSelectedIndices([index]);
      return;
    }

    // CASE 2: Second card selection of a turn
    if (selectedIndicesRef.current.length === 1) {
      const firstIndex = selectedIndicesRef.current[0];
      const firstCard = currentCards[firstIndex];

      movesRef.current += 1;
      const newMoves = movesRef.current;
      setMoves(newMoves);

      // Reveal the second card
      const updatedCards = currentCards.map((c, i) => (i === index ? { ...c, status: 'face-up' as const } : c));
      cardsRef.current = updatedCards;
      setCards(updatedCards);

      selectedIndicesRef.current = [firstIndex, index];
      setSelectedIndices([firstIndex, index]);

      // Check for match
      if (firstCard.pairId === clickedCard.pairId) {
        // MATCH FOUND
        soundManager.playMatch();
        completedPairsRef.current += 1;
        const newCompleted = completedPairsRef.current;
        setCompletedPairs(newCompleted);

        setStreak(prev => {
          const next = prev + 1;
          setMaxStreak(m => Math.max(m, next));
          return next;
        });

        // Mark as matched with a subtle flash effect
        const matchedCards = updatedCards.map((c, i) => {
          if (i === firstIndex || i === index) {
            return { ...c, status: 'matched' as const, isMatchedFlash: true };
          }
          return c;
        });
        cardsRef.current = matchedCards;
        setCards(matchedCards);

        selectedIndicesRef.current = [];
        setSelectedIndices([]);

        // Check Win Condition
        if (newCompleted === currentConfig.pairsCount) {
          stopTimer();
          statusRef.current = 'won';
          setStatus('won');
          soundManager.playWin();

          // Calculate final active time
          const finalTime = accumulatedTimeRef.current + (startTimeRef.current > 0 ? (Date.now() - startTimeRef.current) / 1000 : 0);
          const roundFinalTimeSec = parseFloat(finalTime.toFixed(1));
          setElapsedActiveTime(roundFinalTimeSec);

          // Evaluate adaptation
          const adaptation = evaluateAdaptation(difficultyId, newMoves, roundFinalTimeSec);
          setAdaptationResult(adaptation);

          // Save anonymous session record
          saveSessionRecord({
            id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            seed,
            difficulty: difficultyId,
            difficultyName: currentConfig.name,
            gridSize: `${currentConfig.rows}×${currentConfig.cols}`,
            moves: newMoves,
            timeSeconds: roundFinalTimeSec,
            completedPairs: newCompleted,
            accuracy: adaptation.metrics.accuracy,
            efficiency: adaptation.metrics.efficiency,
            adaptation,
          });

          if (onWin) {
            onWin(adaptation);
          }
        }
      } else {
        // MISMATCH
        soundManager.playMismatch();
        setStreak(0);
        isLockedRef.current = true;
        setIsLocked(true); // LOCKOUT GUARD: Prevents third selection!

        // Highlight cards with mismatch animation
        const mismatchCards = updatedCards.map((c, i) => {
          if (i === firstIndex || i === index) {
            return { ...c, isMismatch: true };
          }
          return c;
        });
        cardsRef.current = mismatchCards;
        setCards(mismatchCards);

        const currentGen = roundGenRef.current;

        // Schedule flip-back after mismatch delay
        pendingMismatchTimeoutRef.current = setTimeout(() => {
          // RACE-CONDITION GUARD: Ensure this game round is still active
          if (currentGen !== roundGenRef.current) {
            return;
          }

          const flippedBack = cardsRef.current.map((c, i) => {
            if (i === firstIndex || i === index) {
              return { ...c, status: 'face-down' as const, isMismatch: false };
            }
            return c;
          });
          cardsRef.current = flippedBack;
          setCards(flippedBack);

          selectedIndicesRef.current = [];
          setSelectedIndices([]);

          isLockedRef.current = false;
          setIsLocked(false);
          pendingMismatchTimeoutRef.current = null;
        }, currentConfig.mismatchDelayMs);
      }
    }
  }, [
    isPaused,
    currentConfig,
    stopTimer,
    difficultyId,
    seed,
    onWin,
  ]);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'in_progress') {
      setIsPaused(prev => !prev);
    }
  }, []);

  return {
    seed,
    setSeed,
    difficultyId,
    setDifficultyId,
    currentConfig,
    cards,
    setCards,
    selectedIndices,
    isLocked,
    moves,
    completedPairs,
    status,
    elapsedActiveTime,
    isPaused,
    streak,
    maxStreak,
    adaptationResult,
    handleCardClick,
    restart,
    togglePause,
    roundGenRef,
    clearPendingMismatch,
  };
}
