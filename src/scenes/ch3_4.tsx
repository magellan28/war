import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {MapShot, MapCard, RangeArc, Strike} from '../map/MapShot';
import {Label, Marker, AlertRing} from '../map/Markers';
import {Route, routeHead} from '../map/Route';
import {LonLat, toWorld, west} from '../map/geo';
import {useMap} from '../map/MapStage';
import {PLACES} from '../data/pearl';
import {useScene} from '../film/context';
import {C, F} from '../theme';
import {ease, ramp} from '../art/rand';
import {AircraftSide, BattleshipSide} from '../art/vehicles';
import {FxDefs, WaterColumn} from '../art/fx';
import {Caption, DocSheet, Dossier, Finish, GraphicBg, MapBackdrop, SourceNote, Stamp} from '../ui/Panels';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------------------------------------------------------- CH3
export const C3S1: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 400], [1, 1.06], clamp);
  return (
    <AbsoluteFill>
      <MapBackdrop tint="rgba(20,6,10,0.55)" />
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <Dossier
          start={s(0) - 30}
          name="ISOROKU YAMAMOTO"
          role="ADMIRAL · COMMANDER IN CHIEF, COMBINED FLEET"
          side="jp"
          hat="navy"
          tag="IMPERIAL JAPANESE NAVY"
          x={460}
          y={280}
          w={1000}
          lines={['Studied at Harvard University', 'Naval attaché in Washington', 'Opposed war with the United States']}
        />
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};

export const C3S2: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <MapShot
      keys={[
        {f: 0, at: [165, 22], zoom: 4.2, tilt: 40},
        {f: duration, at: [162, 20], zoom: 3.95, tilt: 40, ease: (x) => x},
      ]}
      hud={{tag: 'STRATEGY · 1941', date: 'IF WAR CAME', note: 'STRIKE FIRST'}}
    >
      <Label at={[139.7, 37]} text="JAPAN" start={0} size={30} spacing={10} align="center" dx={0} weight={600} />
      <Route points={[[141.5, 36], [160, 41], [185, 36], [200, 26], [202.0, 21.6]]} progress={ramp(f, s(0) + 30, s(0) + 120)} color={C.jp} glow={C.jpGlow} spacing={56} chevronSize={11} />
      <AlertRing at={[west(157.95), 21.4]} start={s(0) + 110} r={70} />
      <Label at={[west(157.95), 21.4]} text="Pearl Harbor" sub="Cripple the fleet" start={s(0) + 110} size={24} dx={60} />
      {[
        [[130, 31], [118, 18], [101.7, 3.1]],
        [[131, 30], [124, 22], [121, 14.6]],
        [[131, 29], [122, 12], [113, -1.5]],
      ].map((pts, i) => (
        <Route key={i} points={pts as LonLat[]} progress={ramp(f, s(0) + 150 + i * 14, s(0) + 220 + i * 14)} color={C.jp} glow={C.jpGlow} spacing={50} />
      ))}
      <Label at={[101.7, 3.1]} text="Malaya" start={s(0) + 200} size={20} weight={600} align="right" />
      <Label at={[121, 14.6]} text="Philippines" start={s(0) + 210} size={20} weight={600} />
      <Label at={[113, -1.5]} text="Dutch East Indies" start={s(0) + 220} size={20} weight={600} />
    </MapShot>
  );
};

export const C3S3: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const z = interpolate(f, [0, 360], [1, 1.05], clamp);
  return (
    <AbsoluteFill>
      <GraphicBg tint="#0b1419" />
      <Caption start={s(0) - 10} kicker="11–12 NOVEMBER 1940" title="TARANTO" sub="British carrier aircraft attack the Italian fleet at anchor" />
      <svg width={1920} height={1080} style={{position: 'absolute', transform: `scale(${z})`}}>
        <FxDefs />
        <g transform="translate(960,640)">
          <path d="M-560,-60 C-420,-180 -160,-220 60,-200 C260,-180 420,-120 560,-40 L560,260 L-560,260 Z" fill="#0f1c24" stroke="rgba(200,230,235,0.5)" strokeWidth={1.5} />
          <text x={-540} y={240} fill={C.hudDim} fontFamily="JetBrains Mono" fontSize={14} letterSpacing={2}>
            SCHEMATIC · NOT TO SCALE
          </text>
          {[-300, -80, 140, 340].map((x, i) => {
            const hit = f > s(0) + 70 + i * 16;
            return (
              <g key={x} transform={`translate(${x},${-40 + i * 30}) rotate(${hit ? 6 * ramp(f, s(0) + 70 + i * 16, s(0) + 130 + i * 16) : 0})`}>
                <BattleshipSide x={-90} y={0} scale={0.3} fill={hit ? '#2a1414' : '#0a1116'} />
              </g>
            );
          })}
          {[-300, -80, 140, 340].map((x, i) => {
            const k = ramp(f, s(0) + 20 + i * 16, s(0) + 70 + i * 16);
            return <line key={i} x1={x - 40} y1={220} x2={x - 40 + (40 - 40) * k} y2={220 - (250 - i * 30) * k} stroke={C.alert} strokeWidth={2} strokeDasharray="8 6" opacity={k > 0 ? 0.9 : 0} />;
          })}
          {[-300, -80, 140, 340].map((x, i) => (
            <WaterColumn key={i} x={x - 40} y={-30 + i * 30} t={t - (s(0) + 70 + i * 16) / 30} scale={0.4} />
          ))}
        </g>
      </svg>
      <Stamp start={s(1) + 10} text="A FLEET IN HARBOR IS VULNERABLE FROM THE AIR" color={C.alert} x={960} y={960} rot={0} size={30} />
      <Finish />
    </AbsoluteFill>
  );
};

export const C3S4: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const track = interpolate(f, [0, duration], [40, -40], clamp);
  return (
    <AbsoluteFill>
      <MapBackdrop tint="rgba(20,6,10,0.6)" />
      <Caption start={0} kicker="THE PLANNERS" title="NOT ONE AUTHOR" size={52} x={120} y={90} />
      <AbsoluteFill style={{transform: `translateX(${track}px)`}}>
        <Dossier start={s(1)} name="MINORU GENDA" role="COMMANDER · AIR STAFF OFFICER" side="jp" tag="OPERATIONAL PLANNING" x={50} y={360} w={590} lines={['Worked out much of the', 'operational detail']} />
        <Dossier start={s(1) + 40} name="YAMAMOTO'S STAFF" role="COMBINED FLEET HEADQUARTERS" side="jp" hat="none" tag="REFINEMENT" x={665} y={360} w={590} lines={['Refined and war-gamed', 'the plan']} />
        <Dossier start={s(1) + 80} name="NAVAL GENERAL STAFF" role="TOKYO" side="neutral" hat="none" tag="APPROVAL · OCTOBER 1941" x={1280} y={360} w={590} lines={['Approved only after', 'Yamamoto threatened to resign']} />
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};

export const C3S5: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const surf = 560;
  const bed = 800;
  const k1 = ramp(f, s(0) + 40, s(0) + 110);
  const k2 = ramp(f, s(1) + 10, s(1) + 120);
  const dropX = 420;
  // standard torpedo: plunges deep and stops in the mud
  const p1 = (k: number): [number, number] => [dropX + k * 380, surf - 60 + Math.min(1, k * 2.2) * 330 - Math.max(0, k - 0.6) * 20];
  // finned torpedo: shallow dive, levels at ~6 m and runs to target
  const p2 = (k: number): [number, number] => [dropX + k * 1060, surf - 60 + 120 * Math.sin(Math.min(1, k * 3) * Math.PI * 0.5) - 40 * Math.max(0, k - 0.3)];
  const path = (fn: (k: number) => [number, number], k: number) => {
    const pts = Array.from({length: 40}, (_, i) => fn((i / 39) * k));
    return 'M' + pts.map((p) => p.join(',')).join('L');
  };
  return (
    <AbsoluteFill>
      <GraphicBg tint="#08141a" grid={false} />
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <FxDefs />
        <defs>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#123241" stopOpacity={0.9} />
            <stop offset="1" stopColor="#081820" stopOpacity={1} />
          </linearGradient>
        </defs>
        <rect x={0} y={surf} width={1920} height={bed - surf} fill="url(#water)" />
        <path d={`M0,${bed} C300,${bed - 10} 700,${bed + 14} 1100,${bed - 6} C1400,${bed - 14} 1700,${bed + 8} 1920,${bed} L1920,1080 L0,1080 Z`} fill="#2a2620" />
        <line x1={0} y1={surf} x2={1920} y2={surf} stroke="rgba(200,230,240,0.6)" strokeWidth={2} />
        {/* depth ruler */}
        <g stroke={C.hud} strokeWidth={1.5} fill={C.hud} fontFamily="JetBrains Mono" fontSize={16}>
          <line x1={150} y1={surf} x2={150} y2={bed} />
          <line x1={138} y1={surf} x2={162} y2={surf} />
          <line x1={138} y1={bed} x2={162} y2={bed} />
          <text x={176} y={(surf + bed) / 2} stroke="none">≈ 40 FT / 12 M</text>
        </g>
        <BattleshipSide x={1340} y={surf + 8} scale={0.75} fill="#0a1116" />
        <AircraftSide type="kate" x={interpolate(f, [s(0) + 10, s(0) + 60], [120, dropX + 120], clamp)} y={surf - 120} scale={1.4} prop={f} fill="#05080a" />
        {k1 > 0 ? (
          <>
            <path d={path(p1, k1)} stroke={C.jp} strokeWidth={3} fill="none" strokeDasharray="10 7" />
            <circle cx={p1(k1)[0]} cy={p1(k1)[1]} r={7} fill={C.jp} />
          </>
        ) : null}
        {k2 > 0 ? (
          <>
            <path d={path(p2, k2)} stroke={C.route} strokeWidth={3.5} fill="none" />
            <circle cx={p2(k2)[0]} cy={p2(k2)[1]} r={8} fill={C.route} />
          </>
        ) : null}
        <WaterColumn x={1430} y={surf} t={t - (s(1) + 122) / 30} scale={0.8} />
      </svg>
      <div style={{position: 'absolute', left: 820, top: 860, fontFamily: F.mono, fontSize: 19, letterSpacing: 2, color: C.jp, opacity: ramp(f, s(0) + 100, s(0) + 115)}}>STANDARD DROP · DIVES TOO DEEP, STRIKES BOTTOM</div>
      <div style={{position: 'absolute', left: 880, top: 600, fontFamily: F.mono, fontSize: 19, letterSpacing: 2, color: C.route, opacity: ramp(f, s(1) + 30, s(1) + 45)}}>TYPE 91 WITH WOODEN FINS · STAYS SHALLOW</div>
      <Caption start={0} kicker="THE SHALLOW-WATER PROBLEM" title="PEARL HARBOR'S DEPTH" size={52} y={90} />
      <SourceNote text="Diagram schematic, not to scale · training in Kagoshima Bay" start={s(1) + 40} />
      <Finish />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- CH4
export const C4S1: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GraphicBg tint="#0d1418" drift={0.2} />
      <div style={{position: 'absolute', inset: 0, fontFamily: F.mono, fontSize: 18, color: 'rgba(63,240,220,0.09)', lineHeight: 1.6, padding: 40, overflow: 'hidden', letterSpacing: 4, wordBreak: 'break-all'}}>
        {Array.from({length: 40}, (_, i) => Array.from({length: 70}, (_, j) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[(i * 31 + j * 17 + Math.floor(f / 3)) % 26]).join('')).join(' ')}
      </div>
      <DocSheet
        start={s(0) - 20}
        x={460}
        y={230}
        w={1000}
        mode="decrypt"
        meta="U.S. ARMY SIGNAL INTELLIGENCE SERVICE · U.S. NAVY OP-20-G"
        header="MAGIC — DIPLOMATIC DECRYPT"
        body={['SYSTEM: PURPLE (JAPANESE DIPLOMATIC CIPHER MACHINE)', 'FROM: FOREIGN MINISTRY, TOKYO', 'TO: JAPANESE EMBASSY, WASHINGTON', 'STATUS: DECRYPTED AND TRANSLATED', 'DISTRIBUTION: RESTRICTED']}
      />
      <Finish />
    </AbsoluteFill>
  );
};

export const C4S2: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const panel = (x: number, col: string, kicker: string, title: string, sub: string, start: number) => (
    <div style={{position: 'absolute', left: x, top: 300, width: 760, height: 420, border: `1px solid ${col}`, background: 'rgba(5,12,16,0.85)', padding: 40, opacity: ramp(f, start, start + 14)}}>
      <div style={{fontFamily: F.mono, fontSize: 16, letterSpacing: 5, color: col}}>{kicker}</div>
      <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 58, color: '#fff', marginTop: 16, lineHeight: 1.05}}>{title}</div>
      <div style={{fontFamily: F.label, fontSize: 22, color: C.hud, marginTop: 20}}>{sub}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <GraphicBg tint="#0b1216" />
      {panel(140, C.route, 'DIPLOMATIC TRAFFIC', 'READ', 'Purple decrypts (MAGIC) available in Washington', 0)}
      {panel(1020, C.jp, 'NAVAL OPERATIONAL CODE', 'NOT READ IN TIME', 'The strike force kept strict radio silence', s(0) + 50)}
      <Stamp start={s(0) + 120} text="RADIO SILENCE" color={C.jp} x={1400} y={800} rot={-6} size={36} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: F.mono, fontSize: 14, color: C.hudDim, opacity: ramp(f, duration - 60, duration - 40)}} />
      <Finish />
    </AbsoluteFill>
  );
};

const AREAS: {k: string; at: LonLat; name: string}[] = [
  {k: 'A', at: [west(157.951), 21.358], name: 'Ford Island – Navy Yard'},
  {k: 'B', at: [west(157.97), 21.3585], name: 'South & west of Ford Island'},
  {k: 'C', at: [west(157.944), 21.378], name: 'East Loch'},
  {k: 'D', at: [west(157.9845), 21.3825], name: 'Middle Loch'},
  {k: 'E', at: [west(158.018), 21.367], name: 'West Loch & channels'},
];

const AreaBadge: React.FC<{at: LonLat; k: string; start: number}> = ({at, k, start}) => {
  const f = useCurrentFrame();
  const {project, s} = useMap();
  const [x, y] = project(at);
  const o = ramp(f, start, start + 10);
  if (o <= 0) return null;
  const r = 0.0028 * (100000 / 360) * s; // ~300 m radius
  return (
    <>
      <svg style={{position: 'absolute', left: x - r - 4, top: y - r - 4, overflow: 'visible', opacity: o}} width={2 * r + 8} height={2 * r + 8}>
        <circle cx={r + 4} cy={r + 4} r={r} fill={C.alert} fillOpacity={0.12} stroke={C.alert} strokeWidth={2} strokeDasharray="7 5" />
      </svg>
      <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%,-50%)', fontFamily: F.title, fontWeight: 600, fontSize: 54, color: C.alert, opacity: o, textShadow: '0 0 14px #000'}}>{k}</div>
    </>
  );
};

export const C4S3: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(157.978), 21.369], zoom: 13.25, tilt: 30, rot: 0},
        {f: duration, at: [west(157.976), 21.367], zoom: 13.5, tilt: 36, rot: -4, ease: (x) => x},
      ]}
      hud={{tag: 'PEARL HARBOR · "BOMB PLOT" GRID', date: f < s(1) ? '24 SEP 1941' : '09 OCT 1941', note: f < s(1) ? 'TOKYO → HONOLULU CONSULATE (J-19)' : 'DECODED IN WASHINGTON'}}
      dof={3}
    >
      {AREAS.map((a, i) => (
        <AreaBadge key={a.k} at={a.at} k={a.k} start={s(0) + 60 + i * 18} />
      ))}
      <Label at={[west(157.96), 21.3636]} text="Ford Island" start={20} size={20} weight={600} align="center" dx={0} color={C.labelDim} />
      <MapCard start={s(0) + 160} kicker="FIVE SUB-AREAS" title="A · B · C · D · E" sub="Ships at anchor to be reported by area" />
      <Stamp start={s(1) - 4} text="DECODED 9 OCT 1941" color={C.us} x={1480} y={520} rot={-5} size={30} />
      <Stamp start={s(1) + 80} text="SIGNIFICANCE MISSED" color={C.alert} x={1480} y={620} rot={3} size={30} />
    </MapShot>
  );
};

export const C4S4: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GraphicBg tint="#0c1317" />
      <DocSheet
        start={s(0) - 24}
        x={300}
        y={150}
        w={1320}
        rot={-0.8}
        cps={60}
        meta="CHIEF OF NAVAL OPERATIONS · 27 NOVEMBER 1941 · EXCERPT"
        header="TO: CINCAF · CINCPAC"
        body={['THIS DISPATCH IS TO BE CONSIDERED A WAR WARNING.', '...', 'AN AMPHIBIOUS EXPEDITION AGAINST EITHER THE PHILIPPINES,', 'THAI OR KRA PENINSULA, OR POSSIBLY BORNEO.']}
      />
      <div style={{position: 'absolute', left: 300, top: 760, display: 'flex', gap: 24, opacity: ramp(f, s(1), s(1) + 12)}}>
        {['PHILIPPINES', 'THAILAND / KRA', 'BORNEO', 'HAWAII'].map((t, i) => (
          <div key={t} style={{padding: '12px 22px', border: `2px ${i === 3 ? 'dashed' : 'solid'} ${i === 3 ? 'rgba(255,255,255,0.3)' : C.alert}`, color: i === 3 ? 'rgba(255,255,255,0.3)' : C.alert, fontFamily: F.title, fontSize: 34, letterSpacing: 3, opacity: ramp(f, s(1) + i * 14, s(1) + 10 + i * 14), textDecoration: i === 3 ? 'line-through' : undefined}}>
            {t}
          </div>
        ))}
      </div>
      <Stamp start={s(1) + 70} text="HAWAII NOT NAMED" color={C.jp} x={1470} y={880} rot={-4} size={32} />
      <Finish />
    </AbsoluteFill>
  );
};

const Clock: React.FC<{x: number; y: number; label: string; hour: number; min: number; start: number}> = ({x, y, label, hour, min, start}) => {
  const f = useCurrentFrame();
  const o = ramp(f, start, start + 12);
  const m = min + ramp(f, start, start + 200) * 4;
  const ha = ((hour % 12) + m / 60) * 30 - 90;
  const ma = m * 6 - 90;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: o, textAlign: 'center', width: 260, marginLeft: -40}}>
      <svg width={180} height={180}>
        <circle cx={90} cy={90} r={80} fill="rgba(5,12,16,0.85)" stroke={C.hud} strokeWidth={2} />
        {Array.from({length: 12}).map((_, i) => (
          <line key={i} x1={90 + 68 * Math.cos((i * Math.PI) / 6)} y1={90 + 68 * Math.sin((i * Math.PI) / 6)} x2={90 + 76 * Math.cos((i * Math.PI) / 6)} y2={90 + 76 * Math.sin((i * Math.PI) / 6)} stroke={C.hud} strokeWidth={2} />
        ))}
        <line x1={90} y1={90} x2={90 + 42 * Math.cos((ha * Math.PI) / 180)} y2={90 + 42 * Math.sin((ha * Math.PI) / 180)} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        <line x1={90} y1={90} x2={90 + 64 * Math.cos((ma * Math.PI) / 180)} y2={90 + 64 * Math.sin((ma * Math.PI) / 180)} stroke={C.alert} strokeWidth={3} strokeLinecap="round" />
      </svg>
      <div style={{fontFamily: F.mono, fontSize: 15, letterSpacing: 3, color: C.hud, marginTop: 8}}>{label}</div>
    </div>
  );
};

export const C4S5: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  return (
    <MapShot
      keys={[
        {f: 0, at: [222, 30], zoom: 4.3, tilt: 40, rot: 0},
        {f: s(2), at: [222, 30], zoom: 4.3, tilt: 40, ease: (x) => x},
        {f: duration, at: [207, 25], zoom: 5.4, tilt: 44, rot: -2, ease: Easing.bezier(0.45, 0, 0.3, 1)},
      ]}
      hud={{tag: 'WASHINGTON → HAWAII', date: f < s(1) ? '06 DEC 1941' : '07 DEC 1941', time: f < s(1) ? 'NIGHT · WASHINGTON' : undefined, note: f < s(2) ? 'FOURTEEN-PART MESSAGE' : 'WARNING BY COMMERCIAL TELEGRAPH'}}
      overlay={
        <>
          <Clock x={1290} y={140} label="1:00 PM · WASHINGTON" hour={13} min={0} start={s(1) + 30} />
          <Clock x={1590} y={140} label="7:30 AM · HAWAII" hour={7} min={30} start={s(1) + 50} />
        </>
      }
    >
      <Label at={[244, 42]} text="WASHINGTON, D.C. →" sub="off map, east" start={20} size={22} align="left" dx={0} />
      <Marker at={[237.6, 37.78]} color={C.us} glow={C.usGlow} start={s(2)} r={7} pulse={false} />
      <Label at={[237.6, 37.78]} text="San Francisco" start={s(2) + 6} size={20} weight={600} align="right" />
      <Route points={[[242, 37.5], [237.6, 37.78], [220, 31], [202.2, 21.35]]} progress={ramp(f, s(2) + 10, s(2) + 110)} color={C.route} spacing={60} />
      <Marker at={[west(157.86), 21.31]} color={C.us} glow={C.usGlow} start={s(2) + 100} r={8} />
      <Label at={[west(157.86), 21.31]} text="Honolulu" start={s(2) + 104} size={20} weight={600} />
      <MapCard start={s(2) + 120} kicker="GEN. GEORGE C. MARSHALL'S WARNING" title="DELIVERED AFTER THE ATTACK" sub="Sent by commercial telegraph via San Francisco" color={C.alert} y={400} />
    </MapShot>
  );
};

export const C4S6: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const sub: LonLat = [west(157.972), 21.302];
  const wardPath: LonLat[] = [[west(157.99), 21.29], [west(157.98), 21.296], [west(157.975), 21.3]];
  const wardK = ramp(f, s(1) - 10, s(1) + 80);
  const [hx, hy] = (() => {
    const h = routeHead(wardPath, wardK);
    return [h.x, h.y];
  })();
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(157.968), 21.325], zoom: 12.4, tilt: 50, rot: 8},
        {f: duration, at: [west(157.972), 21.31], zoom: 12.9, tilt: 54, rot: 4, ease: (x) => x},
      ]}
      hud={{tag: 'PEARL HARBOR ENTRANCE', date: '07 DEC 1941', time: (fr) => (fr < s(1) + 40 ? '06:37 HAWAII TIME' : '06:45 HAWAII TIME'), note: 'POSITIONS APPROXIMATE'}}
    >
      <Route points={wardPath} progress={wardK} color={C.us} glow={C.usGlow} spacing={40} chevronSize={8} />
      <WorldUnit x={hx} y={hy} label="USS WARD" color={C.us} start={s(1) - 10} />
      <Marker at={sub} color={C.jp} glow={C.jpGlow} start={s(1) + 20} r={6} end={s(1) + 140} />
      <Label at={sub} text="Midget submarine" start={s(1) + 26} end={s(1) + 150} size={18} weight={600} dy={22} color={C.jp} />
      <Strike at={sub} start={s(1) + 90} />
      <Label at={[west(157.968), 21.34]} text="Harbor entrance channel" start={20} size={18} weight={600} align="right" color={C.labelDim} />
      <MapCard start={s(1) + 150} kicker="06:53 · REPORT SENT" title="SLOW UP THE CHAIN OF COMMAND" sub="Reports of the sinking were doubted" color={C.alert} />
    </MapShot>
  );
};

const WorldUnit: React.FC<{x: number; y: number; label: string; color: string; start: number}> = ({x, y, label, color, start}) => {
  const f = useCurrentFrame();
  const {projectWorld} = useMap();
  const [px, py] = projectWorld(x, y);
  const o = ramp(f, start, start + 10);
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: px, top: py, opacity: o}}>
      <div style={{position: 'absolute', left: -14, top: -8, width: 28, height: 16, border: `2px solid ${color}`, background: 'rgba(8,20,32,0.8)'}} />
      <div style={{position: 'absolute', left: 22, top: -12, fontFamily: F.title, fontWeight: 600, fontSize: 24, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 0 8px #000'}}>{label}</div>
    </div>
  );
};

export const C4S7: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const opana: LonLat = [west(158.01), 21.6856];
  const contactLat = 21.6856 + interpolate(f, [s(0) + 30, duration], [1.92, 1.1], clamp);
  const echo = ramp(f, s(0) + 20, s(0) + 60);
  const scope = (
    <div style={{position: 'absolute', left: 90, top: 230, width: 640, height: 470, background: '#020806', border: '2px solid #2b3a35', borderRadius: 10, overflow: 'hidden', boxShadow: '0 0 60px rgba(0,0,0,0.8)'}}>
      <svg width={640} height={470}>
        {Array.from({length: 9}).map((_, i) => (
          <line key={i} x1={i * 80} y1={0} x2={i * 80} y2={470} stroke="#123322" />
        ))}
        {Array.from({length: 6}).map((_, i) => (
          <line key={i} x1={0} y1={i * 94} x2={640} y2={i * 94} stroke="#123322" />
        ))}
        <path
          d={
            'M0,380 ' +
            Array.from({length: 160}, (_, i) => {
              const x = i * 4;
              const noise = Math.sin(i * 1.7 + f * 0.9) * 4 + Math.sin(i * 0.37 + f * 0.5) * 3;
              const pulse = i < 6 ? -220 : 0;
              const ech = Math.exp(-Math.pow((i - 112) / 5, 2)) * -200 * echo;
              return `L${x},${380 + noise + pulse + ech}`;
            }).join(' ')
          }
          fill="none"
          stroke="#62ff9a"
          strokeWidth={2.4}
        />
      </svg>
      <div style={{position: 'absolute', left: 16, top: 12, fontFamily: F.mono, fontSize: 13, color: '#62ff9a', letterSpacing: 2}}>A-SCOPE STYLE DISPLAY · GRAPHIC RECONSTRUCTION</div>
      <div style={{position: 'absolute', left: 430, top: 120, fontFamily: F.mono, fontSize: 16, color: '#62ff9a', opacity: echo}}>LARGE ECHO · ~132 MI</div>
    </div>
  );
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(158.6), 22.6], zoom: 7.2, tilt: 40, rot: 0},
        {f: duration, at: [west(158.5), 22.9], zoom: 7.0, tilt: 42, rot: 0, ease: (x) => x},
      ]}
      hud={{tag: 'OPANA RADAR STATION · NORTH SHORE', date: '07 DEC 1941', time: (fr) => (fr < s(1) ? '07:02 HAWAII TIME' : '07:20 HAWAII TIME'), note: 'PVTS LOCKARD & ELLIOTT'}}
      overlay={scope}
    >
      <Marker at={opana} color={C.us} glow={C.usGlow} start={10} r={7} />
      <Label at={opana} text="Opana" sub="SCR-270 mobile radar" start={16} size={20} />
      <RangeArc at={opana} miles={132} start={s(0) + 10} from={-120} to={-60} />
      <Marker at={[west(158.0), contactLat]} color={C.jp} glow={C.jpGlow} start={s(0) + 40} r={9} />
      <Label at={[west(158.0), contactLat]} text="Unidentified formation" start={s(0) + 50} size={20} color={C.jp} />
      <MapCard start={s(1) + 60} kicker="FORT SHAFTER INFORMATION CENTER" title="“DON'T WORRY ABOUT IT”" sub="Contact assumed to be B-17s from California (reported wording)" color={C.alert} y={160} />
    </MapShot>
  );
};
