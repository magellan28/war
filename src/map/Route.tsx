import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {cumulative, LonLat, pointAt, smoothPath, toWorld} from './geo';
import {PLANE_H, PLANE_W, useMap} from './MapStage';

/**
 * Animated movement route: a thin guide line drawn progressively, with
 * glowing chevrons flowing along it (spacing fixed in plane pixels, so the
 * rhythm stays constant through zooms).
 */
export const Route: React.FC<{
  points: LonLat[];
  progress: number; // 0..1 drawn portion
  color?: string;
  glow?: string;
  spacing?: number;
  speed?: number; // px per frame
  dashed?: boolean;
  chevronSize?: number;
  opacity?: number;
  tail?: number; // fade-out of chevrons behind head, px (0 = none)
}> = ({points, progress, color = C.route, glow = C.routeGlow, spacing = 70, speed = 2.2, dashed = true, chevronSize = 11, opacity = 1, tail = 0}) => {
  const frame = useCurrentFrame();
  const {projectWorld} = useMap();
  const world = useMemo(() => smoothPath(points.map(toWorld), 28), [points]);
  const screen = world.map(([x, y]) => projectWorld(x, y));
  const L = cumulative(screen);
  const total = L[L.length - 1];
  const head = total * Math.max(0, Math.min(1, progress));
  if (head <= 0.5 || opacity <= 0) return null;

  // drawn polyline up to head
  const end = pointAt(screen, L, head);
  const drawn = screen.slice(0, end.index).concat([[end.x, end.y]]);
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  for (const [x, y] of drawn) {
    bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y);
  }
  bx0 = Math.max(-400, bx0 - 40); by0 = Math.max(-400, by0 - 40); bx1 = Math.min(PLANE_W + 400, bx1 + 40); by1 = Math.min(PLANE_H + 400, by1 + 40);
  const d = 'M' + drawn.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L');

  const chevrons: React.ReactNode[] = [];
  const phase = (frame * speed) % spacing;
  for (let dist = head - phase; dist > 0; dist -= spacing) {
    const p = pointAt(screen, L, dist);
    if (p.x < -200 || p.y < -200 || p.x > PLANE_W + 200 || p.y > PLANE_H + 200) continue;
    const nearHead = Math.min(1, (head - dist) / (spacing * 0.6));
    const fromStart = Math.min(1, dist / spacing);
    const tailFade = tail > 0 ? Math.max(0, 1 - (head - dist) / tail) : 1;
    const o = nearHead * fromStart * tailFade;
    if (o <= 0.02) continue;
    const s = chevronSize;
    const shape = `M${-s * 0.55},${-s} L${s * 0.45},0 L${-s * 0.55},${s}`;
    chevrons.push(
      <g key={dist.toFixed(1)} transform={`translate(${p.x},${p.y}) rotate(${(p.angle * 180) / Math.PI})`} opacity={o}>
        <path d={shape} fill="none" stroke={glow} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.45} />
        <path d={shape} fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        <path d={shape} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round" />
      </g>,
    );
  }

  return (
    // Size the SVG to the drawn route only: full-plane SVGs are very costly to rasterise.
    <svg
      width={Math.max(1, bx1 - bx0)}
      height={Math.max(1, by1 - by0)}
      viewBox={`${bx0} ${by0} ${Math.max(1, bx1 - bx0)} ${Math.max(1, by1 - by0)}`}
      style={{position: 'absolute', left: bx0, top: by0, overflow: 'visible', opacity}}
    >
      <path d={d} fill="none" stroke={glow} strokeWidth={6} opacity={0.18} strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        opacity={0.7}
        strokeDasharray={dashed ? '2 9' : undefined}
        strokeLinecap="round"
      />
      {chevrons}
      <circle cx={end.x} cy={end.y} r={5} fill="#fff" opacity={progress < 1 ? 0.95 : 0} />
      <circle cx={end.x} cy={end.y} r={16} fill={glow} opacity={progress < 1 ? 0.4 : 0} />
    </svg>
  );
};

/** World-space position of a route's head, for units that ride the route. */
export const routeHead = (points: LonLat[], progress: number) => {
  const world = smoothPath(points.map(toWorld), 28);
  const L = cumulative(world);
  const p = pointAt(world, L, L[L.length - 1] * Math.max(0, Math.min(1, progress)));
  return {x: p.x, y: p.y, angle: p.angle};
};
