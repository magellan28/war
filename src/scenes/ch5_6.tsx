import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {MapShot, MapCard, ShipSymbol, Strike} from '../map/MapShot';
import {Label, Marker, AlertRing} from '../map/Markers';
import {Route, routeHead} from '../map/Route';
import {CarrierGroupSymbol} from '../map/UnitSymbol';
import {useMap} from '../map/MapStage';
import {LonLat, toWorld, west} from '../map/geo';
import {FIRST_WAVE_TRACK, KIDO_BUTAI_TRACK, PLACES} from '../data/pearl';
import berths from '../data/berths.json';
import {useScene} from '../film/context';
import {C, F} from '../theme';
import {ease, ramp} from '../art/rand';
import {AircraftSide, BattleshipSide, CarrierSide, CarrierTop, HullCapsized} from '../art/vehicles';
import {Clouds, Explosion, Fire, Flak, FxDefs, Sea, SmokeColumn, Tracers, WaterColumn} from '../art/fx';
import {Caption, Finish, GraphicBg, SourceNote, Stamp, Stat} from '../ui/Panels';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const B = berths as unknown as Record<string, LonLat>;
const ROW_HEADING = -33; // screen rotation of Battleship Row (berths.json axis)

// ---------------------------------------------------------------- CH5
const DIVS = [
  {div: 'CARRIER DIVISION 1', ships: ['AKAGI', 'KAGA']},
  {div: 'CARRIER DIVISION 2', ships: ['SORYU', 'HIRYU']},
  {div: 'CARRIER DIVISION 5', ships: ['SHOKAKU', 'ZUIKAKU']},
];

export const C5S1: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const rot = interpolate(f, [0, duration], [-4, 2], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #0f2230 0%, #050b10 100%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform={`translate(960,560) rotate(${rot}) translate(-960,-560)`}>
          <Sea y={0} w={1920} h={1080} t={t} tone="#0a1720" seed={8} />
          {DIVS.map((d, r) =>
            d.ships.map((name, c) => {
              const i = r * 2 + c;
              const st = s(1) + i * 14;
              const o = ramp(f, st - 10, st + 6);
              const x = 520 + c * 560 + t * 6;
              const y = 330 + r * 210;
              return (
                <g key={name} opacity={o}>
                  <path d={`M${x - 340},${y} L${x},${y - 8} L${x},${y + 8} Z`} fill="rgba(220,235,240,0.08)" />
                  <CarrierTop x={x} y={y} scale={1.25} fill="#0a0f12" deck="#3a3530" />
                </g>
              );
            }),
          )}
        </g>
      </svg>
      {DIVS.map((d, r) =>
        d.ships.map((name, c) => {
          const i = r * 2 + c;
          const st = s(1) + i * 14;
          return (
            <div key={name} style={{position: 'absolute', left: 520 + c * 560 + 20, top: 330 + r * 210 + 34, fontFamily: F.title, fontWeight: 600, fontSize: 34, letterSpacing: 4, color: C.jp, opacity: ramp(f, st, st + 10), textShadow: '0 0 10px #000'}}>
              {name}
            </div>
          );
        }),
      )}
      {DIVS.map((d, r) => (
        <div key={d.div} style={{position: 'absolute', left: 120, top: 318 + r * 210, fontFamily: F.mono, fontSize: 14, letterSpacing: 3, color: C.hudDim, opacity: ramp(f, s(1) + r * 28, s(1) + r * 28 + 12)}}>
          {d.div}
        </div>
      ))}
      <Caption start={s(0) - 10} kicker="KIDO BUTAI · MOBILE STRIKING FORCE" title="VICE ADMIRAL CHUICHI NAGUMO" size={48} y={70} color={C.jp} />
      <SourceNote text="Formation schematic · carrier silhouettes generic" start={30} />
      <Finish />
    </AbsoluteFill>
  );
};

export const C5S2: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  const groups: {n: number; label: string; ring: number; shape: 'bb' | 'ca' | 'cl' | 'dd' | 'ss' | 'ao'}[] = [
    {n: 2, label: 'BATTLESHIPS', ring: 170, shape: 'bb'},
    {n: 2, label: 'HEAVY CRUISERS', ring: 230, shape: 'ca'},
    {n: 1, label: 'LIGHT CRUISER', ring: 290, shape: 'cl'},
    {n: 9, label: 'DESTROYERS', ring: 340, shape: 'dd'},
    {n: 3, label: 'SUBMARINES (AHEAD)', ring: 420, shape: 'ss'},
    {n: 7, label: 'TANKERS', ring: 470, shape: 'ao'},
  ];
  return (
    <AbsoluteFill>
      <GraphicBg tint="#0a1620" />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <g transform="translate(760,560)">
          {Array.from({length: 6}).map((_, i) => (
            <rect key={i} x={-60 + (i % 2) * 70} y={-90 + Math.floor(i / 2) * 60} width={44} height={16} fill={C.jp} opacity={0.9} />
          ))}
          {groups.map((g, gi) => {
            const st = s(0) + gi * 22;
            return Array.from({length: g.n}).map((_, i) => {
              const a = (i / g.n) * Math.PI * 2 + gi * 0.4 - Math.PI / 2;
              const o = ramp(f, st + i * 2, st + i * 2 + 10);
              const x = Math.cos(a) * g.ring;
              const y = Math.sin(a) * g.ring * 0.62 - (g.shape === 'ss' ? 120 : 0);
              const w = g.shape === 'bb' ? 40 : g.shape === 'ca' ? 32 : g.shape === 'ao' ? 30 : 22;
              return (
                <g key={gi + '-' + i} opacity={o} transform={`translate(${x},${y})`}>
                  <rect x={-w / 2} y={-6} width={w} height={12} fill="none" stroke={g.shape === 'ao' ? C.infra : C.jp} strokeWidth={2} strokeDasharray={g.shape === 'ss' ? '4 3' : undefined} />
                </g>
              );
            });
          })}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 1320, top: 260}}>
        {groups.map((g, gi) => (
          <div key={g.label} style={{display: 'flex', gap: 18, alignItems: 'baseline', marginBottom: 18, opacity: ramp(f, s(0) + gi * 22, s(0) + gi * 22 + 12)}}>
            <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 52, color: g.shape === 'ao' ? C.infra : C.jp, width: 70, textAlign: 'right'}}>{g.shape === 'ao' ? '·' : g.n}</div>
            <div style={{fontFamily: F.mono, fontSize: 18, letterSpacing: 3, color: '#fff'}}>{g.label}</div>
          </div>
        ))}
      </div>
      <Caption start={0} kicker="ESCORT AND SUPPORT" title="THE SCREEN" size={48} y={80} color={C.jp} />
      <SourceNote text="Tanker count varies by source (shown without number) · schematic layout" start={s(0) + 120} />
      <Finish />
    </AbsoluteFill>
  );
};

const fleetDate = (k: number) => {
  const d = Math.round(26 + k * 11);
  return d <= 30 ? `${d} NOV 1941` : `${String(d - 30).padStart(2, '0')} DEC 1941`;
};

const FleetMap: React.FC<{k0: number; k1: number; keys: Parameters<typeof MapShot>[0]['keys']; children?: React.ReactNode; note?: string; time?: string}> = ({k0, k1, keys, children, note, time}) => {
  const f = useCurrentFrame();
  const {duration} = useScene();
  const k = interpolate(f, [0, duration - 10], [k0, k1], {...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1)});
  const head = routeHead(KIDO_BUTAI_TRACK, k);
  return (
    <MapShot keys={keys} hud={{tag: 'NORTH PACIFIC · KIDO BUTAI', date: fleetDate(k), note: note ?? 'TOKYO TIME', time}} camMod={(c) => ({...c, cx: c.cx + (head.x - c.cx) * 0.6, cy: c.cy + (head.y + 700 / Math.pow(2, c.zoom) - c.cy) * 0.6})}>
      <Marker at={PLACES.hitokappu.at} color={C.jp} glow={C.jpGlow} start={0} r={7} pulse={false} />
      <Label at={PLACES.hitokappu.at} text="Hitokappu Bay" sub="Etorofu · Kuril Islands" start={6} size={24} />
      <Route points={KIDO_BUTAI_TRACK} progress={k} color={C.route} spacing={62} chevronSize={10} />
      <Label at={[178, 43.1]} text="APPROXIMATE TRACK" start={20} size={14} weight={600} spacing={4} color="rgba(63,240,220,0.75)" dx={0} dy={-26} align="center" />
      <CarrierGroupSymbol x={head.x} y={head.y} start={0} title="KIDO BUTAI" sub="6 CARRIERS · RADIO SILENCE" />
      {children}
    </MapShot>
  );
};

export const C5S3: React.FC = () => {
  const {duration} = useScene();
  return (
    <FleetMap
      k0={0}
      k1={0.42}
      keys={[
        {f: 0, at: [150, 42.5], zoom: 5.6, tilt: 44, rot: -2},
        {f: duration, at: [170, 42], zoom: 5.0, tilt: 46, rot: 0, ease: (x) => x},
      ]}
    >
      <Label at={[176, 38]} text="NORTH PACIFIC OCEAN" start={30} size={28} weight={600} spacing={14} dx={0} align="center" color="rgba(225,235,240,0.45)" />
    </FleetMap>
  );
};

export const C5S4: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <FleetMap
      k0={0.42}
      k1={0.62}
      note="SIGNAL RECEIVED"
      keys={[
        {f: 0, at: [178, 42], zoom: 5.0, tilt: 46},
        {f: duration, at: [190, 41], zoom: 5.1, tilt: 46, ease: (x) => x},
      ]}
    >
      <RingsSvg at={[139.7, 35.7]} start={s(0)} />
      <MapCard start={s(0) + 30} kicker="2 DECEMBER 1941" title="“CLIMB MOUNT NIITAKA”" sub="NIITAKAYAMA NOBORE · attack confirmed" color={C.jp} />
    </FleetMap>
  );
};

const RingsSvg: React.FC<{at: LonLat; start: number}> = ({at, start}) => {
  const f = useCurrentFrame();
  const {project} = useMap();
  const [x, y] = project(at);
  return (
    <svg style={{position: 'absolute', left: x - 1200, top: y - 1200, overflow: 'visible'}} width={2400} height={2400}>
      {Array.from({length: 6}).map((_, i) => {
        const t = ((f - start - i * 14) % 84) / 84;
        if (f - start - i * 14 < 0) return null;
        return <circle key={i} cx={1200} cy={1200} r={30 + t * 1100} fill="none" stroke={C.jp} strokeWidth={2.5} opacity={(1 - t) * 0.8} />;
      })}
    </svg>
  );
};

export const C5S5: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <FleetMap
      k0={0.62}
      k1={1}
      note="HAWAII TIME"
      time={f > duration * 0.6 ? 'BEFORE DAWN' : undefined}
      keys={[
        {f: 0, at: [192, 40], zoom: 5.1, tilt: 46},
        {f: duration, at: [west(157.8), 23.4], zoom: 7.3, tilt: 48, rot: 2, ease: Easing.bezier(0.5, 0, 0.3, 1)},
      ]}
    >
      <Label at={[west(157.7), 21.75]} text="OAHU" start={s(0) + 20} size={28} spacing={6} />
      <Marker at={PLACES.launch.at} color={C.jp} glow={C.jpGlow} start={s(0) + 60} r={8} />
      <Label at={PLACES.launch.at} text="Launch area" sub="≈ 230 miles north of Oahu" start={s(0) + 66} size={22} align="right" dx={30} dy={34} />
    </FleetMap>
  );
};

// ---------------------------------------------------------------- CH6
export const C6S1: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const deckY = 690;
  const sky = ramp(f, 0, duration);
  const planes = Array.from({length: 7}, (_, i) => i);
  return (
    <AbsoluteFill style={{background: '#06090c'}}>
      <svg width={1920} height={1080}>
        <FxDefs />
        <defs>
          <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1218" />
            <stop offset={0.6} stopColor={`rgb(${40 + 50 * sky},${44 + 30 * sky},${52 + 10 * sky})`} />
            <stop offset="1" stopColor={`rgb(${90 + 70 * sky},${70 + 40 * sky},${60 + 20 * sky})`} />
          </linearGradient>
        </defs>
        <rect width={1920} height={760} fill="url(#dawn)" />
        <Clouds seed={4} y={300} width={1920} t={t} speed={30} opacity={0.5} />
        <Sea y={750} w={1920} h={330} t={t * 2} tone="#0b141a" seed={5} />
        <g transform={`translate(0,${Math.sin(t * 0.9) * 4}) rotate(${Math.sin(t * 0.7) * 0.4} 960 740)`}>
          <CarrierSide x={250} y={760} scale={2.3} fill="#06090c" />
          {/* deck lights */}
          {Array.from({length: 12}).map((_, i) => (
            <circle key={i} cx={300 + i * 110} cy={deckY - 2} r={2.5} fill="#ffd9a0" opacity={0.5 + 0.4 * Math.sin(t * 3 + i)} />
          ))}
          {/* aircraft rolling off the bow, one after another */}
          {planes.map((i) => {
            const st = s(0) - 20 + i * 26;
            const k = (f - st) / 50;
            if (k < -0.6) return <AircraftSide key={i} type={i % 3 === 0 ? 'zero' : i % 3 === 1 ? 'kate' : 'val'} x={1100 - (i + 1) * 120 + 600} y={deckY - 14} scale={0.95} prop={f} fill="#05070a" />;
            const x = 1100 + k * 900;
            const lift = Math.max(0, k - 0.45);
            const y = deckY - 14 - lift * lift * 520;
            return <AircraftSide key={i} type={i % 3 === 0 ? 'zero' : i % 3 === 1 ? 'kate' : 'val'} x={x} y={y} rot={-lift * 18} scale={0.95 + lift * 0.2} prop={f} fill="#05070a" />;
          })}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 120, top: 120, display: 'flex', gap: 46}}>
        <Stat start={s(0) + 50} value={40} label="TORPEDO" size={74} color={C.jp} dur={24} />
        <Stat start={s(0) + 64} value={49} label="LEVEL BOMBERS" size={74} color={C.jp} dur={24} />
        <Stat start={s(0) + 78} value={51} label="DIVE BOMBERS" size={74} color={C.jp} dur={24} />
        <Stat start={s(0) + 92} value={43} label="FIGHTERS" size={74} color={C.jp} dur={24} />
        <Stat start={s(0) + 112} value={183} label="FIRST WAVE" size={74} color="#fff" dur={30} />
      </div>
      <div style={{position: 'absolute', left: 120, bottom: 70, fontFamily: F.mono, fontSize: 18, letterSpacing: 3, color: C.hud, opacity: ramp(f, s(1), s(1) + 12)}}>
        AIR COMMANDER: CDR. MITSUO FUCHIDA · 06:00–06:15 HAWAII TIME
      </div>
      <div style={{position: 'absolute', right: 84, top: 60, fontFamily: F.mono, fontSize: 13, letterSpacing: 3, color: C.hudDim}}>DIGITAL RECONSTRUCTION</div>
      <Finish grain={0.1} />
    </AbsoluteFill>
  );
};

const FIELDS: {name: string; at: LonLat; dy?: number; align?: 'left' | 'right'}[] = [
  {name: 'Wheeler Field', at: PLACES.wheeler.at},
  {name: 'NAS Kaneohe Bay', at: PLACES.kaneohe.at},
  {name: 'Ford Island', at: PLACES.fordIsland.at, align: 'right'},
  {name: 'Hickam Field', at: PLACES.hickam.at, dy: 18},
];

export const C6S2: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const split = s(1) - 10;
  const branch: LonLat = [west(158.05), 21.72];
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(158.0), 22.1], zoom: 9.2, tilt: 46, rot: 0},
        {f: duration, at: [west(157.93), 21.45], zoom: 9.85, tilt: 50, rot: -3, ease: Easing.bezier(0.4, 0, 0.3, 1)},
      ]}
      hud={{tag: 'OAHU · FIRST WAVE', date: '07 DEC 1941', time: (fr) => (fr < split ? '07:40 HAWAII TIME' : '07:48–07:55 HAWAII TIME'), note: 'AIRFIELDS ATTACKED'}}
    >
      <Route points={[[west(158.0), 23.4], [west(158.04), 22.3], branch]} progress={ramp(f, 0, split)} color={C.route} spacing={52} speed={3.2} chevronSize={12} />
      {FIELDS.map((fd, i) => (
        <React.Fragment key={fd.name}>
          <Route points={[branch, [(branch[0] + fd.at[0]) / 2 + (i - 1.5) * 0.03, (branch[1] + fd.at[1]) / 2], fd.at]} progress={ramp(f, split + i * 10, split + 70 + i * 10)} color={C.route} spacing={44} speed={3.4} chevronSize={10} />
          <Marker at={fd.at} color={C.us} glow={C.usGlow} start={8} r={7} pulse={false} />
          <Label at={fd.at} text={fd.name} start={14} size={20} weight={600} dy={fd.dy ?? -4} align={fd.align ?? 'left'} />
          <Strike at={fd.at} start={split + 70 + i * 10} count={4} />
        </React.Fragment>
      ))}
      <MapCard start={s(1) + 60} kicker="AIRCRAFT PARKED WINGTIP TO WINGTIP" title="A PRECAUTION AGAINST SABOTAGE" sub="It made them easy targets from the air" color={C.alert} />
    </MapShot>
  );
};

export const C6S3: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  const words = ['TORA', 'TORA', 'TORA'];
  return (
    <AbsoluteFill>
      <GraphicBg tint="#170a0c" grid={false} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {Array.from({length: 7}).map((_, i) => {
          const t = ((f - i * 10) % 70) / 70;
          if (f - i * 10 < 0) return null;
          return <circle key={i} cx={960} cy={540} r={60 + t * 900} fill="none" stroke={C.jp} strokeWidth={2} opacity={(1 - t) * 0.6} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: F.mono, fontSize: 22, letterSpacing: 8, color: C.hud, opacity: ramp(f, 0, 10)}}>07:53 · CDR. FUCHIDA TO THE FLEET</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', gap: 50}}>
        {words.map((w, i) => (
          <div key={i} style={{fontFamily: F.title, fontWeight: 600, fontSize: 170, letterSpacing: 10, color: C.jp, opacity: ramp(f, s(0) + 60 + i * 14, s(0) + 66 + i * 14), transform: `scale(${1.3 - 0.3 * ramp(f, s(0) + 60 + i * 14, s(0) + 70 + i * 14)})`}}>
            {w}
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 650, textAlign: 'center', fontFamily: F.mono, fontSize: 20, letterSpacing: 5, color: C.hud, opacity: ramp(f, s(0) + 110, s(0) + 125)}}>SURPRISE ACHIEVED</div>
      <Finish />
    </AbsoluteFill>
  );
};

const ROW: {key: string; label: string; side: 'left' | 'right'}[] = [
  {key: 'nevada', label: 'NEVADA', side: 'left'},
  {key: 'arizona', label: 'ARIZONA', side: 'left'},
  {key: 'vestal', label: 'Vestal', side: 'right'},
  {key: 'tennessee', label: 'TENNESSEE', side: 'left'},
  {key: 'westVirginia', label: 'WEST VIRGINIA', side: 'right'},
  {key: 'maryland', label: 'MARYLAND', side: 'left'},
  {key: 'oklahoma', label: 'OKLAHOMA', side: 'right'},
  {key: 'neosho', label: 'Neosho (oiler)', side: 'right'},
  {key: 'california', label: 'CALIFORNIA', side: 'right'},
];

export const RowShips: React.FC<{start: number; hits?: Record<string, number>; sunk?: Record<string, number>}> = ({start, hits = {}, sunk = {}}) => (
  <>
    {ROW.map((r, i) => (
      <ShipSymbol key={r.key} at={B[r.key]} heading={ROW_HEADING} color={r.key === 'vestal' || r.key === 'neosho' ? C.infra : C.us} start={start + i * 6} label={r.label} labelSide={r.side} meters={r.key === 'vestal' || r.key === 'neosho' ? 140 : 185} struck={hits[r.key]} sunk={sunk[r.key]} />
    ))}
  </>
);

export const C6S4: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const dock: LonLat = [west(157.9488), 21.3536];
  const torp = (target: LonLat, i: number) => {
    const from: LonLat = [target[0] + 0.012, target[1] - 0.006];
    return <Route key={i} points={[from, target]} progress={ramp(f, s(1) + i * 8, s(1) + 50 + i * 8)} color={C.alert} glow={C.alertGlow} spacing={26} chevronSize={7} speed={4} />;
  };
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(157.958), 21.3555], zoom: 15.2, tilt: 50, rot: 24},
        {f: duration, at: [west(157.955), 21.3595], zoom: 16.0, tilt: 56, rot: 14, ease: Easing.bezier(0.4, 0, 0.4, 1)},
      ]}
      hud={{tag: 'BATTLESHIP ROW · FORD ISLAND', date: '07 DEC 1941', time: '07:55 HAWAII TIME', note: 'BERTHS SCHEMATIC, PER DOCUMENTED ORDER'}}
      dof={3.5}
    >
      <Label at={[west(157.962), 21.366]} text="FORD ISLAND" start={0} size={26} spacing={6} weight={600} align="center" dx={0} color={C.labelDim} />
      <RowShips start={s(0)} />
      <ShipSymbol at={dock} heading={-90} color={C.us} start={s(0) + 70} label="PENNSYLVANIA · Dry Dock No. 1 (approx.)" meters={185} />
      {[B.oklahoma, B.westVirginia, B.california, B.nevada, B.arizona].map((t, i) => torp(t, i))}
    </MapShot>
  );
};

export const C6S5: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const pan = interpolate(f, [0, duration], [0, -320], clamp);
  const roll = ease(ramp(f, s(0) + 30, s(0) + 140));
  const settle = ease(ramp(f, s(1) - 10, s(1) + 110));
  return (
    <AbsoluteFill style={{background: '#0b1116'}}>
      <svg width={1920} height={1080}>
        <FxDefs />
        <defs>
          <linearGradient id="sky6" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141c22" />
            <stop offset="1" stopColor="#4f4a44" />
          </linearGradient>
        </defs>
        <rect width={1920} height={700} fill="url(#sky6)" />
        <Flak x0={100} x1={1900} y0={80} y1={420} t={t} seed={33} rate={4} />
        <Sea y={680} w={1920} h={400} t={t} tone="#0e1a21" seed={11} />
        <g transform={`translate(${pan},0)`}>
          {/* Oklahoma: rolls over */}
          <g transform={`translate(260,${740 + roll * 30}) rotate(${Math.min(roll / 0.6, 1) * 80} 300 -20)`} opacity={roll < 0.6 ? 1 : 1 - (roll - 0.6) / 0.4}>
            <BattleshipSide x={0} y={0} scale={1} fill="#0a1015" />
          </g>
          <g opacity={ramp(roll, 0.55, 0.9)}>
            <HullCapsized x={260} y={752} scale={1} fill="#141b20" />
          </g>
          <WaterColumn x={420} y={720} t={t - (s(0) + 10) / 30} scale={1.1} />
          <WaterColumn x={600} y={720} t={t - (s(0) + 22) / 30} scale={1.2} />
          {/* West Virginia: settles upright */}
          <g transform={`translate(1000,${740 + settle * 34})`}>
            <BattleshipSide x={0} y={0} scale={1} fill="#0a1015" />
          </g>
          <rect x={980} y={742} width={660} height={60} fill="#0e1a21" opacity={settle * 0.9} />
          <WaterColumn x={1200} y={730} t={t - (s(1) - 20) / 30} scale={1.2} />
          <Fire x={1260} y={700 + settle * 30} t={t - (s(1)) / 30} seed={41} scale={1.4} width={120} />
          <SmokeColumn x={1260} y={680} t={t - s(1) / 30} seed={42} scale={1.4} wind={26} lit />
          <SmokeColumn x={520} y={700} t={t - (s(0) + 40) / 30} seed={43} scale={1.2} wind={26} />
          <Tracers x={1500} y={700} t={t} seed={44} />
        </g>
        {[0, 1].map((i) => (
          <AircraftSide key={i} type="kate" x={interpolate(f, [s(0) - 30 + i * 30, s(0) + 80 + i * 30], [2100, -200], clamp)} y={600 + i * 30} scale={1.3} flip prop={f} fill="#05080a" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 100, opacity: ramp(f, s(0) + 40, s(0) + 54)}}>
        <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 54, color: '#fff', letterSpacing: 3}}>USS OKLAHOMA</div>
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.alert, letterSpacing: 3}}>CAPSIZED WITHIN MINUTES</div>
      </div>
      <div style={{position: 'absolute', right: 120, top: 100, textAlign: 'right', opacity: ramp(f, s(1) + 20, s(1) + 34)}}>
        <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 54, color: '#fff', letterSpacing: 3}}>USS WEST VIRGINIA</div>
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.alert, letterSpacing: 3}}>SANK UPRIGHT AT HER MOORINGS</div>
      </div>
      <div style={{position: 'absolute', left: 84, bottom: 50, fontFamily: F.mono, fontSize: 13, letterSpacing: 3, color: C.hudDim}}>DIGITAL RECONSTRUCTION</div>
      <Finish grain={0.1} />
    </AbsoluteFill>
  );
};

export const C6S6: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const blastF = s(0) + 70;
  const bt = (f - blastF) / 30;
  const shake = bt > 0 && bt < 1.2 ? Math.sin(f * 2.3) * 14 * (1.2 - bt) : 0;
  const zoomOut = interpolate(f, [blastF, duration], [1.08, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#090d10'}}>
      <svg width={1920} height={1080} style={{transform: `translate(${shake}px,${shake * 0.6}px) scale(${zoomOut})`}}>
        <FxDefs />
        <defs>
          <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10161b" />
            <stop offset="1" stopColor="#3d3833" />
          </linearGradient>
        </defs>
        <rect width={1920} height={720} fill="url(#sky7)" />
        <Sea y={700} w={1920} h={380} t={t} tone="#0d171d" seed={12} />
        <BattleshipSide x={560} y={770} scale={1.35} fill={bt > 0.2 ? '#140b08' : '#0a1015'} />
        <SmokeColumn x={900} y={700} t={bt - 0.3} seed={51} scale={2.6} wind={18} lit density={60} />
        <Fire x={880} y={735} t={bt} seed={52} scale={2.0} width={150} />
        <Explosion x={820} y={740} t={bt} seed={53} scale={2.4} />
        {bt > 0 && bt < 0.25 ? <rect width={1920} height={1080} fill="#fff6e0" opacity={1 - bt / 0.25} /> : null}
        {[0].map((i) => (
          <AircraftSide key={i} type="kate" x={interpolate(f, [s(0) - 10, blastF - 10], [-200, 1100], clamp)} y={260} scale={0.9} prop={f} fill="#06090c" />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 100, opacity: ramp(f, s(0), s(0) + 14)}}>
        <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 60, color: '#fff', letterSpacing: 3}}>USS ARIZONA</div>
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.alert, letterSpacing: 3}}>SHORTLY AFTER 08:00 · FORWARD MAGAZINE DETONATES</div>
      </div>
      <div style={{position: 'absolute', right: 140, bottom: 140, textAlign: 'right'}}>
        <Stat start={s(1) + 30} value={1177} label="CREW KILLED" sub="Nearly half of all Americans killed that day" size={130} dur={60} />
      </div>
      <div style={{position: 'absolute', left: 84, bottom: 50, fontFamily: F.mono, fontSize: 13, letterSpacing: 3, color: C.hudDim}}>DIGITAL RECONSTRUCTION</div>
      <Finish grain={0.11} />
    </AbsoluteFill>
  );
};

const NEVADA_PATH: LonLat[] = [B.nevada, [202.0445, 21.3585], [202.04, 21.3545], [202.0352, 21.3512], [202.0324, 21.348], [202.032, 21.3455], [202.0342, 21.3442]];

export const C6S7: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const k = ramp(f, s(1), duration - 40);
  const h = routeHead(NEVADA_PATH, k);
  const [hl, hlat] = [(h.x / 100000) * 360 - 180, (Math.atan(Math.sinh(Math.PI * (1 - (2 * h.y) / 100000))) * 180) / Math.PI];
  const hosp: LonLat = NEVADA_PATH[NEVADA_PATH.length - 1];
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(157.94), 21.37], zoom: 13.4, tilt: 50, rot: 6},
        {f: s(1), at: [west(157.955), 21.358], zoom: 15.0, tilt: 52, rot: 10},
        {f: duration, at: [west(157.964), 21.349], zoom: 15.4, tilt: 56, rot: 0, ease: Easing.bezier(0.4, 0, 0.4, 1)},
      ]}
      hud={{tag: 'SECOND WAVE · PEARL HARBOR', date: '07 DEC 1941', time: (fr) => (fr < s(1) ? '08:55 HAWAII TIME' : '≈ 09:00–09:10 HAWAII TIME'), note: 'NEVADA GETS UNDERWAY'}}
    >
      {[
        [[west(157.86), 21.44], [west(157.92), 21.39], [west(157.952), 21.36]],
        [[west(157.84), 21.4], [west(157.9), 21.36], [west(157.95), 21.335]],
        [[west(157.88), 21.46], [west(157.93), 21.4], [west(157.96), 21.37]],
      ].map((p, i) => (
        <Route key={i} points={p as LonLat[]} progress={ramp(f, i * 12, 80 + i * 12)} color={C.route} spacing={44} speed={3.5} chevronSize={10} />
      ))}
      <RowShips start={-100} hits={{arizona: 0, oklahoma: 0, westVirginia: 0, california: 0}} sunk={{arizona: 0, oklahoma: 0}} />
      <Route points={NEVADA_PATH} progress={k} color={C.us} glow={C.usGlow} spacing={30} chevronSize={8} speed={2} />
      <ShipSymbol at={[hl, hlat]} heading={(h.angle * 180) / Math.PI} color={C.us} start={s(1)} label="NEVADA" meters={175} struck={s(1) + 60} />
      <Strike at={[hl + 0.0008, hlat + 0.0006]} start={s(1) + 60} />
      <Strike at={[hl - 0.0005, hlat - 0.0004]} start={s(1) + 110} />
      <Marker at={hosp} color={C.alert} glow={C.alertGlow} start={duration - 50} r={7} />
      <Label at={hosp} text="Beached at Hospital Point" sub="channel kept clear · position approx." start={duration - 44} size={20} align="left" dx={24} />
    </MapShot>
  );
};

export const C6S8: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const carriers: {name: string; at: LonLat; note: string}[] = [
    {name: 'ENTERPRISE', at: [west(161.5), 21.6], note: 'at sea, west of Oahu (approx.)'},
    {name: 'LEXINGTON', at: [west(170), 24.5], note: 'at sea, toward Midway (approx.)'},
    {name: 'SARATOGA', at: [240.5, 32.9], note: 'U.S. West Coast'},
  ];
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(157.958), 21.36], zoom: 12.6, tilt: 52, rot: 0},
        {f: s(1), at: [west(157.98), 21.5], zoom: 10.0, tilt: 50, ease: Easing.bezier(0.45, 0, 0.4, 1)},
        {f: duration, at: [west(168), 26], zoom: 4.5, tilt: 44, rot: 0, ease: Easing.bezier(0.5, 0, 0.3, 1)},
      ]}
      hud={{tag: 'WITHDRAWAL · 7 DEC 1941', date: '07 DEC 1941', time: '≈ 10:00 HAWAII TIME', note: 'NO FURTHER STRIKE'}}
    >
      <Route points={[[west(157.95), 21.37], [west(158.02), 22.6], PLACES.launch.at]} progress={ramp(f, 10, s(1))} color={C.jp} glow={C.jpGlow} spacing={50} />
      <MapCard start={s(1) - 30} end={s(1) + 140} kicker="LEFT LARGELY INTACT" title="FUEL · REPAIR SHOPS · SUBMARINE BASE" color={C.infra} />
      {carriers.map((c, i) => (
        <React.Fragment key={c.name}>
          <ShipSymbol at={c.at} heading={0} color={C.us} start={s(1) + 80 + i * 14} label={c.name} len={44} />
          <Label at={c.at} text="" sub={c.note} start={s(1) + 86 + i * 14} size={1} dy={34} dx={30} />
        </React.Fragment>
      ))}
      <MapCard start={s(1) + 120} kicker="NOT IN PORT" title="THE PACIFIC FLEET'S CARRIERS" color={C.us} y={380} />
    </MapShot>
  );
};
