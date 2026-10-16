import React from 'react';
import {
  RotateCcw,
  HelpCircle,
  History,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { DifficultyConfig, DifficultyId } from '../types';
import { DIFFICULTY_CONFIGS, DIFFICULTY_ORDER } from '../engine/rules';

interface HeaderProps {
  currentConfig: DifficultyConfig;
  difficultyId: DifficultyId;
  seed: string;
  isMuted: boolean;
  onSelectDifficulty: (id: DifficultyId) => void;
  onOpenSeedModal: () => void;
  onOpenInstructions: () => void;
  onOpenHistory: () => void;
  onOpenDemoSuite: () => void;
  onToggleSound: () => void;
  onRestart: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentConfig,
  difficultyId,
  seed,
  isMuted,
  onSelectDifficulty,
  onOpenSeedModal,
  onOpenInstructions,
  onOpenHistory,
  onOpenDemoSuite,
  onToggleSound,
  onRestart,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-4 pb-2">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                Adaptive Memory
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                PS09
              </span>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentConfig.badgeColor}`}>
                {currentConfig.name} ({currentConfig.rows}×{currentConfig.cols})
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Cognitive pattern-matching with performance-driven adaptation
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Difficulty Dropdown / Selector */}
          <div className="relative">
            <select
              value={difficultyId}
              onChange={(e) => onSelectDifficulty(e.target.value as DifficultyId)}
              aria-label="Select Game Difficulty"
              data-testid="difficulty-selector"
              className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-indigo-500/60 text-slate-200 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              {DIFFICULTY_ORDER.map((id) => {
                const conf = DIFFICULTY_CONFIGS[id];
                return (
                  <option key={id} value={id} className="bg-slate-900 text-slate-200">
                    {conf.name} ({conf.rows}×{conf.cols})
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <Sliders className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Seed badge button */}
          <button
            onClick={onOpenSeedModal}
            title={`Current Seed: ${seed}. Click to edit or generate reproducible seed.`}
            data-testid="seed-control-button"
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 hover:border-indigo-500/60 text-slate-300 text-xs font-mono py-1.5 px-3 rounded-xl transition-colors shadow-sm"
          >
            <span className="text-slate-500 text-[10px] uppercase font-sans">Seed:</span>
            <span className="max-w-[80px] sm:max-w-[110px] truncate text-indigo-300 font-semibold">{seed}</span>
          </button>

          {/* Demonstration Suite Trigger */}
          <button
            onClick={onOpenDemoSuite}
            data-testid="demo-suite-button"
            className="flex items-center gap-1 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 text-xs font-medium py-1.5 px-2.5 rounded-xl transition-all shadow-sm"
            title="Launch Automated Demonstration Suite & Verification"
          >
            <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Demos & Tests</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Instructions Modal Trigger */}
          <button
            onClick={onOpenInstructions}
            aria-label="Instructions and Rules"
            title="Game Instructions & Adaptation Rules"
            data-testid="instructions-button"
            className="p-2 bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            aria-label="Session History"
            title="Past Performance & Anonymous Records"
            data-testid="history-button"
            className="p-2 bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <History className="w-4 h-4" />
          </button>

          {/* Restart Button */}
          <button
            onClick={onRestart}
            aria-label="Restart Game"
            title="Restart Game (clears pending timers)"
            data-testid="restart-game-button"
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 px-3 rounded-xl transition-all shadow-md shadow-indigo-600/30 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      </div>
    </header>
  );
};
