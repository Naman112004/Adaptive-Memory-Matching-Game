import React, { useState, useEffect, useCallback } from 'react';
import { useMemoryGame } from './hooks/useMemoryGame';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { GameBoard } from './components/GameBoard';
import { SeedControl } from './components/SeedControl';
import { InstructionsModal } from './components/InstructionsModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AdaptationModal } from './components/AdaptationModal';
import { DemonstrationSuite } from './components/DemonstrationSuite';
import { soundManager } from './utils/sound';
import { DifficultyId } from './types';
import { Play, ShieldAlert, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  // Read URL query params for seed and difficulty if present
  const getInitialParams = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSeed = params.get('seed');
      const urlDiff = params.get('diff') as DifficultyId;
      return {
        seed: urlSeed || 'SESSION-4X4-ALPHA',
        diff: urlDiff && ['easy', 'standard', 'expert', 'master'].includes(urlDiff) ? urlDiff : 'standard',
      };
    }
    return { seed: 'SESSION-4X4-ALPHA', diff: 'standard' as DifficultyId };
  };

  const initialParams = getInitialParams();

  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDemoSuiteOpen, setIsDemoSuiteOpen] = useState(false);
  const [isAdaptationModalOpen, setIsAdaptationModalOpen] = useState(false);

  const {
    seed,
    difficultyId,
    currentConfig,
    cards,
    moves,
    completedPairs,
    status,
    elapsedActiveTime,
    isPaused,
    streak,
    isLocked,
    adaptationResult,
    handleCardClick,
    restart,
    togglePause,
  } = useMemoryGame({
    initialSeed: initialParams.seed,
    initialDifficulty: initialParams.diff,
    onWin: () => {
      // Open Adaptation Modal on win
      setIsAdaptationModalOpen(true);
    },
  });

  // Sound toggle handler
  const handleToggleSound = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        restart();
      } else if (e.key === 'p' || e.key === 'P') {
        togglePause();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleSound();
      } else if (e.key === 'Escape') {
        setIsSeedModalOpen(false);
        setIsInstructionsOpen(false);
        setIsHistoryOpen(false);
        setIsDemoSuiteOpen(false);
        setIsAdaptationModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [restart, togglePause, handleToggleSound]);

  // Handle adaptation next round transition
  const handleAcceptAdaptation = (nextDiff: DifficultyId) => {
    setIsAdaptationModalOpen(false);
    restart(seed, nextDiff);
  };

  const handleReplayCurrent = () => {
    setIsAdaptationModalOpen(false);
    restart();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background ambient decorative glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation / Header */}
        <Header
          currentConfig={currentConfig}
          difficultyId={difficultyId}
          seed={seed}
          isMuted={isMuted}
          onSelectDifficulty={(newDiff) => restart(seed, newDiff)}
          onOpenSeedModal={() => setIsSeedModalOpen(true)}
          onOpenInstructions={() => setIsInstructionsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenDemoSuite={() => setIsDemoSuiteOpen(true)}
          onToggleSound={handleToggleSound}
          onRestart={() => restart()}
        />

        {/* Live Metrics StatsBar */}
        <StatsBar
          moves={moves}
          completedPairs={completedPairs}
          totalPairs={currentConfig.pairsCount}
          elapsedActiveTime={elapsedActiveTime}
          isPaused={isPaused}
          status={status}
          streak={streak}
          config={currentConfig}
          onTogglePause={togglePause}
        />

        {/* Main Game Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
          {/* Paused Overlay Banner */}
          {isPaused && (
            <div className="w-full max-w-md mx-auto mb-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl p-3 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Game paused. Active timer halted.</span>
              </div>
              <button
                onClick={togglePause}
                className="flex items-center gap-1 font-bold text-amber-200 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-500/40 hover:bg-amber-900 transition-colors"
              >
                <Play className="w-3 h-3 fill-amber-300" />
                <span>Resume</span>
              </button>
            </div>
          )}

          {/* Card Grid Board */}
          <GameBoard
            cards={cards}
            onCardClick={handleCardClick}
            isLocked={isLocked}
            cols={currentConfig.cols}
            rows={currentConfig.rows}
          />

          {/* Quick round guide pill */}
          <div className="mt-3 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              Current Tier: <strong className="text-slate-300 font-sans">{currentConfig.name}</strong> • Target: ≤ {currentConfig.targetMoves} moves in ≤ {currentConfig.targetTimeSec}s for promotion
            </span>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 py-3 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span>PS09 Adaptive Memory Matching Game</span>
          <span className="text-slate-700">•</span>
          <span className="text-slate-400">Mulberry32 PRNG</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDemoSuiteOpen(true)}
            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            <span>Run Test Harness</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SeedControl
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        currentSeed={seed}
        onApplySeed={(newSeed) => restart(newSeed, difficultyId)}
      />

      <InstructionsModal
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <DemonstrationSuite
        isOpen={isDemoSuiteOpen}
        onClose={() => setIsDemoSuiteOpen(false)}
        activeCards={cards}
        handleCardClick={handleCardClick}
        restart={restart}
        isLocked={isLocked}
        moves={moves}
        completedPairs={completedPairs}
      />

      <AdaptationModal
        isOpen={isAdaptationModalOpen}
        result={adaptationResult}
        onAcceptAdaptation={handleAcceptAdaptation}
        onReplayCurrent={handleReplayCurrent}
      />
    </div>
  );
};

export default App;
