import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Cam, cameraAt, CamKey} from './camera';
import {MapStage, useMap} from './MapStage';
import {LonLat, W} from './geo';
import {DepthOfField, Grain, Haze, Vignette} from '../fx/Post';
import {Hud} from '../fx/Hud';
import {C, F} from '../theme';
import {ease, ramp} from '../art/rand';

export type HudSpec = {tag: string; date: string | ((f: number) => string); time?: string | ((f: number) => string | undefined); note?: string | ((f: number) => string | undefined)};

const ev = <T,>(v: T | ((f: number) => T), f: number): T => (typeof v === 'function' ? (v as (f: number) => T)(f) : v);

/** Standard 2.5D map shot: camera keys + overlays + atmosphere + HUD. */
export const MapShot: React.FC<{keys: CamKey[]; hud?: HudSpec; children?: React.ReactNode; camMod?: (c: Cam, f: number) => Cam; dof?: number; overlay?: React.ReactNode}> = ({
  keys,
  hud,
  children,
  camMod,
  dof = 4.5,
  overlay,
}) => {
  const f = useCurrentFrame();
  let cam = cameraAt(keys, f);
  if (camMod) cam = camMod(cam, f);
  const lon = (cam.cx / W) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * cam.cy) / W))) * 180) / Math.PI;
  return (
    <AbsoluteFill>
      <MapStage cam={cam}>{children}</MapStage>
      <Haze />
      <DepthOfField amount={dof} />
      <Vignette />
      {overlay}
      {hud ? <Hud start={4} tag={hud.tag} date={ev(hud.date, f)} time={hud.time ? ev(hud.time, f) : undefined} note={hud.note ? ev(hud.note, f) : undefined} lat={lat} lon={lon} /> : null}
      <Grain />
    </AbsoluteFill>
  );
};

/** Tactical ship symbol on the map plane (rotated hull glyph + label). */
export const ShipSymbol: React.FC<{at: LonLat; heading: number; color: string; start: number; label?: string; labelSide?: 'left' | 'right'; len?: number; struck?: number; sunk?: number; meters?: number}> = ({
  at,
  heading,
  color,
  start,
  label,
  labelSide = 'right',
  len: len0 = 46,
  struck,
  sunk,
  meters,
}) => {
  const f = useCurrentFrame();
  const {project, s: sc} = useMap();
  let len = len0;
  if (meters) len = Math.max(len * 0.5, ((meters / 37320000) * 100000) * sc);
  const [x, y] = project(at);
  const o = ramp(f, start, start + 10);
  if (o <= 0) return null;
  const hit = struck !== undefined && f >= struck;
  const sink = sunk !== undefined ? ease(ramp(f, sunk, sunk + 40)) : 0;
  const w = len * 0.2;
  return (
    <>
      <svg style={{position: 'absolute', left: x - 100, top: y - 100, overflow: 'visible', opacity: o * (1 - sink * 0.55)}} width={200} height={200}>
        <g transform={`translate(100,100) rotate(${heading})`}>
          <path d={`M${-len / 2},${-w / 2} L${len / 2 - w},${-w / 2} L${len / 2},0 L${len / 2 - w},${w / 2} L${-len / 2},${w / 2} Z`} fill={hit ? '#2b0e0e' : 'rgba(10,25,40,0.85)'} stroke={color} strokeWidth={2} />
          {hit ? <circle r={len * 0.32 + 6 * Math.sin(f / 3)} fill="none" stroke={C.alert} strokeWidth={2} opacity={0.8} /> : null}
        </g>
      </svg>
      {label ? (
        <div
          style={{
            position: 'absolute',
            left: labelSide === 'right' ? x + len * 0.55 + 8 : x - len * 0.55 - 8,
            top: y - 10,
            transform: labelSide === 'left' ? 'translateX(-100%)' : undefined,
            fontFamily: F.label,
            fontWeight: 700,
            fontSize: meters ? 20 : 17,
            color: hit ? C.alert : '#fff',
            textShadow: '0 1px 3px #000, 0 0 10px #000',
            whiteSpace: 'nowrap',
            opacity: o,
            textDecoration: sink > 0.5 ? 'line-through' : undefined,
          }}
        >
          {label}
        </div>
      ) : null}
    </>
  );
};

/** Translucent labelled area polygon. */
export const AreaPoly: React.FC<{pts: LonLat[]; color: string; start: number; label?: string; labelAt?: LonLat}> = ({pts, color, start, label, labelAt}) => {
  const f = useCurrentFrame();
  const {project} = useMap();
  const o = ramp(f, start, start + 14);
  if (o <= 0) return null;
  const P = pts.map(project);
  const [lx, ly] = project(labelAt ?? pts[0]);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}} width={1} height={1}>
        <path d={'M' + P.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L') + 'Z'} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={2} />
      </svg>
      {label ? (
        <div style={{position: 'absolute', left: lx, top: ly, transform: 'translate(-50%,-50%)', fontFamily: F.title, fontWeight: 600, fontSize: 46, color, opacity: o, textShadow: '0 0 12px #000'}}>{label}</div>
      ) : null}
    </>
  );
};

/** Range arc (radar) centred on a point; radius in miles. */
export const RangeArc: React.FC<{at: LonLat; miles: number; start: number; color?: string; from?: number; to?: number}> = ({at, miles, start, color = C.us, from = -150, to = -30}) => {
  const f = useCurrentFrame();
  const {project} = useMap();
  const o = ramp(f, start, start + 12);
  if (o <= 0) return null;
  const [cx, cy] = project(at);
  const dLat = (miles * 1.609) / 111;
  const [, ty] = project([at[0], at[1] + dLat]);
  const r = cy - ty;
  const sweep = ease(ramp(f, start, start + 40));
  const a0 = (from * Math.PI) / 180;
  const a1 = ((from + (to - from) * sweep) * Math.PI) / 180;
  const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
  const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: o}} width={1} height={1}>
      <path d={`M${cx},${cy} L${p0[0]},${p0[1]} A${r},${r} 0 0 1 ${p1[0]},${p1[1]} Z`} fill={color} fillOpacity={0.08} stroke={color} strokeOpacity={0.7} strokeWidth={1.5} />
      <path d={`M${p0[0]},${p0[1]} A${r},${r} 0 0 1 ${p1[0]},${p1[1]}`} fill="none" stroke={color} strokeWidth={3} />
    </svg>
  );
};

/** Expanding yellow strike rings (attack event). */
export const Strike: React.FC<{at: LonLat; start: number; count?: number}> = ({at, start, count = 3}) => {
  const f = useCurrentFrame();
  const {project} = useMap();
  const [x, y] = project(at);
  if (f < start) return null;
  return (
    <svg style={{position: 'absolute', left: x - 150, top: y - 150, overflow: 'visible'}} width={300} height={300}>
      {Array.from({length: count}).map((_, i) => {
        const t = (f - start - i * 9) / 30;
        if (t < 0 || t > 1.2) return null;
        return <circle key={i} cx={150} cy={150} r={8 + t * 90} fill="none" stroke={C.alert} strokeWidth={3 * (1.2 - t)} opacity={1.2 - t} />;
      })}
      <circle cx={150} cy={150} r={7} fill={C.alert} opacity={interpolate(f, [start, start + 6], [0, 1], {extrapolateRight: 'clamp'})} />
    </svg>
  );
};

/** Screen-space info card used inside map shots. */
export const MapCard: React.FC<{start: number; end?: number; kicker: string; title: string; sub?: string; x?: number; y?: number; color?: string}> = ({start, end, kicker, title, sub, x = 1310, y = 150, color = C.alert}) => {
  const f = useCurrentFrame();
  const o = ramp(f, start, start + 12) * (end ? 1 - ramp(f, end, end + 12) : 1);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 520, opacity: o, transform: `translateX(${(1 - o) * 30}px)`, background: 'rgba(6,12,17,0.82)', borderLeft: `3px solid ${color}`, padding: '18px 24px'}}>
      <div style={{fontFamily: F.mono, fontSize: 14, letterSpacing: 4, color}}>{kicker}</div>
      <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 40, color: '#fff', letterSpacing: 1.5, marginTop: 6, lineHeight: 1.05}}>{title}</div>
      {sub ? <div style={{fontFamily: F.mono, fontSize: 15, color: C.hud, marginTop: 8, letterSpacing: 1}}>{sub}</div> : null}
    </div>
  );
};
