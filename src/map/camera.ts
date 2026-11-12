import {Easing} from 'remotion';
import {LonLat, toWorld} from './geo';

export type CamKey = {
  f: number; // frame
  at: LonLat; // centre
  zoom: number; // web-mercator zoom
  tilt?: number; // degrees (2.5D perspective)
  rot?: number; // degrees, rotation about vertical axis
  ease?: (t: number) => number; // easing INTO this key
};

export type Cam = {cx: number; cy: number; zoom: number; tilt: number; rot: number};

const defaultEase = Easing.bezier(0.45, 0, 0.2, 1);

/**
 * Interpolates camera keys. Centre is interpolated in world space, zoom in
 * log space (already logarithmic), so fly-throughs feel physically right.
 * When a move both pans far and zooms, a "zoom-out arc" lifts the camera
 * mid-move (van Wijk-style), which reads as a cinematic fly-over.
 */
export const cameraAt = (keys: CamKey[], frame: number): Cam => {
  const ks = keys;
  if (frame <= ks[0].f) return toCam(ks[0]);
  for (let i = 1; i < ks.length; i++) {
    const a = ks[i - 1];
    const b = ks[i];
    if (frame <= b.f) {
      const t = (b.ease ?? defaultEase)((frame - a.f) / (b.f - a.f));
      const [ax, ay] = toWorld(a.at);
      const [bx, by] = toWorld(b.at);
      // arc: how many zoom levels the pan spans at the lower zoom
      const minZ = Math.min(a.zoom, b.zoom);
      const panPx = Math.hypot(bx - ax, by - ay) * ((256 * Math.pow(2, minZ)) / 100000);
      const lift = Math.max(0, Math.log2(Math.max(1, panPx / 1400))) * 0.55;
      const arc = Math.sin(Math.PI * t) * lift;
      return {
        cx: ax + (bx - ax) * t,
        cy: ay + (by - ay) * t,
        zoom: a.zoom + (b.zoom - a.zoom) * t - arc,
        tilt: (a.tilt ?? 0) + ((b.tilt ?? 0) - (a.tilt ?? 0)) * t,
        rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * t,
      };
    }
  }
  return toCam(ks[ks.length - 1]);
};

const toCam = (k: CamKey): Cam => {
  const [cx, cy] = toWorld(k.at);
  return {cx, cy, zoom: k.zoom, tilt: k.tilt ?? 0, rot: k.rot ?? 0};
};
