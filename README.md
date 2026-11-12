# PEARL HARBOR: DECEMBER 7, 1941

A 12-minute historical documentary built entirely in code: 2.5D animated military maps, 2D digital reconstructions, an original synthesised score, and AI narration (Kokoro, voice `am_fenrir`). It uses no 3D, no archival footage and no stock media.

## Deliverables

| What | Where |
|---|---|
| Full script, scene by scene (narration, visual, camera, animation, graphics, transition, sound, sources) | `script/SCRIPT.md` (generated from `script/scenes.json`) |
| Narration, one file per scene (fenrir) | `public/voice/<scene>.wav` + `public/voice/timings.json` |
| English subtitles | `subtitles/pearl_harbor_en.srt` (also muxed into the MP4 as a soft track) |
| Historical sources and fact status | `research/sources.md` |
| Final film | `out/<tag>/pearl_harbor_<tag>.mp4` (render output, not committed: too large for git) |
| Architecture notes | `docs/ARCHITECTURE.md` |

## Rebuild pipeline

All steps run from the repository root:

```bash
npm ci
pip install numpy scipy shapely pillow scikit-image soundfile kokoro-onnx
python3 tools/geo/build_harbor_shoreline.py   # detailed Pearl Harbor shoreline
python3 tools/geo/build_terrain.py             # terrain tiles (all regions)
python3 tools/voice/build_voice.py             # fenrir narration per scene
python3 tools/build_layout.py                  # timeline from measured narration
python3 tools/audio/mix_film.py                # score + SFX + voice, ducked
ffmpeg -i public/audio/film_mix_raw.wav -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 public/audio/film_mix.wav
python3 tools/build_subtitles.py               # SRT
python3 tools/build_script_doc.py              # script/SCRIPT.md
tools/render/render_film.sh 1 1080p            # review master, 1920x1080
tools/render/render_film.sh 2 2160p            # 4K UHD master, 3840x2160
```

Preview in the browser with `npm run studio`. QA stills come from `node tools/render/stills.mjs 0.5`.

## Licences

- Remotion: Free License (individual use).
- Fonts: SIL OFL.
- Kokoro-82M: Apache-2.0.
- Elevation: AWS Terrain Tiles (attribution required).
- Map data: © OpenStreetMap contributors (ODbL) and Natural Earth (public domain).
- Score and sound effects are original and synthesised in `tools/audio/`.
