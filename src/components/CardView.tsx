import React from 'react';
import { CardItem } from '../types';
import { CardIcon } from './CardIcon';
import { Check, Sparkles } from 'lucide-react';

interface CardViewProps {
  card: CardItem;
  index: number;
  onClick: (index: number) => void;
  isLocked: boolean;
  gridRows?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  index,
  onClick,
  isLocked,
  gridRows = 4,
}) => {
  const isRevealed = card.status === 'face-up' || card.status === 'matched';
  const isMatched = card.status === 'matched';
  const isFaceUp = card.status === 'face-up';
  const isMismatch = !!card.isMismatch;

  const handleClick = () => {
    if (!isLocked && card.status === 'face-down') {
      onClick(index);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isLocked && card.status === 'face-down') {
      e.preventDefault();
      onClick(index);
    }
  };

  // Adjust card height slightly based on grid size for optimal viewport fit
  const cardHeightClass = gridRows >= 6 ? 'h-16 sm:h-20' : gridRows >= 5 ? 'h-20 sm:h-24' : 'h-24 sm:h-28 md:h-32';

  return (
    <div
      role="button"
      tabIndex={card.status === 'face-down' && !isLocked ? 0 : -1}
      aria-label={`Card ${index + 1}: ${isRevealed ? card.label : 'Hidden'}`}
      aria-pressed={isRevealed}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-testid={`card-${index}`}
      data-card-status={card.status}
      data-pair-id={card.pairId}
      className={`relative w-full ${cardHeightClass} perspective-1000 select-none cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-2xl ${
        isMatched ? 'cursor-default' : ''
      }`}
    >
      <div
        className={`relative w-full h-full duration-500 preserve-3d rounded-2xl transition-transform ${
          isRevealed ? 'rotate-y-180' : ''
        } ${isMismatch ? 'animate-bounce-short ring-2 ring-rose-500/80 shadow-lg shadow-rose-500/20' : ''}`}
      >
        {/* CARD BACK (Face-down) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden flex flex-col items-center justify-center border transition-all duration-300 ${
            isLocked
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border-slate-700/60 shadow-md group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10 group-hover:scale-[1.02]'
          }`}
          style={{ backgroundColor: '#0f172a' }}
        >
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:12px_12px] rounded-2xl pointer-events-none" />
          
          <div className="relative flex flex-col items-center justify-center gap-1">
            <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
              <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 group-hover:text-indigo-300 transition-colors">
              #{index + 1}
            </span>
          </div>
        </div>

        {/* CARD FRONT (Face-up or Matched) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl rotate-y-180 backface-hidden flex flex-col items-center justify-center p-2 border transition-all duration-300 ${
            isMatched
              ? 'bg-gradient-to-b from-slate-900/95 to-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
              : isMismatch
              ? 'bg-gradient-to-b from-slate-900/95 to-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500/40'
              : 'bg-gradient-to-b from-slate-850 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
          }`}
        >
          {/* Matched badge indicator */}
          {isMatched && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          )}

          {/* Icon with gradient badge */}
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${card.color} text-white shadow-md transition-transform duration-300 ${
              isFaceUp ? 'scale-105' : 'scale-100'
            }`}
          >
            <CardIcon name={card.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* Card Label */}
          <span
            className={`mt-1.5 text-[11px] sm:text-xs font-medium text-center truncate max-w-full px-1 ${
              isMatched ? 'text-emerald-300' : isMismatch ? 'text-rose-300' : 'text-slate-200'
            }`}
          >
            {card.label}
          </span>
        </div>
      </div>
    </div>
  );
};
