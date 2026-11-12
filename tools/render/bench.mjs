import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const be = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'Chapter2', browserExecutable: be});
for (const fr of (process.env.FR || "200").split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({composition, serveUrl, frame: fr, output: '/tmp/b.jpg', imageFormat: 'jpeg', browserExecutable: be, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 300000});
  console.log(process.env.TAGX, fr, Date.now() - t0);
}
