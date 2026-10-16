import { describe, it, expect } from 'vitest';
import { createPRNG, shuffleArray, hashString } from '../utils/prng';
import { generateDeck } from '../utils/cards';

describe('PRNG and Card Deck Generation', () => {
  it('hashString produces consistent hash for same input', () => {
    const h1 = hashString('TEST-SEED-123');
    const h2 = hashString('TEST-SEED-123');
    expect(h1).toBe(h2);
    expect(typeof h1).toBe('number');
  });

  it('createPRNG generates deterministic sequence of pseudo-random numbers', () => {
    const prng1 = createPRNG('SEED-ALPHA');
    const prng2 = createPRNG('SEED-ALPHA');

    const seq1 = [prng1(), prng1(), prng1(), prng1(), prng1()];
    const seq2 = [prng2(), prng2(), prng2(), prng2(), prng2()];

    expect(seq1).toEqual(seq2);
    seq1.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(1);
    });
  });

  it('different seeds generate distinct sequences', () => {
    const prng1 = createPRNG('SEED-ONE');
    const prng2 = createPRNG('SEED-TWO');

    const num1 = prng1();
    const num2 = prng2();

    expect(num1).not.toBe(num2);
  });

  it('shuffleArray deterministically permutes array elements without dropping any', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const prngA = createPRNG('SHUFFLE-SEED');
    const prngB = createPRNG('SHUFFLE-SEED');

    const shuffledA = shuffleArray(items, prngA);
    const shuffledB = shuffleArray(items, prngB);

    expect(shuffledA).toEqual(shuffledB);
    expect(shuffledA.length).toBe(items.length);
    expect([...shuffledA].sort()).toEqual(items);
  });

  it('generateDeck produces exactly pairsCount * 2 cards with matching pairIds', () => {
    const pairsCount = 8;
    const seed = 'SESSION-TEST-4X4';
    const deck = generateDeck(pairsCount, seed);

    expect(deck.length).toBe(16);

    // Each pairId should appear exactly twice
    const pairCounts: Record<string, number> = {};
    deck.forEach((card) => {
      pairCounts[card.pairId] = (pairCounts[card.pairId] || 0) + 1;
      expect(card.status).toBe('face-down');
    });

    expect(Object.keys(pairCounts).length).toBe(8);
    Object.values(pairCounts).forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it('generateDeck with identical seed generates identical deck layout', () => {
    const deck1 = generateDeck(8, 'IDENTICAL-SEED');
    const deck2 = generateDeck(8, 'IDENTICAL-SEED');

    expect(deck1.map((c) => c.pairId)).toEqual(deck2.map((c) => c.pairId));
    expect(deck1.map((c) => c.id)).toEqual(deck2.map((c) => c.id));
  });
});
