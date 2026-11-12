#!/usr/bin/env bash
# Render the film in resumable chunks (300 frames), concat per chapter, then
# assemble the film with the mix + soft subtitles. Safe to re-run after an
# interruption: finished chunks/chapters are skipped.
# usage: tools/render/render_film.sh <scale> <tag>
set -u
cd "$(dirname "$0")/../.."
SCALE=${1:-1}; TAG=${2:-1080p}
OUT=out/$TAG; mkdir -p "$OUT/chunks"
LOG=$OUT/render.log
CHUNK=90
for n in 1 2 3 4 5 6 7 8 9; do
  [ -s "$OUT/ch$n.mp4" ] && continue
  DUR=$(python3 -c "import json;print(json.load(open('src/data/layout.json'))['chapters'][$n-1]['duration'])")
  a=0; parts=()
  while [ $a -lt $DUR ]; do
    b=$(( a + CHUNK - 1 )); [ $b -ge $DUR ] && b=$(( DUR - 1 ))
    f="$OUT/chunks/ch${n}_$(printf %05d $a).mp4"
    if [ ! -s "$f" ]; then
      echo "$(date +%T) ch$n frames $a-$b" >> "$LOG"
      npx remotion render src/index.ts Chapter$n "$f.part.mp4" --frames=$a-$b --scale=$SCALE --codec=h264 --crf=17 \
        --pixel-format=yuv420p --muted --concurrency=4 --timeout=300000 --log=error >> "$LOG" 2>&1 && mv "$f.part.mp4" "$f" || exit 1
    fi
    parts+=("$f"); a=$(( b + 1 ))
  done
  printf "file '$PWD/%s'\n" "${parts[@]}" > "$OUT/chunks/ch$n.txt"
  ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$OUT/chunks/ch$n.txt" -c copy "$OUT/ch$n.mp4"
  echo "$(date +%T) done ch$n" >> "$LOG"
done
printf "file '$PWD/$OUT/ch%d.mp4'\n" 1 2 3 4 5 6 7 8 9 > "$OUT/list.txt"
ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i "$OUT/list.txt" -c copy "$OUT/video.mp4"
ffmpeg -y -hide_banner -loglevel error -i "$OUT/video.mp4" -i public/audio/film_mix.wav -i subtitles/pearl_harbor_en.srt \
  -map 0:v -map 1:a -map 2:s -c:v copy -c:a aac -b:a 320k -ar 48000 -c:s mov_text -metadata:s:s:0 language=eng \
  -metadata title="Pearl Harbor: December 7, 1941" -movflags +faststart -shortest "$OUT/pearl_harbor_$TAG.mp4"
echo "$(date +%T) FINAL $OUT/pearl_harbor_$TAG.mp4" >> "$LOG"
