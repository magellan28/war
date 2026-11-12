import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';
import {useMap} from './MapStage';

/**
 * Tactical unit marker: framed top-down carrier glyph + callout.
 * The glyph is a generic flat-top silhouette, not a specific ship.
 */
export const CarrierGroupSymbol: React.FC<{
  x: number; // world units
  y: number;
  start: number;
  title: string;
  sub?: string;
  color?: string;
  count?: number;
}> = ({x, y, start, title, sub, color = C.jp, count = 6}) => {
  const frame = useCurrentFrame();
  const {projectWorld} = useMap();
  const [px, py] = projectWorld(x, y);
  const o = interpolate(frame, [start, start + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  const box = 64;
  const ships = Array.from({length: count});
  return (
    <div style={{position: 'absolute', left: px, top: py, opacity: o}}>
      <svg width={260} height={160} style={{position: 'absolute', left: -box / 2, top: -box / 2, overflow: 'visible'}}>
        <rect x={0} y={0} width={box} height={box} rx={4} fill="rgba(40,6,10,0.55)" stroke={color} strokeWidth={2} />
        <rect x={-6} y={-6} width={box + 12} height={box + 12} rx={7} fill="none" stroke={C.jpGlow} strokeWidth={6} opacity={0.35} />
        {ships.map((_, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          return (
            <g key={i} transform={`translate(${14 + col * 24}, ${12 + row * 16})`}>
              <path d="M0,4 L4,0 L18,0 L22,3 L18,7 L4,7 Z" fill={color} />
              <rect x={12} y={-1} width={3} height={2.5} fill="#fff" opacity={0.8} />
            </g>
          );
        })}
        <line x1={box} y1={box / 2} x2={box + 26} y2={box / 2} stroke={color} strokeWidth={1.5} />
      </svg>
      <div style={{position: 'absolute', left: box / 2 + 34, top: -box / 2 + 4, whiteSpace: 'nowrap', textShadow: '0 1px 3px #000'}}>
        <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 30, letterSpacing: 2.5, color: '#fff'}}>{title}</div>
        {sub ? <div style={{fontFamily: F.mono, fontSize: 14, letterSpacing: 1.6, color, marginTop: 2}}>{sub}</div> : null}
      </div>
    </div>
  );
};
