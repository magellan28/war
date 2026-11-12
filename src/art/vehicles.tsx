import React from 'react';

// Generic, period-appropriate 2D silhouettes. They are digital
// reconstructions for illustration, not plans of specific ships/aircraft.

type SilProps = {x?: number; y?: number; scale?: number; fill?: string; rot?: number; opacity?: number; flip?: boolean};

const wrap = (p: SilProps, w: number, children: React.ReactNode) => (
  <g
    transform={`translate(${p.x ?? 0},${p.y ?? 0}) rotate(${p.rot ?? 0}) scale(${(p.flip ? -1 : 1) * (p.scale ?? 1)},${p.scale ?? 1})${p.flip ? ` translate(${-w},0)` : ''}`}
    opacity={p.opacity ?? 1}
    fill={p.fill ?? '#0b1218'}
  >
    {children}
  </g>
);

/** US battleship, side view, ~600 units long, waterline at y=0. */
export const BattleshipSide: React.FC<SilProps & {lights?: boolean}> = (p) =>
  wrap(
    p,
    600,
    <>
      <path d="M0,-18 L18,-30 L560,-30 L600,-40 L592,-22 L575,0 L20,0 Z" />
      <path d="M95,-30 L95,-44 L470,-44 L470,-30 Z" />
      {/* turrets */}
      <path d="M70,-30 L76,-42 L118,-42 L124,-30 Z" />
      <path d="M128,-44 L134,-56 L176,-56 L182,-44 Z" />
      <path d="M392,-44 L398,-56 L440,-56 L446,-44 Z" />
      <path d="M452,-30 L458,-42 L500,-42 L506,-30 Z" />
      <rect x={60} y={-36} width={30} height={3} />
      <rect x={110} y={-50} width={-36} height={3} transform="translate(0,0)" />
      {/* forward superstructure + tripod mast */}
      <path d="M200,-44 L206,-78 L250,-78 L256,-44 Z" />
      <path d="M222,-78 L214,-150 L232,-150 L236,-78 Z" />
      <path d="M210,-150 L240,-150 L244,-168 L206,-168 Z" />
      <path d="M215,-78 L180,-44 L186,-44 L222,-74 Z" />
      {/* funnel */}
      <path d="M275,-44 L280,-104 L310,-104 L314,-44 Z" />
      {/* aft superstructure + mast */}
      <path d="M330,-44 L334,-70 L372,-70 L376,-44 Z" />
      <path d="M350,-70 L344,-130 L358,-130 L362,-70 Z" />
      <path d="M340,-130 L364,-130 L366,-142 L338,-142 Z" />
      {/* boats/cranes */}
      <path d="M318,-60 L326,-96 L329,-96 L322,-58 Z" />
      {p.lights ? (
        <g fill="#ffcf7a" opacity={0.7}>
          {[120, 160, 230, 300, 360, 420].map((x) => (
            <rect key={x} x={x} y={-26} width={3} height={2} />
          ))}
        </g>
      ) : null}
    </>,
  );

/** Japanese fleet carrier, side view, ~600 long, waterline y=0. */
export const CarrierSide: React.FC<SilProps> = (p) =>
  wrap(
    p,
    600,
    <>
      <path d="M10,-14 L30,-30 L560,-30 L598,-36 L585,-16 L565,0 L30,0 Z" />
      <path d="M-10,-52 L610,-52 L606,-46 L-6,-46 Z" />
      <path d="M40,-46 L40,-30 L560,-30 L560,-46 Z" opacity={0.9} />
      {/* island (starboard, forward) */}
      <path d="M380,-52 L384,-76 L420,-76 L424,-52 Z" />
      <path d="M396,-76 L398,-96 L404,-96 L406,-76 Z" />
      {/* downward-curving funnel */}
      <path d="M300,-40 L300,-30 L332,-30 L338,-20 L346,-24 L336,-40 Z" />
      {/* hangar openings */}
      <g fill="#1a2730" opacity={0.6}>
        {Array.from({length: 18}).map((_, i) => (
          <rect key={i} x={60 + i * 27} y={-42} width={16} height={6} />
        ))}
      </g>
    </>,
  );

/** Carrier, top-down, ~260 long (bow to +x). */
export const CarrierTop: React.FC<SilProps & {deck?: string}> = (p) =>
  wrap(
    p,
    260,
    <>
      <path d="M0,0 L8,-14 L230,-14 L262,0 L230,14 L8,14 Z" />
      <path d="M6,-11 L236,-11 L250,0 L236,11 L6,11 Z" fill={p.deck ?? '#2a333a'} />
      <path d="M150,-14 L150,-21 L178,-21 L178,-14 Z" />
      <g stroke="#e9eef0" strokeWidth={0.8} opacity={0.55}>
        <line x1={12} y1={0} x2={236} y2={0} strokeDasharray="10 7" />
      </g>
    </>,
  );

type PlaneType = 'kate' | 'val' | 'zero' | 'b17';

/** Aircraft side view, ~100 long, nose to +x, centred on (0,0). */
export const AircraftSide: React.FC<SilProps & {type: PlaneType; prop?: number}> = ({type, prop = 0, ...p}) => {
  const body =
    type === 'zero'
      ? 'M-48,-2 L-40,-6 L20,-8 L38,-6 L46,-2 L46,3 L36,6 L-30,5 L-48,1 Z'
      : type === 'val'
        ? 'M-50,-2 L-40,-7 L18,-9 L36,-6 L44,-2 L44,4 L32,7 L-30,6 L-50,1 Z'
        : type === 'b17'
          ? 'M-70,-4 L-50,-10 L40,-12 L62,-8 L70,-2 L68,6 L50,10 L-50,8 L-70,2 Z'
          : 'M-52,-2 L-40,-7 L24,-9 L40,-6 L48,-2 L48,4 L36,7 L-32,6 L-52,1 Z';
  const canopy =
    type === 'zero' ? 'M2,-8 L10,-15 L24,-14 L28,-8 Z' : type === 'b17' ? 'M30,-12 L36,-17 L48,-15 L52,-10 Z' : 'M-14,-8 L-6,-15 L26,-14 L30,-8 Z';
  const fin = type === 'b17' ? 'M-70,-2 L-62,-40 L-46,-38 L-40,-10 Z' : 'M-50,-1 L-46,-20 L-36,-20 L-30,-6 Z';
  return wrap(
    p,
    100,
    <>
      <path d={body} />
      <path d={canopy} opacity={0.85} />
      <path d={fin} />
      <path d={type === 'b17' ? 'M-30,2 L30,2 L22,7 L-24,7 Z' : 'M-8,2 L22,2 L18,6 L-6,6 Z'} />
      {type === 'val' ? <path d="M18,6 L22,16 L28,16 L24,6 Z" /> : null}
      {type === 'kate' ? <path d="M-6,7 L30,7 L26,10 L-4,10 Z" opacity={0.95} /> : null}
      <ellipse cx={type === 'b17' ? 71 : 49} cy={1} rx={1.6} ry={13} opacity={0.25 + 0.15 * Math.sin(prop * 3)} />
    </>,
  );
};

/** Aircraft top view, ~80 span, nose to +x. */
export const AircraftTop: React.FC<SilProps & {type?: PlaneType}> = ({type = 'zero', ...p}) => {
  const span = type === 'b17' ? 60 : 40;
  return wrap(
    p,
    80,
    <>
      <path d={`M-34,0 L-28,-3 L30,-3 L38,0 L30,3 L-28,3 Z`} />
      <path d={`M2,0 L-8,-${span} L4,-${span} L14,-4 L14,4 L4,${span} L-8,${span} Z`} />
      <path d="M-30,0 L-34,-12 L-26,-12 L-22,0 L-26,12 L-34,12 Z" />
    </>,
  );
};

/** Capsized hull, keel up. */
export const HullCapsized: React.FC<SilProps> = (p) =>
  wrap(
    p,
    600,
    <>
      <path d="M0,0 C40,-38 120,-52 300,-54 C480,-52 560,-40 600,0 Z" />
      <path d="M140,-50 L460,-50" stroke="#1c262d" strokeWidth={3} />
    </>,
  );
