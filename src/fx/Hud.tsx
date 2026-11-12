import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, F} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Typewriter reveal for HUD strings. */
export const typed = (text: string, frame: number, start: number, cps = 40) => {
  const n = Math.floor(((frame - start) / 30) * cps);
  return n <= 0 ? '' : text.slice(0, n);
};

const Corner: React.FC<{x: 'left' | 'right'; y: 'top' | 'bottom'}> = ({x, y}) => (
  <div
    style={{
      position: 'absolute',
      [x]: 44,
      [y]: 40,
      width: 26,
      height: 26,
      borderColor: C.hudDim,
      borderStyle: 'solid',
      borderWidth: 0,
      [`border${y === 'top' ? 'Top' : 'Bottom'}Width`]: 1.5,
      [`border${x === 'left' ? 'Left' : 'Right'}Width`]: 1.5,
    }}
  />
);

/**
 * Military-interface frame: corner ticks, top-left tag, bottom-left date/time
 * block, bottom-right position readout. All texts are passed in by the scene.
 */
export const Hud: React.FC<{
  start: number;
  tag: string;
  date: string;
  time?: string;
  note?: string;
  lat: number;
  lon: number; // continuous east
  opacity?: number;
}> = ({start, tag, date, time, note, lat, lon, opacity = 1}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [start, start + 18], [0, 1], clamp) * opacity;
  if (o <= 0) return null;
  const lonW = lon > 180 ? `${(360 - lon).toFixed(2)}°W` : `${lon.toFixed(2)}°E`;
  const latS = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  return (
    <AbsoluteFill style={{opacity: o, pointerEvents: 'none', fontFamily: F.mono, color: C.hud}}>
      <Corner x="left" y="top" />
      <Corner x="right" y="top" />
      <Corner x="left" y="bottom" />
      <Corner x="right" y="bottom" />
      <div style={{position: 'absolute', left: 84, top: 62, fontSize: 15, letterSpacing: 3}}>
        <span style={{color: C.jp}}>■</span>&nbsp;&nbsp;{typed(tag, frame, start + 4, 55)}
      </div>
      <div style={{position: 'absolute', left: 84, bottom: 66}}>
        <div style={{fontSize: 13, letterSpacing: 3, color: C.hudDim}}>DATE</div>
        <div style={{fontFamily: F.title, fontWeight: 500, fontSize: 46, letterSpacing: 3, color: '#fff', lineHeight: 1.05}}>{date}</div>
        {time ? <div style={{fontSize: 17, letterSpacing: 2.5, marginTop: 4, color: C.route}}>{time}</div> : null}
        {note ? <div style={{fontSize: 12, letterSpacing: 2, marginTop: 8, color: C.hudDim}}>{note}</div> : null}
      </div>
      <div style={{position: 'absolute', right: 84, bottom: 66, textAlign: 'right', fontSize: 14, letterSpacing: 2.5}}>
        <div style={{color: C.hudDim, fontSize: 12}}>CAM POSITION</div>
        <div>
          {latS}&nbsp;&nbsp;{lonW}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Cinematic chapter card. */
export const ChapterTitle: React.FC<{start: number; num: string; title: string}> = ({start, num, title}) => {
  const frame = useCurrentFrame();
  const t = frame - start;
  if (t < 0) return null;
  const line = interpolate(t, [0, 22], [0, 1], {...clamp, easing: (x) => 1 - Math.pow(1 - x, 3)});
  const o = interpolate(t, [4, 20], [0, 1], clamp);
  const track = interpolate(t, [0, 60], [18, 12], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
      <div style={{textAlign: 'center', color: '#fff'}}>
        <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: 8, color: C.alert, opacity: o}}>{num}</div>
        <div style={{width: 520 * line, height: 1.5, background: 'rgba(255,255,255,0.7)', margin: '18px auto'}} />
        <div
          style={{
            fontFamily: F.title,
            fontWeight: 500,
            fontSize: 112,
            letterSpacing: track,
            opacity: o,
            textShadow: '0 0 40px rgba(0,0,0,0.8)',
            paddingLeft: track,
          }}
        >
          {title}
        </div>
        <div style={{width: 520 * line, height: 1.5, background: 'rgba(255,255,255,0.7)', margin: '18px auto'}} />
      </div>
    </AbsoluteFill>
  );
};
