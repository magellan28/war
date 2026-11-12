#!/usr/bin/env bash
# Render every chapter (muted), concatenate, mux the mix + soft subtitles.
# usage: tools/render/render_film.sh <scale> <tag> [chapters...]
#   scale 1 -> 1920x1080 review master, scale 2 -> 3840x2160 4K UHD master
set -u
cd "$(dirname "$0")/../.."
SCALE=${1:-1}; TAG=${2:-1080p}; shift 2 || true
CHS=${@:-1 2 3 4 5 6 7 8 9}
OUT=out/$TAG; mkdir -p "$OUT"
LOG=$OUT/render.log
for n in $CHS; do
  if [ -s "$OUT/ch$n.mp4" ]; then echo "skip ch$n" >> "$LOG"; continue; fi
  echo "$(date +%T) start ch$n" >> "$LOG"
  npx remotion render src/index.ts Chapter$n "$OUT/ch$n.part.mp4" --scale=$SCALE --codec=h264 --crf=17 \
     --x264-preset=medium --pixel-format=yuv420p --muted --concurrency=4 --timeout=300000 >> "$LOG" 2>&1 \
     && mv "$OUT/ch$n.part.mp4" "$OUT/ch$n.mp4"
  echo "$(date +%T) done ch$n ($?)" >> "$LOG"
done
ls "$OUT"/ch?.mp4 | sort -V | sed "s|^|file '$PWD/|; s|$|'|" > "$OUT/list.txt"
if [ "$(wc -l < "$OUT/list.txt")" = "9" ]; then
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$OUT/list.txt" -c copy "$OUT/video.mp4"
  ffmpeg -y -hide_banner -loglevel error -i "$OUT/video.mp4" -i public/audio/film_mix.wav -i subtitles/pearl_harbor_en.srt \
    -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -b:a 320k -ar 48000 -c:s mov_text -metadata:s:s:0 language=eng \
    -metadata title="Pearl Harbor: December 7, 1941" -movflags +faststart -shortest "$OUT/pearl_harbor_$TAG.mp4"
  echo "$(date +%T) FINAL $OUT/pearl_harbor_$TAG.mp4" >> "$LOG"
fi
