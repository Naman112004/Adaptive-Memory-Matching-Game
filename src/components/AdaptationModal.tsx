import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Sparkles,
  RotateCcw,
  CheckCircle,
  XCircle,
  Gauge,
  Timer,
  Move,
  Target,
} from 'lucide-react';
import { AdaptationResult, DifficultyId } from '../types';
import { DIFFICULTY_CONFIGS } from '../engine/rules';

interface AdaptationModalProps {
  isOpen: boolean;
  result: AdaptationResult | null;
  onAcceptAdaptation: (nextDiff: DifficultyId) => void;
  onReplayCurrent: () => void;
}

export const AdaptationModal: React.FC<AdaptationModalProps> = ({
  isOpen,
  result,
  onAcceptAdaptation,
  onReplayCurrent,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !result) return null;

  const prevConfig = DIFFICULTY_CONFIGS[result.previousDifficulty];
  const nextConfig = DIFFICULTY_CONFIGS[result.nextDifficulty];

  const getActionBanner = () => {
    switch (result.action) {
      case 'promoted':
        return {
          title: 'Promoted to Next Tier!',
          badge: 'Difficulty Escalated',
          color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
          icon: <ArrowUpRight className="w-5 h-5 text-emerald-400" />,
        };
      case 'demoted':
        return {
          title: 'Adapted for Calibration',
          badge: 'Cognitive Recovery Tier',
          color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
          icon: <ArrowDownRight className="w-5 h-5 text-amber-400" />,
        };
      default:
        return {
          title: 'Steady Performance!',
          badge: 'Tier Maintained',
          color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-300',
          icon: <Equal className="w-5 h-5 text-indigo-400" />,
        };
    }
  };

  const banner = getActionBanner();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl glass-panel p-5 sm:p-7 border border-slate-700 shadow-2xl relative my-auto">
        {/* Top Trophy Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3 animate-bounce-short">
            <Trophy className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Victory! Grid Cleared</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Round completed on <span className="text-slate-200 font-semibold">{prevConfig.name}</span> ({prevConfig.rows}×{prevConfig.cols} grid)
          </p>
        </div>

        {/* Performance Metrics Quad */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Move className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold font-mono text-slate-100">{result.metrics.moves}</div>
            <div className="text-[10px] text-slate-400">Total Moves</div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Timer className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold font-mono text-slate-100">{result.metrics.timeSeconds}s</div>
            <div className="text-[10px] text-slate-400">Active Time</div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold font-mono text-slate-100">{result.metrics.efficiency}%</div>
            <div className="text-[10px] text-slate-400">Efficiency</div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl p-2.5 border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-400 mb-1">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold font-mono text-slate-100">{result.metrics.accuracy}%</div>
            <div className="text-[10px] text-slate-400">Accuracy</div>
          </div>
        </div>

        {/* Explainable Adaptation Verdict Card */}
        <div
          data-testid="adaptation-verdict-card"
          className={`rounded-2xl p-4 border bg-gradient-to-r mb-5 ${banner.color}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {banner.icon}
              <span className="text-sm font-bold tracking-tight">{banner.title}</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-900/60 border border-white/10 font-bold">
              {banner.badge}
            </span>
          </div>

          <div className="text-xs font-semibold text-slate-200 mb-1">
            {result.reason}
          </div>
          <div className="text-[11px] text-slate-300/90 leading-relaxed">
            {result.detailedReason}
          </div>

          {/* Next round transition preview */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Next Configuration:</span>
            <span className="font-bold text-white bg-slate-900/70 px-2.5 py-1 rounded-xl border border-white/10">
              {nextConfig.name} ({nextConfig.rows}×{nextConfig.cols} • {nextConfig.pairsCount} pairs)
            </span>
          </div>
        </div>

        {/* Evaluated Rules Transparency Breakdown */}
        <div className="mb-5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Documented Threshold Checks:
          </span>
          <div className="space-y-1.5">
            {result.evaluations.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center gap-2">
                  {rule.met ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="text-slate-300 font-medium">{rule.ruleName}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-400">{rule.threshold}</span>
                  <span className="text-slate-500">→</span>
                  <span className={rule.met ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {rule.actual}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={onReplayCurrent}
            data-testid="replay-current-level-button"
            className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Same Level</span>
          </button>

          <button
            onClick={() => onAcceptAdaptation(result.nextDifficulty)}
            data-testid="accept-adaptation-button"
            className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Play Next Round</span>
          </button>
        </div>
      </div>
    </div>
  );
};
