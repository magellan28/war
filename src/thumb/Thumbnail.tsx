import React from 'react';
import {AbsoluteFill} from 'remotion';
import {MapShot, Strike} from '../map/MapShot';
import {west} from '../map/geo';
import {RowShips} from '../scenes/ch5_6';
import {Route} from '../map/Route';
import {PLACES} from '../data/pearl';
import {Fire, FxDefs, SmokeColumn} from '../art/fx';
import {AircraftSide} from '../art/vehicles';
import {C, F} from '../theme';
import berths from '../data/berths.json';

const B = berths as unknown as Record<string, [number, number]>;

/** YouTube thumbnail (static frame, rendered as a still). */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: '#05090d'}}>
    {/* map plate: Battleship Row under attack */}
    <AbsoluteFill style={{left: 520}}>
      <MapShot
        keys={[{f: 0, at: [west(157.953), 21.3585], zoom: 15.55, tilt: 52, rot: 18}]}
        dof={3}
      >
        <RowShips start={-100} hits={{arizona: -100, oklahoma: -100, westVirginia: -100, california: -100, nevada: -100}} sunk={{}} />
        {[B.arizona, B.oklahoma, B.westVirginia].map((p, i) => (
          <Strike key={i} at={p} start={-8 - i * 6} count={3} />
        ))}
        {[B.oklahoma, B.westVirginia, B.california].map((t, i) => (
          <Route key={i} points={[[t[0] + 0.006, t[1] - 0.003], t]} progress={1} color={C.alert} glow={C.alertGlow} spacing={22} chevronSize={8} />
        ))}
      </MapShot>
    </AbsoluteFill>

    {/* fireball + smoke + aircraft, layered over the map */}
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <FxDefs />
      <SmokeColumn x={1470} y={560} t={4.6} seed={51} scale={1.5} wind={10} lit density={60} />
      <SmokeColumn x={1330} y={600} t={3.7} seed={57} scale={1.1} wind={10} density={40} />
      <Fire x={1470} y={575} t={2} seed={52} scale={0.9} width={70} />
      <Fire x={1330} y={610} t={2.3} seed={58} scale={0.7} width={50} />
      <AircraftSide type="kate" x={1620} y={210} scale={2.4} rot={-8} prop={3} fill="#030507" />
      <AircraftSide type="kate" x={1800} y={320} scale={1.7} rot={-8} prop={5} fill="#05080a" />
    </svg>

    {/* left darkening for legibility */}
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(3,6,9,0.97) 0%, rgba(3,6,9,0.9) 30%, rgba(3,6,9,0.35) 52%, rgba(3,6,9,0) 66%)'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 80% at 70% 60%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}} />

    {/* type */}
    <div style={{position: 'absolute', left: 90, top: 210}}>
      <div style={{fontFamily: F.mono, fontSize: 38, letterSpacing: 12, color: C.alert, fontWeight: 500}}>7 DECEMBER 1941</div>
      <div style={{fontFamily: F.title, fontWeight: 600, fontSize: 250, lineHeight: 0.86, color: '#fff', letterSpacing: 4, marginTop: 22, textShadow: '0 8px 40px rgba(0,0,0,0.8)'}}>
        PEARL
        <br />
        HARBOR
      </div>
      <div style={{width: 560, height: 10, background: C.jp, marginTop: 30}} />
      <div style={{fontFamily: F.title, fontWeight: 500, fontSize: 66, color: '#fff', letterSpacing: 5, marginTop: 26, lineHeight: 1.05}}>
        THE ATTACK THAT
        <br />
        CHANGED HISTORY
      </div>
    </div>
  </AbsoluteFill>
);
