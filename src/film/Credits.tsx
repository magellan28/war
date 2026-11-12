import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';

const ROWS: [string, string][] = [
  ['NARRATION', 'AI voice · Kokoro-82M (am_fenrir)'],
  ['MUSIC & SOUND', 'Original, synthesised for this film'],
  ['ELEVATION', 'AWS Terrain Tiles (SRTM · GMTED · ETOPO1 · USGS)'],
  ['MAP DATA', '© OpenStreetMap contributors (ODbL) · Natural Earth'],
  ['HISTORICAL SOURCES', 'NHHC · National Park Service · National WWII Museum · NSA · U.S. Navy'],
  ['NOTE', 'All illustrations are digital reconstructions; silhouettes are generic'],
  ['', 'Disputed figures are marked on screen · full source list in research/'],
];

export const Credits: React.FC<{duration: number}> = ({duration}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 20, duration - 30, duration - 4], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center', opacity: o}}>
      <div style={{width: 1300}}>
        {ROWS.map(([k, v], i) => (
          <div key={i} style={{display: 'flex', gap: 40, marginBottom: 22, opacity: interpolate(f, [i * 6, i * 6 + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
            <div style={{width: 340, textAlign: 'right', fontFamily: F.mono, fontSize: 16, letterSpacing: 4, color: C.alert}}>{k}</div>
            <div style={{flex: 1, fontFamily: F.label, fontSize: 22, color: 'rgba(235,240,243,0.9)'}}>{v}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
