import React, {useMemo} from 'react';
import {rng} from './rand';

// Procedural, deterministic 2D effects drawn with gradient-filled shapes
// (no SVG blur filters: they are very slow in software rendering).

export const FxDefs: React.FC = () => (
  <defs>
    <radialGradient id="g-smoke">
      <stop offset="0%" stopColor="#3a3f42" stopOpacity={0.85} />
      <stop offset="55%" stopColor="#262b2e" stopOpacity={0.55} />
      <stop offset="100%" stopColor="#1a1d1f" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="g-smoke-lit">
      <stop offset="0%" stopColor="#6b5446" stopOpacity={0.8} />
      <stop offset="60%" stopColor="#3a3330" stopOpacity={0.5} />
      <stop offset="100%" stopColor="#1a1d1f" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="g-fire">
      <stop offset="0%" stopColor="#fff3c4" stopOpacity={1} />
      <stop offset="30%" stopColor="#ffb02e" stopOpacity={0.95} />
      <stop offset="65%" stopColor="#e2461b" stopOpacity={0.55} />
      <stop offset="100%" stopColor="#7a1205" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="g-glow">
      <stop offset="0%" stopColor="#ffb347" stopOpacity={0.55} />
      <stop offset="100%" stopColor="#ff6a00" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="g-flak">
      <stop offset="0%" stopColor="#2b2b2b" stopOpacity={0.9} />
      <stop offset="70%" stopColor="#1a1a1a" stopOpacity={0.6} />
      <stop offset="100%" stopColor="#111" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="g-spray">
      <stop offset="0%" stopColor="#e8f1f3" stopOpacity={0.9} />
      <stop offset="100%" stopColor="#a8bcc2" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="g-cloud">
      <stop offset="0%" stopColor="#c9d3d8" stopOpacity={0.55} />
      <stop offset="100%" stopColor="#8796a0" stopOpacity={0} />
    </radialGradient>
  </defs>
);

/** Rising, drifting smoke column. t = seconds since ignition. */
export const SmokeColumn: React.FC<{x: number; y: number; t: number; seed: number; scale?: number; wind?: number; lit?: boolean; density?: number}> = ({
  x,
  y,
  t,
  seed,
  scale = 1,
  wind = 30,
  lit = false,
  density = 40,
}) => {
  const puffs = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: density}, (_, i) => ({birth: (i / density) * 6 + r() * 0.2, dx: (r() - 0.5) * 40, spin: r(), size: 0.7 + r() * 0.6}));
  }, [seed, density]);
  if (t <= 0) return null;
  return (
    <g>
      {puffs.map((p, i) => {
        // each puff loops every 6s, offset by its birth time
        const life = (t - p.birth) % 6;
        if (t < p.birth || life < 0) return null;
        const k = life / 6;
        const py = y - k * 520 * scale;
        const px = x + p.dx * scale + k * k * wind * 6 * scale;
        const rad = (18 + k * 120) * p.size * scale;
        const o = Math.min(1, life * 2) * (1 - k) * 0.9;
        return <circle key={i} cx={px} cy={py} r={rad} fill={`url(#${lit && k < 0.25 ? 'g-smoke-lit' : 'g-smoke'})`} opacity={o} />;
      })}
    </g>
  );
};

/** Flickering fire cluster. */
export const Fire: React.FC<{x: number; y: number; t: number; seed: number; scale?: number; width?: number}> = ({x, y, t, seed, scale = 1, width = 60}) => {
  const fl = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: 14}, () => ({dx: (r() - 0.5) * width, ph: r() * 10, f: 6 + r() * 6, h: 0.6 + r() * 0.8}));
  }, [seed, width]);
  if (t <= 0) return null;
  const grow = Math.min(1, t / 0.8);
  return (
    <g>
      <ellipse cx={x} cy={y - 10 * scale} rx={width * 1.6 * scale} ry={50 * scale} fill="url(#g-glow)" opacity={0.7 * grow} />
      {fl.map((f, i) => {
        const fl1 = 0.75 + 0.25 * Math.sin(t * f.f + f.ph) + 0.1 * Math.sin(t * 23 + i);
        const h = 34 * f.h * fl1 * scale * grow;
        return <ellipse key={i} cx={x + f.dx * scale} cy={y - h * 0.6} rx={10 * scale * fl1} ry={h} fill="url(#g-fire)" opacity={0.9} />;
      })}
    </g>
  );
};

/** One-shot explosion: flash, fireball, debris, then smoke handled elsewhere. */
export const Explosion: React.FC<{x: number; y: number; t: number; seed: number; scale?: number}> = ({x, y, t, seed, scale = 1}) => {
  const debris = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: 22}, () => ({a: -Math.PI * (0.1 + r() * 0.8), v: 200 + r() * 420, s: 2 + r() * 4}));
  }, [seed]);
  if (t < 0 || t > 4) return null;
  const k = Math.min(1, t / 0.6);
  const fb = (40 + 260 * Math.pow(k, 0.5)) * scale;
  const fo = t < 0.15 ? 1 : Math.max(0, 1 - (t - 0.15) / 2.2);
  return (
    <g>
      <circle cx={x} cy={y - fb * 0.5} r={fb * 2.2} fill="url(#g-glow)" opacity={fo * 0.8} />
      <ellipse cx={x} cy={y - fb * 0.55} rx={fb * 0.8} ry={fb} fill="url(#g-fire)" opacity={fo} />
      <circle cx={x} cy={y - fb * 1.1} r={fb * 0.7} fill="url(#g-fire)" opacity={fo * 0.8} />
      {debris.map((d, i) => {
        const px = x + Math.cos(d.a) * d.v * t * scale;
        const py = y + Math.sin(d.a) * d.v * t * scale + 260 * t * t * scale;
        return <rect key={i} x={px} y={py} width={d.s * scale} height={d.s * scale} fill="#1a0f08" opacity={Math.max(0, 1 - t / 3)} />;
      })}
    </g>
  );
};

/** Water column from a torpedo/bomb hit. */
export const WaterColumn: React.FC<{x: number; y: number; t: number; scale?: number}> = ({x, y, t, scale = 1}) => {
  if (t < 0 || t > 3) return null;
  const k = Math.min(1, t / 0.5);
  const h = 260 * Math.sin(Math.min(Math.PI, (t / 3) * Math.PI)) * scale;
  return (
    <g opacity={1 - Math.max(0, t - 2)}>
      <ellipse cx={x} cy={y - h * 0.5} rx={34 * scale * (0.6 + k * 0.6)} ry={h * 0.55} fill="url(#g-spray)" />
      <ellipse cx={x} cy={y - h} rx={46 * scale * k} ry={30 * scale} fill="url(#g-spray)" opacity={0.8} />
    </g>
  );
};

/** Anti-aircraft bursts across a region. */
export const Flak: React.FC<{x0: number; x1: number; y0: number; y1: number; t: number; seed: number; rate?: number}> = ({x0, x1, y0, y1, t, seed, rate = 3}) => {
  const bursts = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: 60}, () => ({at: r() * 20, x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0), s: 0.6 + r() * 0.8}));
  }, [seed, x0, x1, y0, y1]);
  return (
    <g>
      {bursts.map((b, i) => {
        const tt = t - b.at / (rate / 3);
        if (tt < 0 || tt > 5) return null;
        const r = (6 + Math.sqrt(tt) * 22) * b.s;
        return (
          <g key={i}>
            {tt < 0.12 ? <circle cx={b.x} cy={b.y} r={r * 1.4} fill="#ffd27a" opacity={0.9} /> : null}
            <circle cx={b.x} cy={b.y + tt * 4} r={r} fill="url(#g-flak)" opacity={Math.max(0, 1 - tt / 5)} />
          </g>
        );
      })}
    </g>
  );
};

/** Tracer streaks rising from guns. */
export const Tracers: React.FC<{x: number; y: number; t: number; seed: number; spread?: number}> = ({x, y, t, seed, spread = 0.6}) => {
  const shots = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: 40}, () => ({at: r() * 10, a: -Math.PI / 2 + (r() - 0.5) * spread, v: 900 + r() * 400}));
  }, [seed, spread]);
  return (
    <g stroke="#ffcf6b" strokeLinecap="round">
      {shots.map((s, i) => {
        const tt = (t - s.at) % 1.4;
        if (t < s.at || tt < 0 || tt > 0.9) return null;
        const d = s.v * tt;
        const x1 = x + Math.cos(s.a) * d;
        const y1 = y + Math.sin(s.a) * d;
        return <line key={i} x1={x1} y1={y1} x2={x1 - Math.cos(s.a) * 40} y2={y1 - Math.sin(s.a) * 40} strokeWidth={2.2} opacity={1 - tt} />;
      })}
    </g>
  );
};

/** Sparks (cutting torch). */
export const Sparks: React.FC<{x: number; y: number; t: number; seed: number}> = ({x, y, t, seed}) => {
  const sp = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: 50}, () => ({at: r() * 2, a: Math.PI * (0.15 + r() * 0.7), v: 80 + r() * 160}));
  }, [seed]);
  return (
    <g>
      <circle cx={x} cy={y} r={14 + 4 * Math.sin(t * 40)} fill="#fff6d5" opacity={0.9} />
      <circle cx={x} cy={y} r={60} fill="url(#g-glow)" opacity={0.6} />
      {sp.map((s, i) => {
        const tt = (t - s.at) % 0.9;
        if (tt < 0) return null;
        const px = x + Math.cos(s.a) * s.v * tt * (i % 2 ? 1 : -1);
        const py = y + Math.sin(s.a) * s.v * tt * 0.3 + 300 * tt * tt;
        return <circle key={i} cx={px} cy={py} r={1.6} fill="#ffd56a" opacity={1 - tt / 0.9} />;
      })}
    </g>
  );
};

/** Soft cloud bank (gradient ellipses). */
export const Clouds: React.FC<{seed: number; y: number; width: number; t: number; speed?: number; count?: number; scale?: number; opacity?: number}> = ({
  seed,
  y,
  width,
  t,
  speed = 20,
  count = 18,
  scale = 1,
  opacity = 1,
}) => {
  const cl = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: count}, () => ({x: r() * (width + 800) - 400, dy: (r() - 0.5) * 120, rx: 160 + r() * 260, ry: 30 + r() * 50}));
  }, [seed, count, width]);
  return (
    <g opacity={opacity}>
      {cl.map((c, i) => {
        const x = ((c.x - t * speed + 10000 * (width + 800)) % (width + 800)) - 400;
        return <ellipse key={i} cx={x} cy={y + c.dy} rx={c.rx * scale} ry={c.ry * scale} fill="url(#g-cloud)" />;
      })}
    </g>
  );
};

/** Sea surface with moving shimmer lines. */
export const Sea: React.FC<{y: number; w: number; h: number; t: number; tone?: string; seed?: number}> = ({y, w, h, t, tone = '#0c1820', seed = 3}) => {
  const lines = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: 70}, () => ({x: r() * w, y: Math.pow(r(), 1.6) * h, len: 30 + r() * 140, sp: 6 + r() * 14}));
  }, [w, h, seed]);
  return (
    <g>
      <rect x={0} y={y} width={w} height={h} fill={tone} />
      {lines.map((l, i) => {
        const k = l.y / h;
        const x = (l.x + t * l.sp * (0.4 + k)) % (w + 200) - 100;
        return <rect key={i} x={x} y={y + l.y} width={l.len * (0.4 + k)} height={1 + k * 1.5} fill="#9fb8c2" opacity={0.05 + k * 0.12} />;
      })}
    </g>
  );
};
