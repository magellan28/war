import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {MapShot, MapCard, Strike} from '../map/MapShot';
import {Label, Marker, AlertRing} from '../map/Markers';
import {Route} from '../map/Route';
import {west} from '../map/geo';
import {PLACES} from '../data/pearl';
import {useScene} from '../film/context';
import {C, F} from '../theme';
import {ease, ramp} from '../art/rand';
import {BattleshipSide, AircraftSide} from '../art/vehicles';
import {Clouds, Fire, Flak, FxDefs, Sea, SmokeColumn, Tracers} from '../art/fx';
import {Finish, GraphicBg, Stamp, SourceNote} from '../ui/Panels';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------------------------------------------------------- CH1
export const C1S1: React.FC = () => {
  const {duration} = useScene();
  const f = useCurrentFrame();
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(158.03), 21.5], zoom: 9.75, tilt: 50, rot: -6},
        {f: duration, at: [west(157.98), 21.4], zoom: 10.45, tilt: 54, rot: -1, ease: Easing.bezier(0.3, 0, 0.4, 1)},
      ]}
      hud={{tag: 'OAHU · TERRITORY OF HAWAII', date: '07 DEC 1941', time: '07:48 HAWAII TIME', note: 'SUNDAY MORNING'}}
      overlay={<AbsoluteFill style={{background: `linear-gradient(to bottom, rgba(255,170,90,${0.1 * ramp(f, 20, 120)}) 0%, rgba(0,0,0,0) 30%)`}} />}
    >
      <Label at={[west(157.98), 21.6]} text="OAHU" start={20} size={34} spacing={10} align="center" dx={0} />
      <Marker at={PLACES.pearlHarbor.at} color={C.us} glow={C.usGlow} start={40} r={9} />
      <Label at={PLACES.pearlHarbor.at} text="Pearl Harbor" sub="U.S. Pacific Fleet" start={48} size={26} dx={22} dy={-18} />
    </MapShot>
  );
};

export const C1S2: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const {duration, s} = useScene();
  const pan = interpolate(f, [0, duration], [0, -260], clamp);
  const ships = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill style={{background: '#0d151b'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <FxDefs />
        <defs>
          <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a2630" />
            <stop offset="0.55" stopColor="#4a4a48" />
            <stop offset="0.75" stopColor="#8a6a4e" />
            <stop offset="1" stopColor="#2a2a2a" />
          </linearGradient>
        </defs>
        <rect width={1920} height={700} fill="url(#sky1)" />
        <Clouds seed={2} y={260} width={1920} t={t} speed={14} opacity={0.6} />
        {/* Koolau range silhouette (far parallax) */}
        <g transform={`translate(${pan * 0.2},0)`}>
          <path d="M-100,650 C40,600 120,560 220,575 C320,590 360,505 470,515 C580,525 620,470 720,488 C840,510 880,455 990,470 C1100,486 1160,530 1260,512 C1380,490 1450,540 1560,532 C1680,524 1760,566 1880,560 C1980,556 2050,590 2100,600 L2100,700 L-100,700 Z" fill="#1c262c" />
          <path d="M-100,668 C100,640 260,630 420,646 C600,664 760,630 940,642 C1120,654 1300,628 1500,646 C1700,664 1900,640 2100,650 L2100,700 L-100,700 Z" fill="#161e23" />
        </g>
        <Sea y={660} w={1920} h={420} t={t} tone="#101b22" />
        <g transform={`translate(${pan * 0.6},0)`}>
          {ships.map((i) => (
            <g key={i}>
              <BattleshipSide x={60 + i * 560} y={760 + (i % 2) * 10} scale={0.9} fill="#0a1116" />
              <SmokeColumn x={330 + i * 560} y={705} t={t - 1.5 - i * 0.9} seed={10 + i} scale={1.1} wind={22} lit density={34} />
              <Fire x={330 + i * 560} y={735} t={t - 1.5 - i * 0.9} seed={20 + i} scale={1} width={70} />
            </g>
          ))}
          <Tracers x={600} y={705} t={t - 2} seed={5} />
          <Tracers x={1300} y={705} t={t - 2.6} seed={6} />
        </g>
        <Flak x0={300} x1={1800} y0={150} y1={460} t={t - 2.2} seed={9} />
        {/* torpedo bombers low over the water, left to right */}
        {[0, 1, 2, 3].map((i) => {
          const px = interpolate(f, [s(0) - 30 + i * 18, s(0) + 160 + i * 18], [-200, 2200], clamp);
          return <AircraftSide key={i} type="kate" x={px} y={560 + i * 34} scale={1.2 - i * 0.15} rot={1.5} prop={f + i} fill="#06090c" />;
        })}
        {[0, 1, 2].map((i) => {
          const px = interpolate(f, [s(1) + i * 14, s(1) + 220 + i * 14], [-150, 2100], clamp);
          return <AircraftSide key={'v' + i} type="val" x={px} y={230 + i * 40} scale={0.8} rot={-2} prop={f} fill="#0b0f12" />;
        })}
      </svg>
      <Stamp start={s(2)} text="2,403 KILLED" color={C.alert} x={1500} y={170} rot={0} size={40} />
      <div style={{position: 'absolute', left: 84, top: 60, fontFamily: F.mono, fontSize: 13, letterSpacing: 3, color: C.hudDim}}>DIGITAL RECONSTRUCTION</div>
      <Finish grain={0.09} />
    </AbsoluteFill>
  );
};

export const C1S3: React.FC = () => {
  const {duration, s, e} = useScene();
  const f = useCurrentFrame();
  const endV = e(1);
  const titleStart = endV + 10;
  const tOut = 1 - ramp(f, duration - 18, duration - 2);
  return (
    <MapShot
      keys={[
        {f: 0, at: PLACES.pearlHarbor.at, zoom: 11.0, tilt: 54, rot: -4},
        {f: s(1) + 10, at: [west(170), 30], zoom: 4.6, tilt: 42, rot: 0, ease: Easing.bezier(0.55, 0, 0.3, 1)},
        {f: endV, at: [138, 35], zoom: 5.0, tilt: 44, rot: -2, ease: Easing.bezier(0.45, 0, 0.3, 1)},
        {f: duration, at: [136, 35.5], zoom: 5.15, tilt: 46, rot: -3, ease: (x) => x},
      ]}
      dof={5}
      overlay={
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: ramp(f, titleStart, titleStart + 20) * tOut, background: `rgba(0,0,0,${0.55 * ramp(f, titleStart, titleStart + 20)})`}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 150, letterSpacing: interpolate(f, [titleStart, duration], [30, 18], clamp), color: '#fff', paddingLeft: 20}}>PEARL HARBOR</div>
            <div style={{width: 900 * ease(ramp(f, titleStart + 6, titleStart + 30)), height: 2, background: C.jp, margin: '10px auto 22px'}} />
            <div style={{fontFamily: F.mono, fontSize: 30, letterSpacing: 16, color: C.hud}}>DECEMBER 7, 1941</div>
          </div>
        </AbsoluteFill>
      }
    >
      <Label at={[138, 36.6]} text="JAPAN" start={s(1)} size={42} spacing={14} align="center" dx={0} weight={600} />
      <Label at={[112, 36]} text="CHINA" start={s(1) + 10} size={40} spacing={14} align="center" dx={0} weight={600} color="rgba(225,235,240,0.55)" />
      <Marker at={PLACES.pearlHarbor.at} color={C.us} glow={C.usGlow} start={0} r={8} pulse={false} />
    </MapShot>
  );
};

// ---------------------------------------------------------------- CH2
const yearCard = (f: number, start: number) => ramp(f, start, start + 10);

export const C2S1: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <MapShot
      keys={[
        {f: 0, at: [124, 38.5], zoom: 5.15, tilt: 40, rot: -2},
        {f: duration, at: [120, 36.5], zoom: 5.35, tilt: 42, rot: 0, ease: (x) => x},
      ]}
      hud={{tag: 'EAST ASIA · 1931–1937', date: f < s(1) ? '18 SEP 1931' : '07 JUL 1937', note: f < s(1) ? 'MUKDEN INCIDENT' : 'MARCO POLO BRIDGE'}}
    >
      <Label at={[139.7, 37.5]} text="JAPAN" start={10} size={36} spacing={10} align="center" dx={0} weight={600} />
      <Label at={[112, 34]} text="CHINA" start={10} size={40} spacing={14} align="center" dx={0} weight={600} color="rgba(225,235,240,0.5)" />
      <Label at={[127, 46]} text="MANCHURIA" sub="Seized 1931" start={s(0)} size={30} spacing={6} align="center" dx={0} color={C.label} />
      <Route points={[[129.5, 35.8], [126.6, 38.2], [123.4, 41.8], [125.3, 43.9], [126.6, 45.7]]} progress={ramp(f, s(0), s(0) + 70)} color={C.jp} glow={C.jpGlow} spacing={46} chevronSize={9} />
      <Marker at={[123.43, 41.8]} color={C.jp} glow={C.jpGlow} start={s(0) + 20} r={7} />
      <Label at={[123.43, 41.8]} text="Mukden" start={s(0) + 26} size={18} weight={600} />
      <Marker at={[116.21, 39.85]} color={C.jp} glow={C.jpGlow} start={s(1)} r={8} />
      <Label at={[116.21, 39.85]} text="Marco Polo Bridge" sub="near Beijing · July 1937" start={s(1) + 6} size={22} align="right" />
      <Route points={[[116.2, 39.85], [117.5, 36.5], [118.8, 32.06]]} progress={ramp(f, s(1) + 30, s(1) + 110)} color={C.jp} glow={C.jpGlow} spacing={46} chevronSize={9} />
      <Route points={[[123.5, 31.0], [121.47, 31.23], [118.8, 32.06]]} progress={ramp(f, s(1) + 50, s(1) + 120)} color={C.jp} glow={C.jpGlow} spacing={46} chevronSize={9} />
      <Label at={[121.47, 31.23]} text="Shanghai" start={s(1) + 60} size={18} weight={600} dy={18} />
      <Label at={[118.8, 32.06]} text="Nanjing" start={s(1) + 90} size={18} weight={600} align="right" />
      <MapCard start={s(1) + 20} kicker="1937" title="WAR WITH CHINA" sub="Full-scale war after the Marco Polo Bridge incident" />
      {yearCard(f, 0) ? null : null}
    </MapShot>
  );
};

export const C2S2: React.FC = () => {
  const f = useCurrentFrame();
  const {s} = useScene();
  const res = [
    {k: 'IRON', icon: 'M-30,10 L30,10 L22,-14 L-22,-14 Z'},
    {k: 'RUBBER', icon: 'M0,-26 C20,-26 26,-6 26,6 C26,20 14,28 0,28 C-14,28 -26,20 -26,6 C-26,-6 -20,-26 0,-26 Z'},
    {k: 'OIL', icon: 'M0,-30 C10,-12 22,0 22,12 C22,26 12,32 0,32 C-12,32 -22,26 -22,12 C-22,0 -10,-12 0,-30 Z'},
  ];
  const bar = ease(ramp(f, s(1) + 10, s(1) + 70));
  return (
    <AbsoluteFill>
      <GraphicBg drift={0.15} />
      <div style={{position: 'absolute', left: 160, top: 140, fontFamily: F.mono, fontSize: 18, letterSpacing: 6, color: C.alert}}>WHAT THE HOME ISLANDS LACKED</div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {res.map((r, i) => {
          const o = ramp(f, s(0) + 40 + i * 22, s(0) + 56 + i * 22);
          const big = r.k === 'OIL' ? 1 + 0.12 * ramp(f, s(0) + 120, s(0) + 140) : 1;
          return (
            <g key={r.k} transform={`translate(${300 + i * 330},${370}) scale(${(1.8 + 0.2 * o) * big})`} opacity={o}>
              <circle r={46} fill="none" stroke={r.k === 'OIL' ? C.alert : C.hud} strokeWidth={1.2} />
              <path d={r.icon} fill={r.k === 'OIL' ? C.alert : 'rgba(220,235,240,0.75)'} />
            </g>
          );
        })}
      </svg>
      {res.map((r, i) => (
        <div key={r.k} style={{position: 'absolute', left: 300 + i * 330 - 100, width: 200, top: 490, textAlign: 'center', fontFamily: F.title, fontWeight: 600, fontSize: 36, letterSpacing: 6, color: r.k === 'OIL' ? C.alert : '#fff', opacity: ramp(f, s(0) + 50 + i * 22, s(0) + 66 + i * 22)}}>
          {r.k}
        </div>
      ))}
      <div style={{position: 'absolute', left: 160, top: 640, width: 1600, opacity: ramp(f, s(1) - 5, s(1) + 10)}}>
        <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: 5, color: C.hud}}>JAPAN · SOURCES OF IMPORTED OIL · c. 1940–41</div>
        <div style={{display: 'flex', height: 70, marginTop: 18, border: '1px solid rgba(255,255,255,0.2)'}}>
          <div style={{width: `${80 * bar}%`, background: `linear-gradient(90deg, ${C.us}, #2b6fb0)`, display: 'flex', alignItems: 'center', paddingLeft: 20, fontFamily: F.title, fontSize: 38, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap'}}>
            UNITED STATES · ≈ 80%
          </div>
          <div style={{width: `${20 * bar}%`, background: 'rgba(160,170,175,0.35)', display: 'flex', alignItems: 'center', paddingLeft: 14, fontFamily: F.mono, fontSize: 16, color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap'}}>
            OTHER
          </div>
        </div>
      </div>
      <SourceNote text="Sources give 75–80% of Japan's oil imports from the U.S. · see research/sources.md" start={s(1) + 30} />
      <Finish />
    </AbsoluteFill>
  );
};

export const C2S3: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <MapShot
      keys={[
        {f: 0, at: [119, 33], zoom: 5.2, tilt: 40},
        {f: duration, at: [112, 24], zoom: 5.0, tilt: 42, rot: 2, ease: Easing.bezier(0.4, 0, 0.4, 1)},
      ]}
      hud={{tag: 'SOUTHEAST ASIA · 1940', date: f < s(1) ? 'SEP 1940' : '1940–41', note: 'FRENCH INDOCHINA'}}
    >
      <Label at={[112, 34]} text="CHINA" start={0} size={40} spacing={14} align="center" dx={0} weight={600} color="rgba(225,235,240,0.5)" />
      <Label at={[106, 16]} text="FRENCH INDOCHINA" start={10} size={26} spacing={6} align="center" dx={0} weight={600} />
      <Route points={[[109.5, 23.5], [107.5, 22.3], [105.85, 21.03]]} progress={ramp(f, s(0) + 10, s(0) + 80)} color={C.jp} glow={C.jpGlow} spacing={44} chevronSize={9} />
      <Marker at={[105.85, 21.03]} color={C.jp} glow={C.jpGlow} start={s(0) + 50} r={7} />
      <Label at={[105.85, 21.03]} text="Hanoi" sub="Northern Indochina · Sept 1940" start={s(0) + 56} size={20} align="right" />
      <MapCard start={s(0) + 80} kicker="27 SEP 1940" title="TRIPARTITE PACT" sub="Japan · Germany · Italy" color={C.jp} />
      <MapCard start={s(1)} kicker="U.S. RESPONSE" title="EXPORT RESTRICTIONS" sub="Scrap iron · aviation fuel" color={C.alert} y={380} />
    </MapShot>
  );
};

export const C2S4: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const fadeOil = 1 - ramp(f, s(1) + 40, s(1) + 90);
  return (
    <MapShot
      keys={[
        {f: 0, at: [110, 18], zoom: 5.0, tilt: 42},
        {f: duration, at: [130, 22], zoom: 4.25, tilt: 40, rot: 0, ease: Easing.bezier(0.4, 0, 0.3, 1)},
      ]}
      hud={{tag: 'JULY–AUGUST 1941', date: f < s(1) ? 'JUL 1941' : f < s(1) + 60 ? '26 JUL 1941' : '01 AUG 1941', note: f < s(1) + 60 ? 'ASSETS FROZEN' : 'OIL EXPORTS HALTED'}}
    >
      <Label at={[106, 16]} text="FRENCH INDOCHINA" start={0} size={24} spacing={6} align="center" dx={0} weight={600} />
      <Route points={[[105.85, 21.03], [106.5, 16], [106.7, 10.8]]} progress={ramp(f, s(0), s(0) + 70)} color={C.jp} glow={C.jpGlow} spacing={44} chevronSize={9} />
      <Marker at={[106.7, 10.8]} color={C.jp} glow={C.jpGlow} start={s(0) + 50} r={7} />
      <Label at={[106.7, 10.8]} text="Saigon" sub="Southern Indochina · July 1941" start={s(0) + 56} size={20} align="right" />
      {/* tanker routes from the U.S. west coast, fading out */}
      <Route points={[[237.6, 37.8], [200, 35], [160, 34], [139.7, 34.6]]} progress={1} color={C.route} spacing={60} opacity={fadeOil * 0.9} />
      <Label at={[139.7, 36.6]} text="JAPAN" start={0} size={32} spacing={10} align="center" dx={0} weight={600} />
      <AlertRing at={[138.5, 36]} start={s(1) + 20} r={90} />
      <MapCard start={s(1) + 20} kicker="26 JULY 1941" title="JAPANESE ASSETS FROZEN" sub="Followed by Britain and the Dutch" color={C.alert} />
      <MapCard start={s(1) + 70} kicker="FROM 1 AUGUST 1941" title="U.S. OIL EXPORTS STOP" sub="Licences withheld; exports cease" color={C.alert} y={360} />
    </MapShot>
  );
};

export const C2S5: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <MapShot
      keys={[
        {f: 0, at: [118, 8], zoom: 4.5, tilt: 40},
        {f: s(1), at: [122, 10], zoom: 4.45, tilt: 40, ease: (x) => x},
        {f: duration - 10, at: [west(170), 25], zoom: 4.3, tilt: 44, rot: 0, ease: Easing.bezier(0.5, 0, 0.3, 1)},
      ]}
      hud={{tag: 'AUTUMN 1941', date: 'OCT–NOV 1941', note: 'THE DECISION'}}
    >
      <Label at={[114, 1.5]} text="DUTCH EAST INDIES" start={10} size={24} spacing={6} align="center" dx={0} weight={600} />
      <Marker at={[116.83, -1.27]} color={C.alert} glow={C.alertGlow} start={s(0) + 20} r={7} />
      <Label at={[116.83, -1.27]} text="Balikpapan oil" start={s(0) + 26} size={18} weight={600} />
      <Marker at={[104.75, -2.98]} color={C.alert} glow={C.alertGlow} start={s(0) + 30} r={7} />
      <Label at={[104.75, -2.98]} text="Palembang oil" start={s(0) + 36} size={18} weight={600} />
      <Route points={[[130, 30], [125, 18], [119, 6], [117, -0.5]]} progress={ramp(f, s(0) + 40, s(0) + 120)} color={C.jp} glow={C.jpGlow} spacing={50} />
      <Route points={[[106.7, 10.8], [105, 4], [104.8, -2.4]]} progress={ramp(f, s(0) + 60, s(0) + 120)} color={C.jp} glow={C.jpGlow} spacing={50} />
      <Marker at={PLACES.pearlHarbor.at} color={C.us} glow={C.usGlow} start={s(1) + 20} r={11} />
      <Label at={PLACES.pearlHarbor.at} text="U.S. PACIFIC FLEET" sub="Pearl Harbor · since 1940" start={s(1) + 30} size={28} />
    </MapShot>
  );
};
