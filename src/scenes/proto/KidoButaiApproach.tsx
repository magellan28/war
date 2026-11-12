import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {cameraAt, CamKey} from '../../map/camera';
import {MapStage} from '../../map/MapStage';
import {AlertRing, Label, Marker} from '../../map/Markers';
import {Route, routeHead} from '../../map/Route';
import {CarrierGroupSymbol} from '../../map/UnitSymbol';
import {toWorld, W, west} from '../../map/geo';
import {DepthOfField, FadeFromBlack, Flash, Grain, Haze, Vignette} from '../../fx/Post';
import {ChapterTitle, Hud} from '../../fx/Hud';
import {FACTS, FIRST_WAVE_TRACK, KIDO_BUTAI_TRACK, PLACES} from '../../data/pearl';
import {C} from '../../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const inOut = Easing.bezier(0.5, 0, 0.25, 1);

// ---- timing (frames @30fps) ------------------------------------------------
const T = {
  fleetStart: 100,
  fleetEnd: 450,
  hawaii: 505,
  waveStart: 520,
  waveEnd: 640,
  harbor: 700,
  flash: 706,
  title: 712,
};

const fleetProgress = (f: number) => interpolate(f, [T.fleetStart, T.fleetEnd], [0, 1], {...clamp, easing: inOut});
const waveProgress = (f: number) => interpolate(f, [T.waveStart, T.waveEnd], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.6, 1)});

// Zoom / tilt keys; centre is blended with "follow" targets below.
const KEYS: CamKey[] = [
  {f: 0, at: [149.5, 41.2], zoom: 5.25, tilt: 40, rot: -3},
  {f: 95, at: [148.8, 42.6], zoom: 5.7, tilt: 44, rot: -2},
  {f: 270, at: [175, 42], zoom: 4.75, tilt: 46, rot: 0},
  {f: 450, at: [201.8, 26.5], zoom: 5.9, tilt: 44, rot: 2},
  {f: T.hawaii, at: [west(157.6), 22.6], zoom: 7.45, tilt: 46, rot: 2},
  {f: T.waveEnd, at: [west(158.0), 21.5], zoom: 10.0, tilt: 50, rot: 0},
  {f: T.harbor, at: PLACES.pearlHarbor.at, zoom: 10.75, tilt: 54, rot: -4},
  {f: 750, at: PLACES.pearlHarbor.at, zoom: 10.95, tilt: 56, rot: -6, ease: (t) => t},
];

const dateFor = (f: number) => {
  // Linear day counter along the transit, Tokyo time; 26 Nov -> 7 Dec.
  const d = Math.round(interpolate(f, [T.fleetStart, T.fleetEnd - 10], [26, 37], clamp));
  return d <= 30 ? `${d} NOV 1941` : `${String(d - 30).padStart(2, '0')} DEC 1941`;
};

const timeFor = (f: number) => {
  const mins = Math.round(interpolate(f, [T.waveStart, T.harbor - 10], [6 * 60, 7 * 60 + 48], clamp));
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
};

export const KidoButaiApproach: React.FC = () => {
  const frame = useCurrentFrame();
  const base = cameraAt(KEYS, frame);

  // follow the fleet's head during the transit
  const head = routeHead(KIDO_BUTAI_TRACK, fleetProgress(frame));
  const follow = interpolate(frame, [T.fleetStart, T.fleetStart + 60, T.fleetEnd - 30, T.fleetEnd + 30], [0, 0.85, 0.85, 0], {
    ...clamp,
    easing: inOut,
  });
  // keep fleet slightly below centre so the route ahead has room
  const cam = {...base, cx: base.cx + (head.x - base.cx) * follow, cy: base.cy + (head.y + 900 / Math.pow(2, base.zoom) - base.cy) * follow};

  const waveHead = routeHead(FIRST_WAVE_TRACK, waveProgress(frame));
  const followWave = interpolate(frame, [T.waveStart, T.waveStart + 30, T.waveEnd - 20, T.waveEnd + 10], [0, 0.7, 0.7, 0], clamp);
  cam.cx += (waveHead.x - cam.cx) * followWave;
  cam.cy += (waveHead.y - cam.cy) * followWave;

  const lon = (cam.cx / W) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * cam.cy) / W))) * 180) / Math.PI;

  const phaseDec7 = frame >= T.fleetEnd;
  const fleetVisible = frame < T.waveEnd;
  const dof = interpolate(frame, [0, 60, T.hawaii, T.harbor], [7, 4.5, 4, 6], clamp);
  const titleDim = interpolate(frame, [T.flash, T.title + 20], [0, 0.55], clamp);
  const [lx, ly] = toWorld(PLACES.launch.at);

  return (
    <AbsoluteFill style={{background: C.bg}}>
      <MapStage cam={cam}>
        {/* --- West Pacific context --- */}
        <Label at={[137.2, 36.4]} text="JAPAN" start={18} end={300} size={44} weight={600} spacing={14} dx={0} align="center" />
        <Label at={[176, 37.2]} text="NORTH PACIFIC OCEAN" start={150} end={420} size={30} weight={600} spacing={16} dx={0} align="center" color="rgba(225,235,240,0.45)" />
        <Label at={[186, 52.6]} text="Aleutian Islands" start={190} end={400} size={22} weight={600} color={C.labelDim} />

        {/* --- departure --- */}
        <Marker at={PLACES.hitokappu.at} color={C.jp} glow={C.jpGlow} start={62} end={460} />
        <Label at={PLACES.hitokappu.at} text="Hitokappu Bay" sub="Etorofu · Kuril Islands" start={68} end={330} size={28} />

        {/* --- transit --- */}
        <Route points={KIDO_BUTAI_TRACK} progress={fleetProgress(frame)} color={C.route} spacing={64} chevronSize={10} opacity={interpolate(frame, [T.waveEnd, T.waveEnd + 30], [1, 0.35], clamp)} />
        <Marker at={PLACES.standby.at} color="rgba(255,255,255,0.8)" glow="rgba(255,255,255,0.3)" start={300} end={470} r={5} pulse={false} />
        <Label at={PLACES.standby.at} text="Planned standby point" sub="42°N 165°W" start={305} end={440} size={20} weight={600} color={C.labelDim} />
        <Label at={[178, 43.1]} text="APPROXIMATE TRACK" start={210} end={360} size={14} weight={600} spacing={4} color="rgba(63,240,220,0.75)" dx={0} dy={-26} align="center" />

        {fleetVisible ? (
          <CarrierGroupSymbol
            x={frame < T.fleetEnd ? head.x : lx}
            y={frame < T.fleetEnd ? head.y : ly}
            start={T.fleetStart - 8}
            title="KIDO BUTAI"
            sub={`MOBILE STRIKING FORCE · ${FACTS.carriers} CARRIERS`}
          />
        ) : null}

        {/* --- Hawaii --- */}
        <Label at={[west(159.55), 22.08]} text="Kauai" start={470} end={640} size={22} weight={600} />
        <Label at={[west(157.0), 21.13]} text="Molokai" start={478} end={640} size={20} weight={600} color={C.labelDim} />
        <Label at={[west(156.3), 20.8]} text="Maui" start={486} end={640} size={22} weight={600} />
        <Label at={[west(155.5), 19.6]} text="Hawaii" start={494} end={640} size={22} weight={600} />
        <Label at={[west(157.7), 21.75]} text="OAHU" start={482} end={600} size={30} spacing={6} weight={700} />
        <Marker at={PLACES.launch.at} color={C.jp} glow={C.jpGlow} start={T.fleetEnd + 6} end={680} r={8} />
        <Label at={PLACES.launch.at} text="Launch area" sub="≈ 230 miles north of Oahu" start={T.fleetEnd + 14} end={600} size={24} align="right" dx={30} dy={34} />

        {/* --- first wave --- */}
        <Route points={FIRST_WAVE_TRACK} progress={waveProgress(frame)} color={C.route} spacing={54} speed={3.4} chevronSize={12} />
        <Label at={[west(157.75), 23.3]} text={`FIRST WAVE · ${FACTS.firstWave} AIRCRAFT`} start={T.waveStart + 12} end={620} size={18} weight={700} spacing={3} color={C.route} />

        {/* --- US installations (blue) --- */}
        <Marker at={PLACES.wheeler.at} color={C.us} glow={C.usGlow} start={590} r={7} pulse={false} />
        <Label at={PLACES.wheeler.at} text="Wheeler Field" start={596} size={20} weight={600} />
        <Marker at={PLACES.kaneohe.at} color={C.us} glow={C.usGlow} start={598} r={7} pulse={false} />
        <Label at={PLACES.kaneohe.at} text="NAS Kaneohe Bay" start={604} size={20} weight={600} />
        <Marker at={PLACES.hickam.at} color={C.us} glow={C.usGlow} start={606} r={7} pulse={false} />
        <Label at={PLACES.hickam.at} text="Hickam Field" start={612} size={20} weight={600} dy={14} />
        <Marker at={PLACES.pearlHarbor.at} color={C.us} glow={C.usGlow} start={604} r={10} />
        <Label at={PLACES.pearlHarbor.at} text="Pearl Harbor" sub="U.S. Pacific Fleet" start={610} size={30} dx={26} dy={-22} />
        <AlertRing at={PLACES.pearlHarbor.at} start={652} r={64} />
      </MapStage>

      <Haze />
      <DepthOfField amount={dof} />
      <Vignette />
      <Hud
        start={14}
        tag={phaseDec7 ? 'HAWAII · DECEMBER 1941' : 'NORTH PACIFIC · NOVEMBER 1941'}
        date={dateFor(frame)}
        time={frame >= T.waveStart ? `${timeFor(frame)}  HAWAII TIME` : undefined}
        note={frame < T.fleetEnd ? 'TOKYO TIME' : frame < T.waveStart ? 'MORNING · HAWAII TIME' : frame >= T.harbor - 12 ? 'FIRST WAVE ATTACK BEGINS' : 'FIRST WAVE INBOUND'}
        lat={lat}
        lon={lon}
        opacity={1 - interpolate(frame, [T.flash - 4, T.flash], [0, 1], clamp)}
      />
      <AbsoluteFill style={{background: '#000', opacity: titleDim}} />
      <Flash at={T.flash} />
      <ChapterTitle start={T.title} num="CHAPTER ONE" title="THE ATTACK" />
      <Grain />
      <FadeFromBlack start={0} dur={24} />
    </AbsoluteFill>
  );
};
