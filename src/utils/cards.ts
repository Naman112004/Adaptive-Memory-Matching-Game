import { CardItem } from '../types';
import { createPRNG, shuffleArray } from './prng';

export interface CardDefinition {
  pairId: string;
  label: string;
  icon: string;
  color: string;
}

// Master pool of 24 distinct, high-contrast, beautiful card definitions
export const CARD_CATALOG: CardDefinition[] = [
  { pairId: 'rocket', label: 'Space Rocket', icon: 'Rocket', color: 'from-amber-500 to-rose-600' },
  { pairId: 'atom', label: 'Quantum Atom', icon: 'Atom', color: 'from-cyan-400 to-blue-600' },
  { pairId: 'flame', label: 'Solar Flame', icon: 'Flame', color: 'from-orange-500 to-amber-600' },
  { pairId: 'shield', label: 'Aegis Shield', icon: 'Shield', color: 'from-emerald-400 to-teal-600' },
  { pairId: 'sparkles', label: 'Cosmic Sparkles', icon: 'Sparkles', color: 'from-purple-400 to-pink-600' },
  { pairId: 'zap', label: 'High Voltage', icon: 'Zap', color: 'from-yellow-400 to-amber-500' },
  { pairId: 'brain', label: 'Neural Core', icon: 'Brain', color: 'from-fuchsia-500 to-purple-700' },
  { pairId: 'gem', label: 'Prism Gem', icon: 'Gem', color: 'from-blue-400 to-indigo-600' },
  { pairId: 'compass', label: 'Astro Compass', icon: 'Compass', color: 'from-teal-400 to-cyan-600' },
  { pairId: 'cpu', label: 'Silicon CPU', icon: 'Cpu', color: 'from-emerald-500 to-green-700' },
  { pairId: 'moon', label: 'Crescent Moon', icon: 'Moon', color: 'from-indigo-400 to-slate-600' },
  { pairId: 'sun', label: 'Radiant Sun', icon: 'Sun', color: 'from-yellow-500 to-orange-600' },
  { pairId: 'anchor', label: 'Iron Anchor', icon: 'Anchor', color: 'from-slate-400 to-slate-700' },
  { pairId: 'target', label: 'Precision Bullseye', icon: 'Target', color: 'from-rose-500 to-red-700' },
  { pairId: 'feather', label: 'Phoenix Feather', icon: 'Feather', color: 'from-pink-400 to-rose-600' },
  { pairId: 'globe', label: 'Terra Globe', icon: 'Globe', color: 'from-sky-400 to-blue-700' },
  { pairId: 'key', label: 'Cipher Key', icon: 'Key', color: 'from-amber-400 to-yellow-600' },
  { pairId: 'music', label: 'Sonic Melody', icon: 'Music', color: 'from-violet-400 to-purple-600' },
  { pairId: 'heart', label: 'Cyber Heart', icon: 'Heart', color: 'from-rose-400 to-pink-600' },
  { pairId: 'flag', label: 'Signal Flag', icon: 'Flag', color: 'from-lime-400 to-emerald-600' },
  { pairId: 'bell', label: 'Chime Bell', icon: 'Bell', color: 'from-amber-300 to-amber-600' },
  { pairId: 'cloud', label: 'Stratosphere', icon: 'Cloud', color: 'from-sky-300 to-slate-500' },
  { pairId: 'crown', label: 'Imperial Crown', icon: 'Crown', color: 'from-yellow-400 to-amber-700' },
  { pairId: 'eye', label: 'Oracle Eye', icon: 'Eye', color: 'from-teal-300 to-emerald-600' },
];

/**
 * Deterministically generates a deck of cards for a given pair count and seed.
 */
export function generateDeck(pairsCount: number, seed: string): CardItem[] {
  if (pairsCount > CARD_CATALOG.length) {
    throw new Error(`Requested ${pairsCount} pairs exceeds catalog size of ${CARD_CATALOG.length}`);
  }

  const prng = createPRNG(seed);
  
  // Shuffled selection of definitions from catalog
  const shuffledCatalog = shuffleArray(CARD_CATALOG, prng);
  const selectedDefinitions = shuffledCatalog.slice(0, pairsCount);

  // Create two cards per definition
  const rawCards: CardItem[] = [];
  selectedDefinitions.forEach((def, index) => {
    rawCards.push({
      id: `${def.pairId}-a-${index}`,
      pairId: def.pairId,
      label: def.label,
      icon: def.icon,
      color: def.color,
      status: 'face-down',
    });
    rawCards.push({
      id: `${def.pairId}-b-${index}`,
      pairId: def.pairId,
      label: def.label,
      icon: def.icon,
      color: def.color,
      status: 'face-down',
    });
  });

  // Deterministically shuffle the cards in the grid
  return shuffleArray(rawCards, prng);
}
