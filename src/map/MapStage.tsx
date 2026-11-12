import React, {createContext, useContext, useMemo} from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import regions from '../../public/geo/regions.json';
import coastPacific from '../../public/geo/coast_pacific.json';
import coastHawaii from '../../public/geo/coast_hawaii.json';
import coastOahu from '../../public/geo/coast_oahu.json';
import coastHarbor from '../../public/geo/coast_harbor.json';
import {Cam} from './camera';
import {LonLat, scaleAt, toWorld} from './geo';
import {C} from '../theme';

// The map is a flat 2D plane, larger than the frame, tilted in CSS perspective (2.5D).
export const PLANE_W = 1920 * 2.6;
export const PLANE_H = 1080 * 3.2;

type Ctx = {
  cam: Cam;
  s: number; // plane px per world unit
  project: (ll: LonLat) => [number, number];
  projectWorld: (x: number, y: number) => [number, number];
};
const MapCtx = createContext<Ctx | null>(null);
export const useMap = () => {
  const c = useContext(MapCtx);
  if (!c) throw new Error('useMap outside MapStage');
  return c;
};

const smooth = (z: number, a: number, b: number) => {
  const t = Math.min(1, Math.max(0, (z - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

type RegionKey = keyof typeof regions;
const LAYERS: {key: RegionKey; vis: (z: number) => number}[] = [
  // half-resolution copy for wide shots (cheaper to resample), full-res when closer
  {key: 'pacificlo', vis: (z) => 1 - smooth(z, 5.6, 5.9)},
  {key: 'pacific', vis: (z) => smooth(z, 5.45, 5.6) * (1 - smooth(z, 10.2, 10.8))},
  // coarser layers drop out once finer ones fill the view (huge upscaled tiles are costly)
  {key: 'hawaii', vis: (z) => smooth(z, 6.2, 7.2) * (1 - smooth(z, 11.8, 12.3))},
  {key: 'oahu', vis: (z) => smooth(z, 9.0, 10.0) * (1 - smooth(z, 14.3, 14.8))},
  {key: 'harbor', vis: (z) => smooth(z, 11.3, 12.1)},
  {key: 'row', vis: (z) => smooth(z, 14.4, 15.1)},
];
// Coast rings parsed once; each frame they are projected to plane pixels in JS,
// culled and decimated. (Drawing huge world-unit paths under a scale transform
// inside a 3D-tilted plane is ~25x slower in software rasterisation.)
type Ring = {pts: Float64Array; x0: number; y0: number; x1: number; y1: number};
const parseRings = (d: string): Ring[] =>
  d
    .split('M')
    .filter(Boolean)
    .map((r) => {
      const nums = r.replace('Z', '').split('L').flatMap((p) => p.split(',').map(Number));
      const pts = Float64Array.from(nums);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let i = 0; i < pts.length; i += 2) {
        x0 = Math.min(x0, pts[i]); x1 = Math.max(x1, pts[i]);
        y0 = Math.min(y0, pts[i + 1]); y1 = Math.max(y1, pts[i + 1]);
      }
      return {pts, x0, y0, x1, y1};
    });
const COASTS = [
  {rings: parseRings(coastPacific.d), vis: (z: number) => 1 - smooth(z, 6.4, 7.2)},
  {rings: parseRings(coastHawaii.d), vis: (z: number) => smooth(z, 6.4, 7.2) * (1 - smooth(z, 9.6, 10.2))},
  {rings: parseRings(coastOahu.d), vis: (z: number) => smooth(z, 9.6, 10.2) * (1 - smooth(z, 11.6, 12.1))},
  {rings: parseRings(coastHarbor.d), vis: (z: number) => smooth(z, 11.6, 12.1)},
];

const coastPath = (rings: Ring[], cx: number, cy: number, s: number) => {
  const hw = PLANE_W / 2 / s, hh = PLANE_H / 2 / s;
  const vx0 = cx - hw * 1.1, vx1 = cx + hw * 1.1, vy0 = cy - hh * 1.1, vy1 = cy + hh * 1.1;
  const M = 300; // px margin outside the plane
  const out: string[] = [];
  for (const r of rings) {
    if (r.x1 < vx0 || r.x0 > vx1 || r.y1 < vy0 || r.y0 > vy1) continue;
    if ((r.x1 - r.x0) * s < 1.5 && (r.y1 - r.y0) * s < 1.5) continue;
    const p = r.pts;
    let lx = -1e9, ly = -1e9, open = false;
    let seg: string[] = [];
    const flush = () => {
      if (seg.length > 1) out.push('M' + seg.join('L'));
      seg = [];
      open = false;
    };
    // Rings are clipped to the visible plane and emitted as open polylines:
    // stroking long off-screen geometry inside the perspective plane is costly.
    for (let i = 0; i < p.length; i += 2) {
      const x = (p[i] - cx) * s + PLANE_W / 2;
      const y = (p[i + 1] - cy) * s + PLANE_H / 2;
      const inside = x > -M && y > -M && x < PLANE_W + M && y < PLANE_H + M;
      if (!inside) {
        if (open) {
          seg.push(`${x.toFixed(1)},${y.toFixed(1)}`);
          flush();
        }
        lx = x; ly = y;
        continue;
      }
      if (!open) {
        if (lx > -1e8) seg.push(`${lx.toFixed(1)},${ly.toFixed(1)}`);
        open = true;
      } else if (Math.abs(x - lx) + Math.abs(y - ly) < 1.6 && i < p.length - 2) continue;
      seg.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      lx = x; ly = y;
    }
    flush();
  }
  return out.join('');
};

const graticule: [[number, number], [number, number]][] = [];
for (let lon = 100; lon <= 240; lon += 5) graticule.push([toWorld([lon, 64]), toWorld([lon, -4])]);
for (let lat = 0; lat <= 60; lat += 5) graticule.push([toWorld([100, lat]), toWorld([240, lat])]);

export const MapStage: React.FC<{cam: Cam; children?: React.ReactNode; overlay?: React.ReactNode}> = ({cam, children, overlay}) => {
  const {width, height} = useVideoConfig();
  const s = scaleAt(cam.zoom);
  const ctx = useMemo<Ctx>(() => {
    const projectWorld = (x: number, y: number): [number, number] => [(x - cam.cx) * s + PLANE_W / 2, (y - cam.cy) * s + PLANE_H / 2];
    return {cam, s, projectWorld, project: (ll) => projectWorld(...toWorld(ll))};
  }, [cam, s]);
  const graticuleD = graticule.map(([a, b]) => {
    const [x0, y0] = ctx.projectWorld(...a);
    const [x1, y1] = ctx.projectWorld(...b);
    return `M${x0.toFixed(1)},${y0.toFixed(1)}L${x1.toFixed(1)},${y1.toFixed(1)}`;
  }).join('');

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden', perspective: 1500, perspectiveOrigin: '50% 30%'}}>
      <div
        style={{
          position: 'absolute',
          width: PLANE_W,
          height: PLANE_H,
          left: (width - PLANE_W) / 2,
          top: (height - PLANE_H) / 2,
          transformOrigin: '50% 50%',
          transform: `rotateX(${cam.tilt}deg) rotateZ(${cam.rot}deg)`,
          transformStyle: 'flat',
        }}
      >
        {LAYERS.map(({key, vis}) => {
          const o = vis(cam.zoom);
          if (o <= 0.001) return null;
          // Textures are cut into <=2048px tiles (GPU texture limits); alpha
          // feathering is baked into the WebP so LOD layers blend seamlessly.
          return regions[key].tiles.map((t) => {
            const [x0, y0] = ctx.projectWorld(t.x0, t.y0);
            const [x1, y1] = ctx.projectWorld(t.x1, t.y1);
            if (x1 < -400 || y1 < -400 || x0 > PLANE_W + 400 || y0 > PLANE_H + 400) return null;
            return (
              <Img
                key={t.file}
                src={staticFile(`geo/${t.file}`)}
                style={{position: 'absolute', left: x0, top: y0, width: x1 - x0 + 0.8, height: y1 - y0 + 0.8, opacity: o}}
              />
            );
          });
        })}
        <svg width={PLANE_W} height={PLANE_H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d={graticuleD} fill="none" stroke="rgba(160,210,220,0.07)" strokeWidth={1} />
          {COASTS.map(({rings, vis}, i) => {
            const o = vis(cam.zoom);
            if (o <= 0.001) return null;
            const d = coastPath(rings, cam.cx, cam.cy, s);
            return (
              <g key={i} opacity={o < 0.999 ? o : undefined} fill="none" strokeLinejoin="round">
                <path d={d} stroke={C.coast} strokeWidth={1.25} />
              </g>
            );
          })}
        </svg>
        <MapCtx.Provider value={ctx}>{children}</MapCtx.Provider>
      </div>
      {overlay}
    </AbsoluteFill>
  );
};
