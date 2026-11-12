import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {ease, ramp, rng} from '../art/rand';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export type TxKind = 'fade' | 'wipe' | 'smoke' | 'flash' | 'cut' | 'chapter' | 'chapterEnd';

/** Style applied to an incoming scene during its enter transition. */
export const enterStyle = (kind: TxKind | null, overlap: number, f: number): React.CSSProperties => {
  if (!kind || overlap <= 0) return {};
  const k = ease(ramp(f, 0, overlap));
  switch (kind) {
    case 'fade':
      return {opacity: k};
    case 'smoke':
      return {opacity: ramp(f, overlap * 0.35, overlap * 0.75)};
    case 'flash':
      return {opacity: f >= overlap / 2 ? 1 : 0};
    case 'wipe':
      return {clipPath: `inset(0 0 0 ${(1 - k) * 100}%)`};
    default:
      return {};
  }
};

/** Overlay drawn on top of both scenes during a transition (local frame 0..overlap). */
export const TransitionOverlay: React.FC<{kind: TxKind; overlap: number; seed: number}> = ({kind, overlap, seed}) => {
  const f = useCurrentFrame();
  const puffs = useMemo(() => {
    const r = rng(seed);
    return Array.from({length: 26}, () => ({x: r() * 1920, y: r() * 1080, r: 260 + r() * 380, dx: (r() - 0.5) * 300}));
  }, [seed]);
  if (kind === 'flash') {
    const o = interpolate(f, [0, overlap / 2, overlap], [0, 1, 0], clamp);
    return <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${o}), rgba(255,236,200,${o * 0.85}) 60%)`}} />;
  }
  if (kind === 'smoke') {
    const k = f / overlap;
    const o = Math.sin(Math.PI * Math.min(1, Math.max(0, k)));
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <defs>
            <radialGradient id="tx-smoke">
              <stop offset="0%" stopColor="#2c3134" stopOpacity={1} />
              <stop offset="60%" stopColor="#1b1f22" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#111" stopOpacity={0} />
            </radialGradient>
          </defs>
          {puffs.map((p, i) => (
            <circle key={i} cx={p.x + p.dx * k} cy={p.y - 120 * k} r={p.r * (0.7 + 0.5 * k)} fill="url(#tx-smoke)" opacity={o} />
          ))}
        </svg>
      </AbsoluteFill>
    );
  }
  if (kind === 'wipe') {
    const k = ease(ramp(f, 0, overlap));
    return (
      <AbsoluteFill>
        <div style={{position: 'absolute', top: 0, bottom: 0, left: `${(1 - k) * 100}%`, width: 2, background: C.route, boxShadow: `0 0 18px ${C.route}`, opacity: k < 1 ? 0.9 : 0}} />
      </AbsoluteFill>
    );
  }
  return null;
};

/** Three chapter-title treatments, rotated so no two adjacent chapters match. */
export const ChapterCard: React.FC<{n: number; title: string; start: number; end: number}> = ({n, title, start, end}) => {
  const f = useCurrentFrame();
  const t = f - start;
  if (t < 0 || f > end + 20) return null;
  const out = 1 - ramp(f, end, end + 18);
  const words = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const variant = n % 3;
  const o = ramp(t, 0, 14) * out;
  if (variant === 0) {
    const line = ease(ramp(t, 0, 24));
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o, background: `rgba(0,0,0,${0.45 * o})`}}>
        <div style={{textAlign: 'center', color: '#fff'}}>
          <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: 9, color: C.alert}}>CHAPTER {words[n - 1]}</div>
          <div style={{width: 600 * line, height: 1.5, background: 'rgba(255,255,255,0.7)', margin: '20px auto'}} />
          <div style={{fontFamily: F.title, fontWeight: 500, fontSize: 104, letterSpacing: interpolate(t, [0, 80], [20, 12], {extrapolateRight: 'clamp'})}}>{title}</div>
          <div style={{width: 600 * line, height: 1.5, background: 'rgba(255,255,255,0.7)', margin: '20px auto'}} />
        </div>
      </AbsoluteFill>
    );
  }
  if (variant === 1) {
    const slide = (1 - ease(ramp(t, 0, 22))) * 80;
    return (
      <AbsoluteFill style={{opacity: o, background: `linear-gradient(90deg, rgba(0,0,0,${0.75 * o}) 0%, rgba(0,0,0,0) 70%)`}}>
        <div style={{position: 'absolute', left: 150 - slide, top: 380, color: '#fff'}}>
          <div style={{fontFamily: F.title, fontWeight: 300, fontSize: 220, lineHeight: 0.8, color: 'rgba(255,255,255,0.12)'}}>{String(n).padStart(2, '0')}</div>
          <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: 7, color: C.route, marginTop: -40}}>CHAPTER {words[n - 1]}</div>
          <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 92, letterSpacing: 6, marginTop: 8}}>{title}</div>
          <div style={{width: 160, height: 4, background: C.jp, marginTop: 18}} />
        </div>
      </AbsoluteFill>
    );
  }
  const n2 = Math.floor((t / 30) * 22);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o, background: `rgba(0,0,0,${0.55 * o})`}}>
      <div style={{fontFamily: F.mono, color: '#fff', textAlign: 'center'}}>
        <div style={{fontSize: 18, letterSpacing: 6, color: C.hudDim}}>{'// CHAPTER ' + words[n - 1]}</div>
        <div style={{fontFamily: F.title, fontWeight: 500, fontSize: 100, letterSpacing: 10, marginTop: 16}}>
          {title.slice(0, n2)}
          <span style={{opacity: (Math.floor(t / 8) % 2) * 0.8}}>_</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
