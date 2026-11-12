import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {MapShot, MapCard, ShipSymbol} from '../map/MapShot';
import {Label, Marker} from '../map/Markers';
import {LonLat, west} from '../map/geo';
import {PLACES} from '../data/pearl';
import {useScene} from '../film/context';
import {C, F} from '../theme';
import {ease, ramp} from '../art/rand';
import {AircraftSide, BattleshipSide, CarrierSide, HullCapsized} from '../art/vehicles';
import {Clouds, Fire, FxDefs, Sea, SmokeColumn, Sparks} from '../art/fx';
import {Caption, Dossier, Finish, GraphicBg, MapBackdrop, SourceNote, Stamp, Stat, typeOn} from '../ui/Panels';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------------------------------------------------------- CH7
export const C7S1: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #15191c 0%, #050607 100%)'}} />
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.35}}>
        <FxDefs />
        <SmokeColumn x={400} y={1100} t={t + 3} seed={71} scale={2.4} wind={10} density={30} />
        <SmokeColumn x={1500} y={1100} t={t + 4} seed={72} scale={2.4} wind={8} density={30} />
      </svg>
      <div style={{position: 'absolute', left: 160, top: 180, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '70px 140px'}}>
        <Stat start={s(0)} value={2403} label="AMERICANS KILLED" sub="including 68 civilians" size={140} dur={70} />
        <Stat start={s(0) + 70} value={1178} label="WOUNDED" size={140} dur={60} />
        <Stat start={s(1)} value={8} label="BATTLESHIPS DAMAGED" sub="4 sunk" size={110} color={C.alert} dur={24} />
        <Stat start={s(1) + 60} value={180} suffix="+" label="AIRCRAFT DESTROYED" sub="tallies vary: 169–188" size={110} color={C.alert} dur={40} />
      </div>
      <SourceNote text="NPS · National WWII Museum · figures as most commonly cited" start={s(1) + 80} />
      <Finish grain={0.1} />
    </AbsoluteFill>
  );
};

export const C7S2: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const track = interpolate(f, [0, duration], [30, -30], clamp);
  return (
    <AbsoluteFill>
      <MapBackdrop tile="geo/oahu_1_1.webp" tint="rgba(4,10,18,0.6)" />
      <Caption start={0} kicker="USS WEST VIRGINIA" title="UNDER FIRE" size={48} y={90} color={C.us} />
      <AbsoluteFill style={{transform: `translateX(${track}px)`}}>
        <Dossier start={s(0)} name="DORIS “DORIE” MILLER" role="MESS ATTENDANT SECOND CLASS · U.S. NAVY" side="us" hat="navy" tag="NAVY CROSS" x={130} y={330} w={800} lines={['Carried his mortally wounded captain to shelter', 'Manned an anti-aircraft machine gun', 'First African American to receive the Navy Cross']} />
        <Dossier start={s(1) + 60} name="MERVYN S. BENNION" role="CAPTAIN · COMMANDING OFFICER" side="us" hat="navy" tag="MEDAL OF HONOR · POSTHUMOUS" x={990} y={330} w={800} lines={['Mortally wounded on the bridge', 'Continued to direct his ship']} />
      </AbsoluteFill>
      <Finish />
    </AbsoluteFill>
  );
};

export const C7S3: React.FC = () => {
  const {s} = useScene();
  return (
    <AbsoluteFill>
      <MapBackdrop tile="geo/oahu_1_1.webp" tint="rgba(4,10,18,0.6)" />
      <Caption start={0} kicker="NAVAL AIR STATION KANEOHE BAY" title="UNDER STRAFING ATTACK" size={48} y={90} color={C.us} />
      <Dossier start={s(0)} name="JOHN W. FINN" role="CHIEF AVIATION ORDNANCEMAN · U.S. NAVY" side="us" hat="navy" tag="MEDAL OF HONOR" x={560} y={340} w={800} lines={['Fired a machine gun from an exposed position', 'Wounded many times, kept firing']} />
      <Finish />
    </AbsoluteFill>
  );
};

export const C7S4: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const drift = interpolate(f, [0, duration], [0, -180], clamp);
  return (
    <AbsoluteFill style={{background: '#030507'}}>
      <svg width={1920} height={1080}>
        <FxDefs />
        <rect width={1920} height={700} fill="#05080b" />
        <Sea y={640} w={1920} h={440} t={t * 0.5} tone="#060c10" seed={14} />
        <g transform={`translate(${drift},0)`}>
          <HullCapsized x={300} y={650} scale={2.2} fill="#1b2328" />
          <Sparks x={900 + drift * 0} y={560} t={t - (s(1) - 10) / 30} seed={81} />
          <Sparks x={1350} y={572} t={t - (s(1) + 30) / 30} seed={82} />
          <circle cx={1100} cy={420} r={420} fill="url(#g-glow)" opacity={0.2 + 0.05 * Math.sin(t * 7)} />
        </g>
        {/* work lights */}
        {[700, 1300].map((x, i) => (
          <polygon key={i} points={`${x},80 ${x - 220},640 ${x + 220},640`} fill="#fff3d0" opacity={0.05 + 0.01 * Math.sin(t * 2 + i)} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 100, opacity: ramp(f, s(0), s(0) + 12)}}>
        <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 54, color: '#fff', letterSpacing: 3}}>USS OKLAHOMA · CAPSIZED</div>
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.hud, letterSpacing: 3}}>CIVILIAN YARD WORKERS LED BY JULIO DECASTRO</div>
      </div>
      <div style={{position: 'absolute', right: 140, bottom: 140}}>
        <Stat start={s(1) + 60} value={32} label="SAILORS RESCUED ALIVE" sub="cutting through the hull for more than a day" size={150} color={C.us} dur={40} />
      </div>
      <div style={{position: 'absolute', left: 84, bottom: 50, fontFamily: F.mono, fontSize: 13, letterSpacing: 3, color: C.hudDim}}>DIGITAL RECONSTRUCTION</div>
      <Finish grain={0.1} />
    </AbsoluteFill>
  );
};

export const C7S5: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <MapBackdrop tint="rgba(20,6,10,0.62)" />
      <div style={{position: 'absolute', left: 160, top: 110, display: 'flex', gap: 120, opacity: 1 - ramp(f, s(1) - 20, s(1))}}>
        <Stat start={s(0)} value={29} label="AIRCRAFT LOST" size={120} color={C.jp} dur={24} />
        <Stat start={s(0) + 20} value={5} label="MIDGET SUBMARINES" size={120} color={C.jp} dur={16} />
        <Stat start={s(0) + 40} value={64} label="SERVICEMEN KILLED" sub="figures vary by source" size={120} color={C.jp} dur={24} />
      </div>
      <Dossier start={s(0) + 100} name="KAZUO SAKAMAKI" role="ENSIGN · MIDGET SUBMARINE COMMANDER" side="jp" tag="CAPTURED · FIRST JAPANESE PRISONER OF THE WAR" x={160} y={480} w={760} lines={['Came ashore on Oahu after his submarine', 'failed to enter the harbor']} />
      <Dossier start={s(1)} name="FUSATA IIDA" role="LIEUTENANT · ZERO FIGHTER PILOT" side="jp" tag="KILLED AT KANEOHE" x={1000} y={480} w={760} lines={['Fighter hit and leaking fuel', 'Crashed at the air station; a marker stands there']} />
      <Finish />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- CH8
export const C8S1: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const tilt = interpolate(f, [0, duration], [40, -40], clamp);
  const quote = 'YESTERDAY, DECEMBER 7TH, 1941 — A DATE WHICH WILL LIVE IN INFAMY — THE UNITED STATES OF AMERICA WAS SUDDENLY AND DELIBERATELY ATTACKED BY NAVAL AND AIR FORCES OF THE EMPIRE OF JAPAN.';
  const draw = ease(ramp(f, 0, 80));
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0d1620, #05080b)'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', transform: `translateY(${tilt}px)`, opacity: 0.85}}>
        <g fill="none" stroke="rgba(200,225,235,0.55)" strokeWidth={2} strokeDasharray="4000" strokeDashoffset={4000 * (1 - draw)}>
          {/* Capitol dome line illustration */}
          <path d="M560,860 L1360,860 M600,860 L600,760 L1320,760 L1320,860 M640,760 L640,700 L1280,700 L1280,760" />
          {Array.from({length: 16}).map((_, i) => (
            <path key={i} d={`M${660 + i * 40},700 L${660 + i * 40},760`} />
          ))}
          <path d="M760,700 L760,620 L1160,620 L1160,700 M800,620 C800,430 1120,430 1120,620 M840,620 L840,560 M1080,620 L1080,560" />
          <path d="M900,470 C900,400 1020,400 1020,470 M940,430 L940,380 L980,380 L980,430 M960,380 L960,330" />
          {Array.from({length: 9}).map((_, i) => (
            <path key={'c' + i} d={`M${820 + i * 35},615 L${820 + i * 35},560`} />
          ))}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 200, right: 200, top: 120, textAlign: 'center', fontFamily: F.title, fontWeight: 500, fontSize: 52, lineHeight: 1.25, letterSpacing: 2, color: '#fff', textShadow: '0 0 30px #000'}}>
        {typeOn(quote, f, s(1) - 4, 13.2)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: F.mono, fontSize: 18, letterSpacing: 5, color: C.alert, opacity: ramp(f, s(1) + 30, s(1) + 44)}}>
        PRESIDENT FRANKLIN D. ROOSEVELT · JOINT SESSION OF CONGRESS · 8 DECEMBER 1941
      </div>
      <SourceNote text="Quotation read by the narrator · not archival audio" start={s(1) + 40} />
      <Finish />
    </AbsoluteFill>
  );
};

export const C8S2: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  const bar = (label: string, yes: number, no: number, start: number, y: number) => {
    const k = ease(ramp(f, start, start + 40));
    const total = yes + no;
    return (
      <div style={{position: 'absolute', left: 200, top: y, width: 1520, opacity: ramp(f, start - 6, start + 6)}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 20, letterSpacing: 4, color: C.hud}}>
          <span>{label}</span>
          <span>
            <b style={{color: '#fff'}}>{Math.round(yes * k)}</b> YES · <b style={{color: C.alert}}>{no}</b> NO
          </span>
        </div>
        <div style={{display: 'flex', height: 56, marginTop: 12, border: '1px solid rgba(255,255,255,0.2)'}}>
          <div style={{width: `${(yes / total) * 100 * k}%`, background: `linear-gradient(90deg, ${C.us}, #2b6fb0)`}} />
          <div style={{width: `${Math.max(0.6, (no / total) * 100) * k}%`, background: C.alert}} />
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <GraphicBg tint="#0a1520" />
      <Caption start={0} kicker="8 DECEMBER 1941" title="DECLARATION OF WAR ON JAPAN" size={56} y={90} color={C.us} />
      {bar('SENATE', 82, 0, s(0) + 50, 360)}
      {bar('HOUSE OF REPRESENTATIVES', 388, 1, s(0) + 90, 520)}
      <div style={{position: 'absolute', left: 200, top: 700, fontFamily: F.mono, fontSize: 16, color: C.hudDim, letterSpacing: 2, opacity: ramp(f, s(0) + 140, s(0) + 154)}}>
        The single vote against: Rep. Jeannette Rankin of Montana
      </div>
      <MapLess start={s(1)} />
      <Finish />
    </AbsoluteFill>
  );
};

const MapLess: React.FC<{start: number}> = ({start}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 200, top: 790, display: 'flex', gap: 30, alignItems: 'center', opacity: ramp(f, start, start + 14)}}>
      <div style={{fontFamily: F.title, fontSize: 46, color: '#fff', letterSpacing: 3}}>11 DECEMBER 1941</div>
      <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: 3, color: C.alert}}>GERMANY AND ITALY DECLARE WAR ON THE UNITED STATES</div>
    </div>
  );
};

export const C8S3: React.FC = () => {
  const {duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const speed = 120;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#0c1218, #07090b)'}}>
      <svg width={1920} height={1080}>
        <FxDefs />
        {/* factory trusses */}
        {Array.from({length: 14}).map((_, i) => (
          <path key={i} d={`M${i * 160 - ((t * 20) % 160)},120 L${i * 160 + 80 - ((t * 20) % 160)},40 L${i * 160 + 160 - ((t * 20) % 160)},120`} fill="none" stroke="rgba(160,190,200,0.18)" strokeWidth={3} />
        ))}
        <rect x={0} y={120} width={1920} height={6} fill="rgba(160,190,200,0.2)" />
        {Array.from({length: 6}).map((_, i) => (
          <polygon key={'l' + i} points={`${200 + i * 320},126 ${120 + i * 320},640 ${280 + i * 320},640`} fill="#ffe7b0" opacity={0.035} />
        ))}
        {/* assembly line */}
        <rect x={0} y={760} width={1920} height={20} fill="#1b2328" />
        {Array.from({length: 40}).map((_, i) => (
          <rect key={'r' + i} x={((i * 60 - t * speed) % 2400 + 2400) % 2400 - 240} y={780} width={6} height={30} fill="#11171b" />
        ))}
        {Array.from({length: 7}).map((_, i) => {
          const x = (((i * 360 - t * speed) % 2520) + 2520) % 2520 - 300;
          return <AircraftSide key={i} type="b17" x={x} y={690} scale={2.4} fill="#33414a" />;
        })}
        {[520, 1180].map((x, i) => (
          <Sparks key={i} x={x} y={670} t={t + i} seed={90 + i} />
        ))}
      </svg>
      <Caption start={6} kicker="THE HOME FRONT" title="A NATION MOBILIZES" size={52} y={860} color={C.us} />
      <SourceNote text="Illustrative production line · no figures implied" start={20} />
      <Finish grain={0.09} />
    </AbsoluteFill>
  );
};

export const C8S4: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const rise = ease(ramp(f, s(0) + 10, s(0) + 120));
  const second = ramp(f, s(1) - 20, s(1));
  const pull = interpolate(f, [s(1), duration], [1, 0.8], clamp);
  return (
    <AbsoluteFill style={{background: '#0b1116'}}>
      <svg width={1920} height={1080}>
        <FxDefs />
        <defs>
          <linearGradient id="sky8" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a2834" />
            <stop offset="1" stopColor="#6b7680" />
          </linearGradient>
        </defs>
        <rect width={1920} height={700} fill="url(#sky8)" />
        <Clouds seed={8} y={240} width={1920} t={t} speed={10} opacity={0.6} />
        <Sea y={680} w={1920} h={400} t={t} tone="#13222b" seed={15} />
        <g opacity={1 - second}>
          <g transform={`translate(380,${800 - rise * 60})`}>
            <BattleshipSide x={0} y={0} scale={1.6} fill="#0b1217" />
          </g>
          <rect x={360} y={760} width={1000} height={90} fill="#13222b" opacity={0.85 * (1 - rise)} />
          <text x={380} y={300} fill="#fff" fontFamily="Barlow Condensed" fontSize={54} letterSpacing={3} opacity={ramp(f, s(0) + 30, s(0) + 44)}>
            USS WEST VIRGINIA · RAISED, REBUILT, RETURNED
          </text>
        </g>
        <g opacity={second} transform={`translate(960,720) scale(${pull}) translate(-960,-720)`}>
          {Array.from({length: 6}).map((_, i) => {
            const st = s(1) + i * 16;
            const k = ease(ramp(f, st, st + 40));
            return <CarrierSide key={i} x={-300 + i * 380 + (1 - k) * 200} y={740 - i * 14} scale={0.55 - i * 0.03} fill="#0a1014" opacity={k} />;
          })}
        </g>
      </svg>
      <SourceNote text="Silhouettes generic · illustrative" start={30} />
      <Finish />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- CH9
export const C9S1: React.FC = () => {
  const {duration, s} = useScene();
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(175), 30], zoom: 4.1, tilt: 42},
        {f: duration, at: [west(170), 29], zoom: 4.3, tilt: 44, ease: (x) => x},
      ]}
      hud={{tag: 'STRATEGIC BALANCE', date: 'DECEMBER 1941', note: 'TACTICAL SUCCESS · STRATEGIC CATASTROPHE'}}
    >
      <Marker at={PLACES.pearlHarbor.at} color={C.us} glow={C.usGlow} start={0} r={9} />
      <Label at={PLACES.pearlHarbor.at} text="Pearl Harbor" start={6} size={22} />
      <MapCard start={s(1) + 50} kicker="MISSED" title="THE CARRIERS" sub="At sea on 7 December" color={C.us} y={140} />
      <MapCard start={s(1) + 80} kicker="LEFT WORKING" title="THE BASE" sub="Fuel, repair yards, submarines" color={C.us} y={300} />
      <MapCard start={s(1) + 110} kicker="PROVOKED" title="AMERICAN INDUSTRY" sub="Mobilised for total war" color={C.us} y={460} />
    </MapShot>
  );
};

export const C9S2: React.FC = () => {
  const {duration, s} = useScene();
  const f = useCurrentFrame();
  const midway: LonLat = [west(177.37), 28.21];
  const names = ['AKAGI', 'KAGA', 'SORYU', 'HIRYU'];
  return (
    <MapShot
      keys={[
        {f: 0, at: [west(178), 31], zoom: 5.4, tilt: 44},
        {f: duration, at: [west(178.5), 30.2], zoom: 6.2, tilt: 48, rot: -3, ease: Easing.bezier(0.4, 0, 0.3, 1)},
      ]}
      hud={{tag: 'BATTLE OF MIDWAY', date: '04 JUN 1942', note: 'SIX MONTHS LATER'}}
    >
      <Marker at={midway} color={C.us} glow={C.usGlow} start={0} r={9} />
      <Label at={midway} text="Midway Atoll" start={6} size={24} />
      {names.map((n, i) => (
        <ShipSymbol key={n} at={[west(179.5 + (i % 2) * 2.4), 30.0 + Math.floor(i / 2) * 1.6]} heading={-30} color={C.jp} start={s(0) + 20 + i * 8} label={n} len={46} struck={s(0) + 90 + i * 14} sunk={s(0) + 120 + i * 14} />
      ))}
      <MapCard start={s(0) + 160} kicker="JUNE 1942" title="FOUR CARRIERS SUNK" sub="All four had attacked Pearl Harbor" color={C.alert} />
    </MapShot>
  );
};

export const C9S3: React.FC = () => {
  const {s} = useScene();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <GraphicBg tint="#101418" grid={false} />
      <div style={{position: 'absolute', left: 260, right: 260, top: 300, textAlign: 'center', fontFamily: F.title, fontWeight: 300, fontSize: 64, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3, opacity: ramp(f, 0, 20)}}>
        “I FEAR ALL WE HAVE DONE IS TO AWAKEN A SLEEPING GIANT...”
      </div>
      <Stamp start={s(0) + 70} text="NO EVIDENCE YAMAMOTO SAID IT" color={C.jp} x={960} y={600} rot={-5} size={44} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center', fontFamily: F.mono, fontSize: 19, letterSpacing: 3, color: C.hud, opacity: ramp(f, s(0) + 140, s(0) + 154)}}>
        THE LINE FIRST APPEARS IN THE 1970 FILM “TORA! TORA! TORA!”
      </div>
      <Finish />
    </AbsoluteFill>
  );
};

export const C9S4: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const wipe = ease(ramp(f, s(0) - 30, s(0) + 50));
  const track = interpolate(f, [0, duration], [0, -420], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* 1941: burning harbor */}
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <FxDefs />
        <rect width={1920} height={700} fill="#2a2522" />
        <Sea y={680} w={1920} h={400} t={t} tone="#101a20" seed={16} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <BattleshipSide x={140 + i * 600} y={760} scale={0.85} fill="#0a0f12" />
            <SmokeColumn x={360 + i * 600} y={720} t={t + 2 + i} seed={100 + i} scale={1.3} wind={20} lit />
            <Fire x={360 + i * 600} y={740} t={t + 2} seed={110 + i} scale={1} />
          </g>
        ))}
        <text x={120} y={160} fill="#fff" fontFamily="Barlow Condensed" fontSize={64} letterSpacing={6}>
          PEARL HARBOR · 1941
        </text>
      </svg>
      {/* 1945: Tokyo Bay */}
      <svg width={1920} height={1080} style={{position: 'absolute', clipPath: `inset(0 0 0 ${(1 - wipe) * 100}%)`}}>
        <FxDefs />
        <defs>
          <linearGradient id="sky9" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5d7584" />
            <stop offset="1" stopColor="#c9c3b2" />
          </linearGradient>
        </defs>
        <rect width={1920} height={700} fill="url(#sky9)" />
        <Clouds seed={12} y={200} width={1920} t={t} speed={6} opacity={0.8} />
        <path d="M0,640 L300,600 L520,620 L760,560 L980,610 L1300,590 L1600,620 L1920,600 L1920,700 L0,700 Z" fill="#7d8a8f" opacity={0.6} />
        <Sea y={680} w={1920} h={400} t={t} tone="#233845" seed={17} />
        <g transform={`translate(${track},0)`}>
          {Array.from({length: 24}).map((_, i) => {
            const row = i % 3;
            const sc = [0.34, 0.5, 0.8][row];
            const y = [705, 735, 800][row];
            const x = i * 190 + row * 80 - 100;
            return i % 4 === 0 ? <CarrierSide key={i} x={x} y={y} scale={sc} fill={['#56626a', '#3d4a52', '#26323a'][row]} /> : <BattleshipSide key={i} x={x} y={y} scale={sc} fill={['#56626a', '#3d4a52', '#26323a'][row]} />;
          })}
        </g>
        <text x={1800} y={160} textAnchor="end" fill="#fff" fontFamily="Barlow Condensed" fontSize={64} letterSpacing={6}>
          TOKYO BAY · 2 SEPTEMBER 1945
        </text>
      </svg>
      <div style={{position: 'absolute', left: (1 - wipe) * 1920 - 1, top: 0, bottom: 0, width: 2, background: '#fff', opacity: wipe > 0 && wipe < 1 ? 0.8 : 0}} />
      <div style={{position: 'absolute', right: 120, top: 220, textAlign: 'right', fontFamily: F.mono, fontSize: 20, letterSpacing: 3, color: '#fff', opacity: ramp(f, s(1) + 20, s(1) + 34), textShadow: '0 0 10px #000'}}>
        PRESENT: USS WEST VIRGINIA
      </div>
      <SourceNote text="Digital reconstruction · ship silhouettes generic" start={s(0)} />
      <Finish grain={0.08} />
    </AbsoluteFill>
  );
};

export const C9S5: React.FC = () => {
  const {s, duration} = useScene();
  const f = useCurrentFrame();
  const t = f / 30;
  const push = interpolate(f, [0, duration], [1, 1.08], clamp);
  const titleAt = s(1) + 200;
  return (
    <AbsoluteFill style={{background: '#06090c'}}>
      <svg width={1920} height={1080} style={{transform: `scale(${push})`}}>
        <defs>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1824" />
            <stop offset="0.7" stopColor="#3f4552" />
            <stop offset="1" stopColor="#8a6f5c" />
          </linearGradient>
          <radialGradient id="sheen">
            <stop offset="0" stopColor="#9d7cc4" stopOpacity={0.35} />
            <stop offset="0.5" stopColor="#5ab0a5" stopOpacity={0.2} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1920} height={640} fill="url(#dusk)" />
        <Sea y={620} w={1920} h={460} t={t * 0.6} tone="#101c24" seed={18} />
        {/* submerged hull outline */}
        <path d="M360,760 C420,720 1500,720 1560,760 C1500,790 420,790 360,760 Z" fill="#0b151b" stroke="rgba(150,180,190,0.15)" />
        {/* memorial structure spanning the hull */}
        <path d="M640,640 L1280,640 L1260,600 C1100,640 820,640 660,600 Z" fill="#e9ecee" />
        <rect x={640} y={640} width={640} height={12} fill="#cfd5d8" />
        {Array.from({length: 7}).map((_, i) => (
          <rect key={i} x={700 + i * 85} y={612} width={20} height={20} fill="#9aa4aa" />
        ))}
        <rect x={950} y={540} width={4} height={70} fill="#d8dde0" />
        <path d="M954,544 L1000,552 L954,560 Z" fill="#c9d0d4" />
        <ellipse cx={1000 + Math.sin(t * 0.4) * 40} cy={790} rx={220} ry={20} fill="url(#sheen)" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', opacity: ramp(f, s(0) + 40, s(0) + 60) * (1 - ramp(f, titleAt - 40, titleAt - 10))}}>
        <div style={{fontFamily: F.title, fontSize: 40, color: '#fff', letterSpacing: 6}}>USS ARIZONA MEMORIAL</div>
        <div style={{fontFamily: F.mono, fontSize: 18, color: C.hud, letterSpacing: 4, marginTop: 10}}>MORE THAN 900 CREW REMAIN ENTOMBED</div>
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: ramp(f, titleAt, titleAt + 30), background: `rgba(0,0,0,${0.6 * ramp(f, titleAt, titleAt + 30)})`}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 130, letterSpacing: 22, color: '#fff', paddingLeft: 22}}>PEARL HARBOR</div>
          <div style={{width: 760, height: 2, background: C.jp, margin: '10px auto 22px'}} />
          <div style={{fontFamily: F.mono, fontSize: 28, letterSpacing: 14, color: C.hud}}>DECEMBER 7, 1941</div>
        </div>
      </AbsoluteFill>
      <Finish grain={0.08} />
    </AbsoluteFill>
  );
};
