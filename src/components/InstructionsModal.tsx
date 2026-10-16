import React from 'react';
import { X, BookOpen, Brain, Zap, Shield, Keyboard } from 'lucide-react';
import { DIFFICULTY_CONFIGS, DIFFICULTY_ORDER } from '../engine/rules';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl glass-panel p-5 sm:p-7 border border-slate-700 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Instructions"
          data-testid="close-instructions-button"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">How to Play & Adaptation Guide</h2>
            <p className="text-xs text-slate-400">
              PS09 Adaptive Memory Matching Game rules, thresholds & controls.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-5 text-xs text-slate-300">
          {/* Rules & Correctness */}
          <section className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-2">
              <Shield className="w-4 h-4" />
              <span>Core Matching Rules & Input Guards</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 leading-relaxed">
              <li>
                <strong>Initial Setup:</strong> Starts on a <strong>4×4 grid</strong> containing <strong>8 pairs</strong> (16 cards).
              </li>
              <li>
                <strong>Matching Logic:</strong> Click to flip a card. Click a second card to attempt a match. If matching, both remain face-up.
              </li>
              <li>
                <strong>Lockout Guard:</strong> If two revealed cards do not match, the board locks immediately. Any 3rd card selections are strictly blocked until the mismatch resolves and flips back.
              </li>
              <li>
                <strong>Repeat & Matched Click Protection:</strong> Clicking the already revealed first card or any previously matched card is safely ignored (no-op, no move penalties).
              </li>
              <li>
                <strong>Active Time Tracking:</strong> Elapsed time only accumulates during active gameplay. The timer automatically pauses when you switch tabs or blur the window.
              </li>
              <li>
                <strong>Clean Restart:</strong> Pressing Restart safely destroys pending mismatch timeouts so callbacks from a previous round never bleed into a fresh game.
              </li>
            </ul>
          </section>

          {/* Documented Adaptation Thresholds Matrix */}
          <section className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <Brain className="w-4 h-4" />
              <span>Documented Performance-Driven Adaptation Matrix</span>
            </div>
            <p className="text-slate-400 mb-3 leading-relaxed">
              Upon game completion, your active completion time and total moves are evaluated against documented cognitive velocity thresholds. The system transparently explains why a tier adjustment occurred.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1.5 px-2">Difficulty Tier</th>
                    <th className="py-1.5 px-2">Grid & Pairs</th>
                    <th className="py-1.5 px-2 text-emerald-400">Promotion Threshold</th>
                    <th className="py-1.5 px-2 text-rose-400">Demotion Threshold</th>
                    <th className="py-1.5 px-2">Flip Delay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {DIFFICULTY_ORDER.map((id) => {
                    const c = DIFFICULTY_CONFIGS[id];
                    return (
                      <tr key={id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-2 font-bold font-sans text-white">{c.name}</td>
                        <td className="py-2 px-2">{c.rows}×{c.cols} ({c.pairsCount}p)</td>
                        <td className="py-2 px-2 text-emerald-300">
                          {c.id !== 'master' ? `≤ ${c.targetMoves} moves & ≤ ${c.targetTimeSec}s` : 'Max Tier Reached'}
                        </td>
                        <td className="py-2 px-2 text-rose-300">
                          {c.id !== 'easy' ? `≥ ${c.demoteMoves} moves or ≥ ${c.demoteTimeSec}s` : 'Base Tier'}
                        </td>
                        <td className="py-2 px-2 text-slate-400">{c.mismatchDelayMs}ms</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reproducibility & Testing */}
          <section className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
              <Zap className="w-4 h-4" />
              <span>Reproducible Test Sessions (Seeded PRNG)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Every game session is seeded via the <strong>Mulberry32 PRNG</strong>. Using the same seed guarantees 100% deterministic card distributions, enabling reproducible regression tests, competitive duels, and controlled cognitive research.
            </p>
          </section>

          {/* Keyboard Shortcuts */}
          <section className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-2">
              <Keyboard className="w-4 h-4" />
              <span>Keyboard Navigation & Accessibility</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-indigo-300">Tab / Shift+Tab</kbd>
                <div className="text-[10px] text-slate-400 mt-1">Navigate Cards</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-indigo-300">Enter / Space</kbd>
                <div className="text-[10px] text-slate-400 mt-1">Reveal Card</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-indigo-300">R</kbd>
                <div className="text-[10px] text-slate-400 mt-1">Restart Board</div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-center">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px] text-indigo-300">P</kbd>
                <div className="text-[10px] text-slate-400 mt-1">Pause / Resume</div>
              </div>
            </div>
          </section>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/30"
          >
            Got It, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
