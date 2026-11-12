// Render QA stills: one (or more) frame per scene, reusing one bundle.
// usage: node tools/render/stills.mjs [scale] [sceneIdFilter] [pos=0.6]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const scale = Number(process.argv[2] ?? 0.5);
const filter = process.argv[3] ?? '';
const pos = (process.argv[4] ?? '0.6').split(',').map(Number);
const layout = JSON.parse(fs.readFileSync('src/data/layout.json', 'utf8'));
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Film', browserExecutable});
fs.mkdirSync('out/qa', {recursive: true});
for (const ch of layout.chapters) {
  for (const sc of ch.scenes) {
    if (filter && !filter.split(',').some((p) => sc.id.startsWith(p))) continue;
    for (const p of pos) {
      const frame = ch.filmFrom + sc.from + Math.round(sc.voiceAt + sc.voiceDur * p);
      const t0 = Date.now();
      await renderStill({composition, serveUrl, frame, output: `out/qa/${sc.id}_${Math.round(p * 100)}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, scale, browserExecutable, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 240000});
      console.log(sc.id, p, frame, Date.now() - t0, 'ms');
    }
  }
}
