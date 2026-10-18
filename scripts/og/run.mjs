// Paints the link-preview scene (scene.js) in the real app and saves it as the OG image.
//
//   npm run dev                              # in another terminal; the dev build exposes window.app
//   npm i --no-save playwright-core          # once; leaves package.json alone
//   node scripts/og/run.mjs [out.jpg]        # default: public/og.jpg
//
// Uses your installed Google Chrome, headless. The app is opened at 1200x630 with a
// device scale of 2, so the sheet is painted at full resolution; the capture is then
// taken at CSS scale for an exact 1200x630 image. Set OG_SNAPS=<dir> to also save a
// screenshot after each stage of the scene.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const out = process.argv[2] ?? 'public/og.jpg';
const snaps = process.env.OG_SNAPS;
const here = fileURLToPath(new URL('.', import.meta.url));

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })).newPage();
page.on('pageerror', e => console.log('[page error]', e.message));
if (snaps) await page.exposeFunction('__snap', name => page.screenshot({ path: `${snaps}/${name}.png` }));
await page.goto('http://localhost:5173');
await page.waitForFunction(() => window.app?.engine, null, { timeout: 15000 });

await page.addScriptTag({ content: readFileSync(here + 'lib.js', 'utf8') });
await page.addScriptTag({ content: readFileSync(here + 'scene.js', 'utf8') });
const t = Date.now();
await page.evaluate(async () => window.__scene(await window.__kit()));
console.log(`painted in ${((Date.now() - t) / 1000).toFixed(0)}s`);

await page.addStyleTag({ content: '.cursor { display: none !important; }' });   // no brush ring in the shot
await page.waitForTimeout(500);
await page.screenshot({ path: out, type: 'jpeg', quality: 86, scale: 'css' });
console.log(`saved ${out}`);
await browser.close();
