import React from 'react';
import { Timer, Move, CheckCircle2, Flame, Pause, Play, Target } from 'lucide-react';
import { calculateEfficiency } from '../engine/rules';
import { DifficultyConfig, GameStatus } from '../types';

interface StatsBarProps {
  moves: number;
  completedPairs: number;
  totalPairs: number;
  elapsedActiveTime: number;
  isPaused: boolean;
  status: GameStatus;
  streak: number;
  config: DifficultyConfig;
  onTogglePause: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  moves,
  completedPairs,
  totalPairs,
  elapsedActiveTime,
  isPaused,
  status,
  streak,
  config,
  onTogglePause,
}) => {
  const efficiency = calculateEfficiency(moves, totalPairs);
  const progressPercent = Math.round((completedPairs / totalPairs) * 100);

  // Format time as mm:ss.s or ss.s
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    if (mins > 0) {
      return `${mins}m ${parseFloat(secs) < 10 ? '0' : ''}${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-2">
      {/* Top metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Active Timer Card */}
        <div className="glass-panel-subtle rounded-2xl p-3 flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                status === 'in_progress' && !isPaused
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Active Time
                </span>
                {status === 'in_progress' && (
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                    }`}
                    title={isPaused ? 'Timer Paused' : 'Timer Active'}
                  />
                )}
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1">
                <span data-testid="active-time-value">{formatTime(elapsedActiveTime)}</span>
                {isPaused && (
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                    Paused
                  </span>
                )}
              </div>
            </div>
          </div>
          {status === 'in_progress' && (
            <button
              onClick={onTogglePause}
              aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>
          )}
        </div>

        {/* Moves Counter Card */}
        <div className="glass-panel-subtle rounded-2xl p-3 flex items-center gap-2.5 border border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Move className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Moves
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1.5">
              <span data-testid="moves-counter-value">{moves}</span>
              <span className="text-[11px] text-slate-400 font-normal">
                (target ≤ {config.targetMoves})
              </span>
            </div>
          </div>
        </div>

        {/* Completed Pairs Card */}
        <div className="glass-panel-subtle rounded-2xl p-3 flex items-center gap-2.5 border border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pairs Matched
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-100">
              <span data-testid="pairs-counter-value">{completedPairs}</span>
              <span className="text-slate-500 font-normal text-sm"> / {totalPairs}</span>
            </div>
          </div>
        </div>

        {/* Cognitive Efficiency & Streak Card */}
        <div className="glass-panel-subtle rounded-2xl p-3 flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Efficiency
              </div>
              <div className="text-lg sm:text-xl font-bold font-mono text-slate-100">
                {moves > 0 ? `${efficiency}%` : '100%'}
              </div>
            </div>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-xl animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold font-mono">{streak}x</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar across pairs */}
      <div className="mt-2.5 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
