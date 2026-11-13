# Pearl Harbor: December 7, 1941 — download

The film is 11:59 long, 1920×1080, 30 fps, H.264, with AAC stereo audio.
It is split into parts because GitHub accepts files of at most 100 MB.
Every part is a normal MP4 that plays on its own.

## For watching: `web/` (173 MB in total)
- `pearl_harbor_web_part0.mp4`: 0:00–5:59
- `pearl_harbor_web_part1.mp4`: 5:59–11:59

## Master quality: `master/` (848 MB, 18 parts of about 40 s each)
These are cut from the master render (CRF 17, AAC 320 kbps) without re-encoding.

## Subtitles
`pearl_harbor_en.srt` holds the English subtitles.

## Joining the parts into one file (lossless)
With [ffmpeg](https://ffmpeg.org), run these commands from the folder that holds the parts.

Master version, with subtitles added:
```bash
for f in master/pearl_harbor_master_*.mp4; do echo "file '$f'"; done > list.txt
ffmpeg -f concat -safe 0 -i list.txt -i pearl_harbor_en.srt -map 0 -map 1 -c copy -c:s mov_text pearl_harbor_master.mp4
```

The web version is joined the same way. Use `web/pearl_harbor_web_part*.mp4` in the first command.
