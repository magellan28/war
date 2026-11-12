import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {ramp, ease} from '../art/rand';
import {Grain, Vignette} from '../fx/Post';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Dark graphic background shared by non-map scenes. */
export const GraphicBg: React.FC<{tint?: string; grid?: boolean; drift?: number}> = ({tint = '#0a131a', grid = true, drift = 0}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 80% at 50% 45%, ${tint} 0%, #04080b 100%)`}}>
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              'linear-gradient(rgba(140,200,210,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(140,200,210,0.05) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            backgroundPosition: `${-f * drift}px ${-f * drift * 0.3}px`,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const Finish: React.FC<{grain?: number; vignette?: number}> = ({grain = 0.08, vignette = 0.8}) => (
  <>
    <Vignette strength={vignette} />
    <Grain opacity={grain} />
  </>
);

export const typeOn = (text: string, frame: number, start: number, cps = 45) => {
  const n = Math.floor(((frame - start) / 30) * cps);
  return n <= 0 ? '' : text.slice(0, n);
};

/** Glyph-scramble reveal (decrypt look). */
export const decrypt = (text: string, frame: number, start: number, dur = 30) => {
  const k = (frame - start) / dur;
  if (k <= 0) return '';
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return text
    .split('')
    .map((ch, i) => {
      if (ch === ' ') return ' ';
      const reveal = k * text.length * 1.2 - i;
      if (reveal > 1) return ch;
      if (reveal < -6) return '';
      return glyphs[(i * 7 + frame * 3) % glyphs.length];
    })
    .join('');
};

/** Kicker + headline caption block. */
export const Caption: React.FC<{start: number; kicker?: string; title: string; sub?: string; color?: string; x?: number; y?: number; align?: 'left' | 'center'; size?: number}> = ({
  start,
  kicker,
  title,
  sub,
  color = C.alert,
  x = 120,
  y = 120,
  align = 'left',
  size = 64,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [start, start + 14], [0, 1], clamp);
  const line = ease(ramp(f, start, start + 22));
  return (
    <div style={{position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, opacity: o}}>
      {kicker ? <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: 6, color}}>{kicker}</div> : null}
      <div style={{width: 380 * line, height: 1.5, background: 'rgba(255,255,255,0.6)', margin: align === 'center' ? '14px auto' : '14px 0'}} />
      <div style={{fontFamily: F.title, fontWeight: 500, fontSize: size, letterSpacing: 4, color: '#fff', lineHeight: 1.05, textShadow: '0 2px 20px #000'}}>{title}</div>
      {sub ? <div style={{fontFamily: F.mono, fontSize: 17, letterSpacing: 2.5, color: C.hud, marginTop: 12}}>{sub}</div> : null}
    </div>
  );
};

/** Red/blue stamp that lands with a slight overshoot. */
export const Stamp: React.FC<{start: number; text: string; color?: string; x: number; y: number; rot?: number; size?: number}> = ({start, text, color = C.jp, x, y, rot = -8, size = 34}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const s = interpolate(f, [start, start + 5, start + 9], [1.8, 0.94, 1], clamp);
  const o = interpolate(f, [start, start + 4], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`,
        opacity: o * 0.92,
        border: `3px solid ${color}`,
        color,
        padding: '6px 18px',
        fontFamily: F.title,
        fontWeight: 600,
        fontSize: size,
        letterSpacing: 5,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** Big counting statistic. */
export const Stat: React.FC<{start: number; value: number; label: string; sub?: string; color?: string; prefix?: string; suffix?: string; size?: number; dur?: number}> = ({
  start,
  value,
  label,
  sub,
  color = '#fff',
  prefix = '',
  suffix = '',
  size = 120,
  dur = 40,
}) => {
  const f = useCurrentFrame();
  const k = ease(ramp(f, start, start + dur));
  const o = ramp(f, start - 4, start + 8);
  const v = Math.round(value * k).toLocaleString('en-US');
  return (
    <div style={{opacity: o, textAlign: 'left'}}>
      <div style={{fontFamily: F.title, fontWeight: 500, fontSize: size, lineHeight: 1, color, letterSpacing: 2, fontVariantNumeric: 'tabular-nums'}}>
        {prefix}
        {v}
        {suffix}
      </div>
      <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: 5, color: C.hud, marginTop: 10}}>{label}</div>
      {sub ? <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: 2, color: C.hudDim, marginTop: 6}}>{sub}</div> : null}
    </div>
  );
};

/** Person dossier card. Silhouette is generic: no likeness is claimed. */
export const Dossier: React.FC<{
  start: number;
  name: string;
  role: string;
  lines: string[];
  side: 'us' | 'jp' | 'neutral';
  hat?: 'navy' | 'army' | 'none' | 'civil';
  x: number;
  y: number;
  w?: number;
  tag?: string;
}> = ({start, name, role, lines, side, hat = 'navy', x, y, w = 560, tag}) => {
  const f = useCurrentFrame();
  const o = ramp(f, start, start + 12);
  const slide = (1 - ease(ramp(f, start, start + 18))) * 40;
  const col = side === 'us' ? C.us : side === 'jp' ? C.jp : C.alert;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + slide,
        width: w,
        opacity: o,
        background: 'linear-gradient(180deg, rgba(18,28,36,0.92), rgba(8,13,18,0.92))',
        border: '1px solid rgba(180,220,230,0.18)',
        borderLeft: `4px solid ${col}`,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex',
        gap: 24,
        padding: 24,
      }}
    >
      <svg width={190} height={228} viewBox="0 0 150 180" style={{flex: 'none'}}>
        <defs>
          <linearGradient id={`dg-${name}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={col} stopOpacity={0.35} />
            <stop offset="1" stopColor="#0b1218" stopOpacity={0.2} />
          </linearGradient>
          <pattern id={`ht-${name}`} width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1.1" fill={col} opacity="0.45" />
          </pattern>
        </defs>
        <rect width={150} height={180} fill={`url(#dg-${name})`} />
        <g fill={`url(#ht-${name})`} stroke={col} strokeOpacity={0.5}>
          <path d="M75,40 C98,40 108,58 106,82 C104,104 92,118 75,118 C58,118 46,104 44,82 C42,58 52,40 75,40 Z" />
          <path d="M20,180 C24,140 46,126 75,126 C104,126 126,140 130,180 Z" />
          {hat === 'navy' ? <path d="M40,54 C44,30 106,30 110,54 L118,58 L32,58 Z" /> : null}
          {hat === 'army' ? <path d="M40,56 C42,34 108,34 110,56 L122,62 L40,60 Z" /> : null}
          {hat === 'civil' ? <path d="M36,56 L114,56 L106,48 C104,30 46,30 44,48 Z" /> : null}
        </g>
        <text x={75} y={172} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={9} fill={C.hudDim}>
          ILLUSTRATIVE
        </text>
      </svg>
      <div style={{flex: 1}}>
        {tag ? <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: 3, color: col}}>{tag}</div> : null}
        <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 56, color: '#fff', letterSpacing: 1.5, lineHeight: 1.05, marginTop: 4}}>{name}</div>
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.hud, letterSpacing: 1.5, marginTop: 8}}>{role}</div>
        <div style={{height: 1, background: 'rgba(255,255,255,0.15)', margin: '14px 0'}} />
        {lines.map((l, i) => (
          <div key={i} style={{fontFamily: F.label, fontSize: 23, color: 'rgba(230,238,242,0.88)', marginBottom: 6, opacity: ramp(f, start + 14 + i * 8, start + 24 + i * 8)}}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

/** Paper document (reconstruction) with typed text. */
export const DocSheet: React.FC<{start: number; header: string; meta: string; body: string[]; x: number; y: number; w?: number; rot?: number; mode?: 'type' | 'decrypt'; cps?: number}> = ({
  start,
  header,
  meta,
  body,
  x,
  y,
  w = 900,
  rot = -1.5,
  mode = 'type',
  cps = 50,
}) => {
  const f = useCurrentFrame();
  const o = ramp(f, start, start + 12);
  let t0 = start + 14;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: o,
        transform: `rotate(${rot}deg) translateY(${(1 - ease(ramp(f, start, start + 20))) * 30}px)`,
        background: 'linear-gradient(170deg, #d9d2c0, #c4bba5)',
        color: '#1d1a14',
        padding: '38px 48px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        fontFamily: F.mono,
      }}
    >
      <div style={{fontSize: 15, letterSpacing: 3, opacity: 0.75}}>{meta}</div>
      <div style={{fontSize: 26, fontWeight: 500, letterSpacing: 2, margin: '10px 0 18px', borderBottom: '1.5px solid rgba(0,0,0,0.4)', paddingBottom: 12}}>{header}</div>
      {body.map((line, i) => {
        const s = t0;
        t0 += Math.ceil((line.length / cps) * 30) + 6;
        const txt = mode === 'decrypt' ? decrypt(line, f, s, Math.max(20, line.length * 0.6)) : typeOn(line, f, s, cps);
        return (
          <div key={i} style={{fontSize: 21, lineHeight: 1.5, minHeight: 31}}>
            {txt}
          </div>
        );
      })}
      <div style={{position: 'absolute', right: 18, bottom: 10, fontSize: 11, letterSpacing: 2, opacity: 0.55}}>GRAPHIC RECONSTRUCTION</div>
    </div>
  );
};

export const SourceNote: React.FC<{text: string; start?: number}> = ({text, start = 10}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', right: 84, bottom: 40, fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, color: C.hudDim, opacity: ramp(f, start, start + 15), textAlign: 'right'}}>
      {text}
    </div>
  );
};

export const paper = staticFile;

/** Darkened, slowly drifting map texture as a backdrop for card scenes. */
export const MapBackdrop: React.FC<{tile?: string; opacity?: number; tint?: string}> = ({tile = 'geo/pacific_1_1.webp', opacity = 0.32, tint = 'rgba(4,8,11,0.55)'}) => {
  const f = useCurrentFrame();
  const s = 1.15 + f * 0.0004;
  return (
    <AbsoluteFill style={{background: '#04080b', overflow: 'hidden'}}>
      <Img src={staticFile(tile)} style={{position: 'absolute', left: '50%', top: '50%', width: 2400, transform: `translate(-50%,-50%) scale(${s}) translateX(${-f * 0.15}px)`, opacity}} />
      <AbsoluteFill style={{background: tint}} />
    </AbsoluteFill>
  );
};
