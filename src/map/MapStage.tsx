import React, {createContext, useContext, useMemo} from 'react';
import {AbsoluteFill, Img, staticFile, useVideoConfig} from 'remotion';
import regions from '../../public/geo/regions.json';
import coastPacific from '../../public/geo/coast_pacific.json';
import coastHawaii from '../../public/geo/coast_hawaii.json';
import coastOahu from '../../public/geo/coast_oahu.json';
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
  {key: 'pacific', vis: (z) => 1 - smooth(z, 10.2, 10.8)},
  {key: 'hawaii', vis: (z) => smooth(z, 6.2, 7.2)},
  {key: 'oahu', vis: (z) => smooth(z, 9.0, 10.0)},
];
const COASTS = [
  {d: coastPacific.d, vis: (z: number) => 1 - smooth(z, 6.4, 7.2)},
  {d: coastHawaii.d, vis: (z: number) => smooth(z, 6.4, 7.2) * (1 - smooth(z, 9.6, 10.2))},
  {d: coastOahu.d, vis: (z: number) => smooth(z, 9.6, 10.2)},
];

const graticule = (() => {
  const parts: string[] = [];
  for (let lon = 100; lon <= 240; lon += 5) {
    const [x, y0] = toWorld([lon, 64]);
    const [, y1] = toWorld([lon, -4]);
    parts.push(`M${x},${y0}L${x},${y1}`);
  }
  for (let lat = 0; lat <= 60; lat += 5) {
    const [x0, y] = toWorld([100, lat]);
    const [x1] = toWorld([240, lat]);
    parts.push(`M${x0},${y}L${x1},${y}`);
  }
  return parts.join('');
})();

export const MapStage: React.FC<{cam: Cam; children?: React.ReactNode; overlay?: React.ReactNode}> = ({cam, children, overlay}) => {
  const {width, height} = useVideoConfig();
  const s = scaleAt(cam.zoom);
  const ctx = useMemo<Ctx>(() => {
    const projectWorld = (x: number, y: number): [number, number] => [(x - cam.cx) * s + PLANE_W / 2, (y - cam.cy) * s + PLANE_H / 2];
    return {cam, s, projectWorld, project: (ll) => projectWorld(...toWorld(ll))};
  }, [cam, s]);
  const tx = -cam.cx * s + PLANE_W / 2;
  const ty = -cam.cy * s + PLANE_H / 2;

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
          <g transform={`translate(${tx},${ty}) scale(${s})`}>
            <path d={graticule} fill="none" stroke="rgba(160,210,220,0.07)" strokeWidth={1 / s} />
            {COASTS.map(({d, vis}, i) => {
              const o = vis(cam.zoom);
              if (o <= 0.001) return null;
              return (
                <g key={i} opacity={o} fill="none" strokeLinejoin="round">
                  <path d={d} stroke={C.coastGlow} strokeWidth={7 / s} opacity={0.35} />
                  <path d={d} stroke={C.coastGlow} strokeWidth={3.2 / s} />
                  <path d={d} stroke={C.coast} strokeWidth={1.25 / s} />
                </g>
              );
            })}
          </g>
        </svg>
        <MapCtx.Provider value={ctx}>{children}</MapCtx.Provider>
      </div>
      {overlay}
    </AbsoluteFill>
  );
};
