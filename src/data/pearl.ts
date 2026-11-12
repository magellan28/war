// Geographic + historical data used by scenes.
// Every entry carries a source tag; see research/sources.md.
// Longitudes are continuous east-positive: use west() for W longitudes.
import {LonLat, west} from '../map/geo';

export const PLACES: Record<string, {at: LonLat; src: string; approx?: boolean}> = {
  // Departure anchorage of the Mobile Striking Force (Kido Butai), Etorofu (Iturup), Kurils.
  hitokappu: {at: [147.65, 44.95], src: 'S1,S2', approx: true},
  // Planned "standby point" given in the Japanese operation order (42°N 165°W).
  standby: {at: [west(165), 42.0], src: 'S3 — verify against primary text'},
  // Launch area "about 230 miles north of Oahu" (NPS); NHHC: "slightly more than 200 miles".
  // Placed due north of Pearl Harbor at ~230 statute miles; exact position not asserted.
  launch: {at: [west(157.95), 24.7], src: 'S4,S1', approx: true},
  pearlHarbor: {at: [west(157.955), 21.365], src: 'geo'},
  fordIsland: {at: [west(157.96), 21.364], src: 'geo'},
  hickam: {at: [west(157.95), 21.335], src: 'geo'},
  wheeler: {at: [west(158.04), 21.481], src: 'geo'},
  kaneohe: {at: [west(157.765), 21.447], src: 'geo'},
};

// Schematic track Hitokappu Bay -> standby point -> launch area.
// Only the end points and standby point are sourced; the curve between them is
// an illustrative approximation and is labelled "APPROXIMATE TRACK" on screen.
export const KIDO_BUTAI_TRACK: LonLat[] = [
  PLACES.hitokappu.at,
  [151.5, 43.7],
  [159, 42.8],
  [170, 42.3],
  [182, 42.1],
  PLACES.standby.at,
  [199.4, 39.0],
  [201.4, 31.5],
  PLACES.launch.at,
];

export const FIRST_WAVE_TRACK: LonLat[] = [PLACES.launch.at, [west(158.0), 23.0], [west(158.05), 21.8], PLACES.pearlHarbor.at];

export const FACTS = {
  departure: '26 NOV 1941', // Tokyo time (25 Nov Hawaii time) — S1, S2
  carriers: 6, // Akagi, Kaga, Soryu, Hiryu, Shokaku, Zuikaku — S1
  firstWave: 183, // aircraft — S4, S5 (most cited figure)
  launchTime: '≈ 06:00', // Hawaii time — S4 (sources vary 06:00–06:15)
  attackTime: '07:48', // first wave attack begins (Kaneohe) — S4
};
