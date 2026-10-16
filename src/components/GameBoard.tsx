import React from 'react';
import { CardItem } from '../types';
import { CardView } from './CardView';

interface GameBoardProps {
  cards: CardItem[];
  onCardClick: (index: number) => void;
  isLocked: boolean;
  cols: number;
  rows: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  onCardClick,
  isLocked,
  cols,
  rows,
}) => {
  // Dynamically map column counts to tailwind classes
  const getColClass = (colCount: number) => {
    switch (colCount) {
      case 3:
        return 'grid-cols-3 max-w-md';
      case 4:
        return 'grid-cols-4 max-w-xl';
      case 5:
        return 'grid-cols-5 max-w-2xl';
      case 6:
        return 'grid-cols-4 sm:grid-cols-6 max-w-3xl';
      default:
        return 'grid-cols-4 max-w-xl';
    }
  };

  return (
    <div className="w-full flex justify-center px-2 sm:px-4 py-2">
      <div
        className={`w-full grid gap-2.5 sm:gap-3.5 p-3 sm:p-5 rounded-3xl glass-panel shadow-2xl transition-all duration-300 ${getColClass(
          cols
        )}`}
        data-testid="game-board-grid"
      >
        {cards.map((card, index) => (
          <CardView
            key={card.id}
            card={card}
            index={index}
            onClick={onCardClick}
            isLocked={isLocked}
            gridRows={rows}
          />
        ))}
      </div>
    </div>
  );
};
