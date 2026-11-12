# PEARL HARBOR: DECEMBER 7, 1941 — production architecture

## Stack (all free)

| Layer | Tool | Licence / cost |
|---|---|---|
| Scenes, animation, render | Remotion 4 + React + TypeScript | Remotion Free License (individual) |
| Maps, routes, symbols | SVG + CSS 2.5D perspective (a flat plane tilted with `rotateX`) | — |
| Terrain textures | Python (numpy, scipy, shapely, Pillow): `tools/geo/build_terrain.py` | — |
| Elevation | AWS Terrain Tiles (terrarium) | open data, attribution |
| Coastlines | Natural Earth 10m; OpenStreetMap via geo-maps | PD; ODbL |
| Fonts | Inter, Barlow Condensed, JetBrains Mono (@fontsource) | SIL OFL |
| Music and SFX | synthesised in Python (`tools/audio/`) plus CC0/CC-BY tracks once the hosts are reachable | original / free |
| Narration | Kokoro-82M (ONNX, runs locally on the CPU) | Apache-2.0 |
| Encode | Remotion's bundled ffmpeg (H.264) | — |

## Rendering

- Authored at 1920×1080. The final 4K UHD render uses `--scale=2`, so vectors and text are rasterised at full resolution.
- `remotion.config.ts` points Remotion at the preinstalled Chromium headless shell. No browser download is needed.

## Map engine (`src/map/`)

- `geo.ts`: Web Mercator "world units". Longitude runs continuously eastward across the antimeridian, so 158°W is written as 202 and the North Pacific stays one contiguous plane. Also holds the path maths.
- `camera.ts`: keyframed camera (centre, zoom, tilt, rotation). Zoom is interpolated in log space, and a long pan lifts the camera on a zoom-out arc (a fly-over).
- `MapStage.tsx`: the 2.5D plane. Terrain comes as level-of-detail layers (Pacific z6 → Hawaii z10 → Oahu z13), cut into tiles of at most 2048 px with feathered alpha. On top sit the glowing vector coastlines and the graticule. A context provides `project()` for overlays.
- `Markers.tsx`: `Label`, `Marker` (pulse), `AlertRing` (critical events, yellow).
- `Route.tsx`: progressive route with flowing chevrons. Spacing is constant in screen pixels.
- `UnitSymbol.tsx`: tactical unit frame (carrier group).

Colour code: blue = U.S., red = Japan, white = geography, grey = infrastructure and relief, yellow = attacks and critical events, teal = movement and navigation.

### Rendering rule learnt in the prototype

Do not use `vector-effect: non-scaling-stroke` inside the 3D-transformed plane. Chromium mis-rasterises it, producing ghost outlines. Divide stroke widths by the map scale instead.

## Scenes

`src/scenes/<chapter>/<Scene>.tsx`: one component per shot. Scenes compose map components, fx (`src/fx/`) and data (`src/data/`). Every historical datum in `src/data/` carries a source ID from `research/sources.md`.

## Folders

```
research/   sources, chronology, disputed facts
script/     narration script with timecodes, subtitles
data/geo/   raw downloads and cache (gitignored)
public/     built textures, fonts, fx, audio
tools/      geo + audio build scripts
src/        Remotion project
out/        renders (gitignored)
```
