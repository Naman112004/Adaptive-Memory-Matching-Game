import React, { useState } from 'react';
import { X, Dices, Copy, Check, Hash, Sparkles } from 'lucide-react';
import { generateRandomSeed } from '../utils/prng';

interface SeedControlProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeed: string;
  onApplySeed: (newSeed: string) => void;
}

const PRESET_SEEDS = [
  { label: 'Standard 4x4 Baseline', seed: 'BASELINE-4X4-ALPHA' },
  { label: 'Test Session Omega', seed: 'TEST-OMEGA-99' },
  { label: 'Predictable Sequence', seed: 'DETERMINISTIC-123' },
  { label: 'Speedrun Setup', seed: 'SPEEDRUN-777' },
];

export const SeedControl: React.FC<SeedControlProps> = ({
  isOpen,
  onClose,
  currentSeed,
  onApplySeed,
}) => {
  const [inputSeed, setInputSeed] = useState(currentSeed);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputSeed.trim();
    if (trimmed) {
      onApplySeed(trimmed);
      onClose();
    }
  };

  const handleGenerate = () => {
    const random = generateRandomSeed('SESSION');
    setInputSeed(random);
  };

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('seed', inputSeed.trim() || currentSeed);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 border border-slate-700 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Seed Dialog"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Reproducible PRNG Seed</h3>
            <p className="text-xs text-slate-400">
              Deterministic Mulberry32 algorithm guarantees identical card layouts.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label htmlFor="seedInput" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Current Seed Value
            </label>
            <div className="flex items-center gap-2">
              <input
                id="seedInput"
                type="text"
                value={inputSeed}
                onChange={(e) => setInputSeed(e.target.value)}
                placeholder="Enter seed string or number..."
                data-testid="seed-input-field"
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 text-slate-100 font-mono text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleGenerate}
                title="Roll Random Seed"
                data-testid="random-seed-button"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
              >
                <Dices className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preset Seeds */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Preset Test Seeds:</span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_SEEDS.map((preset) => (
                <button
                  key={preset.seed}
                  type="button"
                  onClick={() => setInputSeed(preset.seed)}
                  className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                    inputSeed === preset.seed
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-medium text-slate-300">{preset.label}</div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">{preset.seed}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied share link!' : 'Copy Shareable Link'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                data-testid="apply-seed-button"
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply & Deal</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
