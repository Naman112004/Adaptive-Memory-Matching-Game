import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  FileSpreadsheet,
  FileCode,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Calendar,
  Hash,
} from 'lucide-react';
import { SessionRecord } from '../types';
import {
  getStoredSessions,
  clearStoredSessions,
  exportSessionsAsJSON,
  exportSessionsAsCSV,
} from '../utils/storage';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSessions(getStoredSessions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all anonymous session history?')) {
      clearStoredSessions();
      setSessions([]);
    }
  };

  const totalPlayed = sessions.length;
  const avgMoves = totalPlayed > 0 ? (sessions.reduce((acc, s) => acc + s.moves, 0) / totalPlayed).toFixed(1) : 0;
  const avgTime = totalPlayed > 0 ? (sessions.reduce((acc, s) => acc + s.timeSeconds, 0) / totalPlayed).toFixed(1) : 0;
  const promotions = sessions.filter(s => s.adaptation.action === 'promoted').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-slate-950 border-l border-slate-800 p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Session Performance Log</h3>
                <p className="text-[11px] text-slate-400">Anonymous on-device history & adaptation reasoning</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Aggregate Stats Summary */}
          {totalPlayed > 0 && (
            <div className="grid grid-cols-4 gap-2 my-4">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="text-sm font-bold font-mono text-white">{totalPlayed}</div>
                <div className="text-[10px] text-slate-400">Rounds</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="text-sm font-bold font-mono text-white">{avgMoves}</div>
                <div className="text-[10px] text-slate-400">Avg Moves</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="text-sm font-bold font-mono text-white">{avgTime}s</div>
                <div className="text-[10px] text-slate-400">Avg Time</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                <div className="text-sm font-bold font-mono text-emerald-400">{promotions}</div>
                <div className="text-[10px] text-slate-400">Promotions</div>
              </div>
            </div>
          )}

          {/* Session Cards List */}
          <div className="space-y-3 mt-4 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">No sessions recorded yet.</p>
                <p className="text-xs mt-1">Complete a game round to see performance & adaptation logs.</p>
              </div>
            ) : (
              sessions.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/70 rounded-2xl p-3.5 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.difficultyName}</span>
                      <span className="text-[10px] text-slate-400">({item.gridSize})</span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-0.5">
                        <Hash className="w-2.5 h-2.5" />
                        {item.seed}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.adaptation.action === 'promoted' ? (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <ArrowUpRight className="w-3 h-3" /> Promoted
                        </span>
                      ) : item.adaptation.action === 'demoted' ? (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <ArrowDownRight className="w-3 h-3" /> Demoted
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          <Equal className="w-3 h-3" /> Maintained
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 py-1.5 px-2 bg-slate-950/60 rounded-xl font-mono text-[11px] mb-2">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-sans">Moves</span>
                      <span className="text-slate-200 font-semibold">{item.moves}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-sans">Time</span>
                      <span className="text-slate-200 font-semibold">{item.timeSeconds}s</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-sans">Efficiency</span>
                      <span className="text-indigo-300 font-semibold">{item.efficiency}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-sans">Accuracy</span>
                      <span className="text-purple-300 font-semibold">{item.accuracy}%</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300 leading-snug">
                    <span className="text-slate-500 font-medium">Reason: </span>
                    {item.adaptation.reason}
                  </div>

                  <div className="text-[10px] text-slate-500 mt-2 flex justify-between items-center pt-1 border-t border-slate-800/40">
                    <span>{item.date}</span>
                    <span className="text-slate-400">Next: {item.adaptation.nextDifficulty}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={exportSessionsAsJSON}
              disabled={sessions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs disabled:opacity-40 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={exportSessionsAsCSV}
              disabled={sessions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs disabled:opacity-40 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>

          {sessions.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-900/30 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
