/**
 * Fast, deterministic pseudo-random number generator (Mulberry32)
 * Ensures 100% reproducible card layouts and test sessions.
 */

export function hashString(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function createPRNG(seedInput: string | number): () => number {
  let s = typeof seedInput === 'number' ? seedInput >>> 0 : hashString(String(seedInput).trim());
  if (s === 0) s = 1337;

  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic Fisher-Yates shuffle using provided PRNG
 */
export function shuffleArray<T>(array: readonly T[], prng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generate a friendly alphanumeric seed like "ALPHA-4821" or "GAME-7819"
 */
export function generateRandomSeed(prefix: string = 'SESSION'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}${num}`;
}
