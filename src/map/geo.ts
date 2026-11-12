// Web-Mercator "world units": 360° of longitude = W units.
// Longitudes are continuous east-positive across the antimeridian
// (158°W is written as 202), so the North Pacific is one contiguous plane.
export const W = 100000;

export type LonLat = [number, number];

export const mercY = (lat: number) => {
  const s = (lat * Math.PI) / 180;
  return (1 - Math.log(Math.tan(s) + 1 / Math.cos(s)) / Math.PI) / 2;
};

export const toWorld = ([lon, lat]: LonLat): [number, number] => [((lon + 180) / 360) * W, mercY(lat) * W];

/** px per world unit at a given web-mercator zoom (256 px tiles). */
export const scaleAt = (zoom: number) => (256 * Math.pow(2, zoom)) / W;

/** West longitude helper: west(157.95) -> 202.05 */
export const west = (deg: number) => 360 - deg;

/** Catmull-Rom densification in world space. */
export const smoothPath = (pts: [number, number][], seg = 24): [number, number][] => {
  if (pts.length < 3) return pts;
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < seg; k++) {
      const t = k / seg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export const cumulative = (pts: [number, number][]) => {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return L;
};

/** Point + tangent angle at distance d along polyline. */
export const pointAt = (pts: [number, number][], L: number[], d: number) => {
  const total = L[L.length - 1];
  d = Math.max(0, Math.min(total, d));
  let i = 1;
  while (i < L.length - 1 && L[i] < d) i++;
  const a = pts[i - 1];
  const b = pts[i];
  const seg = L[i] - L[i - 1] || 1;
  const t = (d - L[i - 1]) / seg;
  return {x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, angle: Math.atan2(b[1] - a[1], b[0] - a[0]), index: i};
};
