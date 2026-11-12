import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {LonLat} from './geo';
import {useMap} from './MapStage';

const fadeIn = (frame: number, start: number, dur = 14) =>
  interpolate(frame, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Geographic or tactical label lying on the map plane. */
export const Label: React.FC<{
  at: LonLat;
  text: string;
  sub?: string;
  start: number;
  end?: number;
  size?: number;
  dx?: number;
  dy?: number;
  align?: 'left' | 'right' | 'center';
  color?: string;
  weight?: number;
  caps?: boolean;
  spacing?: number;
}> = ({at, text, sub, start, end, size = 26, dx = 18, dy = -4, align = 'left', color = C.label, weight = 700, caps = false, spacing = 0}) => {
  const frame = useCurrentFrame();
  const {project} = useMap();
  const [x, y] = project(at);
  const o = fadeIn(frame, start) * (end ? 1 - fadeIn(frame, end, 12) : 1);
  if (o <= 0) return null;
  const rise = (1 - fadeIn(frame, start, 18)) * 10;
  const tx = align === 'left' ? '0%' : align === 'right' ? '-100%' : '-50%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x + (align === 'right' ? -dx : align === 'center' ? 0 : dx),
        top: y + dy + rise,
        transform: `translate(${tx}, -50%)`,
        opacity: o,
        whiteSpace: 'nowrap',
        textAlign: align,
        fontFamily: F.label,
        color,
        textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 0 14px rgba(0,0,0,0.75)',
        letterSpacing: spacing,
      }}
    >
      <div style={{fontSize: size, fontWeight: weight, textTransform: caps ? 'uppercase' : 'none'}}>{text}</div>
      {sub ? (
        <div style={{fontFamily: F.mono, fontSize: size * 0.52, color: C.labelDim, marginTop: 3, letterSpacing: 1.5, textTransform: 'uppercase'}}>{sub}</div>
      ) : null}
    </div>
  );
};

/** Position marker: glowing dot with optional pulse ring. */
export const Marker: React.FC<{at: LonLat; color: string; glow: string; start: number; end?: number; r?: number; pulse?: boolean}> = ({
  at,
  color,
  glow,
  start,
  end,
  r = 9,
  pulse = true,
}) => {
  const frame = useCurrentFrame();
  const {project} = useMap();
  const [x, y] = project(at);
  const o = fadeIn(frame, start, 10) * (end ? 1 - fadeIn(frame, end, 12) : 1);
  if (o <= 0) return null;
  const pop = interpolate(frame, [start, start + 8, start + 14], [0.2, 1.35, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cyc = ((frame - start) % 45) / 45;
  return (
    <svg style={{position: 'absolute', left: x - 80, top: y - 80, overflow: 'visible', opacity: o}} width={160} height={160}>
      {pulse ? <circle cx={80} cy={80} r={r + cyc * 46} fill="none" stroke={color} strokeWidth={2} opacity={(1 - cyc) * 0.7} /> : null}
      <circle cx={80} cy={80} r={r * 2.6 * pop} fill={glow} opacity={0.35} />
      <circle cx={80} cy={80} r={r * pop} fill={color} />
      <circle cx={80} cy={80} r={r * 0.38 * pop} fill="rgba(255,255,255,0.85)" />
    </svg>
  );
};

/** Highlight ring for a critical event (yellow by convention). */
export const AlertRing: React.FC<{at: LonLat; start: number; r?: number}> = ({at, start, r = 70}) => {
  const frame = useCurrentFrame();
  const {project} = useMap();
  const [x, y] = project(at);
  const t = frame - start;
  if (t < 0) return null;
  const draw = interpolate(t, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const breathe = 1 + Math.sin(t / 7) * 0.04;
  const circ = 2 * Math.PI * r;
  return (
    <svg style={{position: 'absolute', left: x - 200, top: y - 200, overflow: 'visible'}} width={400} height={400}>
      <g transform={`translate(200,200) scale(${breathe}) rotate(${-90 + t * 0.6})`}>
        <circle r={r} fill="none" stroke={C.alertGlow} strokeWidth={8} opacity={0.35} strokeDasharray={`${circ * draw} ${circ}`} />
        <circle r={r} fill="none" stroke={C.alert} strokeWidth={2.2} strokeDasharray={`${circ * draw} ${circ}`} />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1={r + 8} x2={r + 22} transform={`rotate(${a})`} stroke={C.alert} strokeWidth={2.4} opacity={draw} />
        ))}
      </g>
    </svg>
  );
};
