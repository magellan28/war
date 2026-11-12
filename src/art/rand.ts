// Deterministic randomness (identical on every render frame/thread).
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const ramp = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
