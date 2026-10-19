// Paints a scene in the real app and saves it as a site image.
//
//   npm run dev                              # in another terminal; the dev build exposes window.app
//   npm i --no-save playwright-core          # once; leaves package.json alone
//   node scripts/paint/run.mjs og            # public/og.jpg: the link-preview image (og.js)
//   node scripts/paint/run.mjs icons         # public/icon-512.png, icon-192.png, apple-touch-icon.png (icon.js)
//
// It uses your installed Google Chrome, headless. The app is opened at 1200x630 with a device
// scale of 2, so the sheet is painted at full resolution. Set OG_SNAPS=<dir> to also save a
// screenshot after each stage of the OG scene.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const job = process.argv[2] ?? 'og';
if (!['og', 'icons'].includes(job)) throw new Error(`unknown job "${job}" (og | icons)`);
const here = fileURLToPath(new URL('.', import.meta.url));
const snaps = process.env.OG_SNAPS;

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })).newPage();
page.on('pageerror', e => console.log('[page error]', e.message));
if (snaps) await page.exposeFunction('__snap', name => page.screenshot({ path: `${snaps}/${name}.png` }));
await page.goto('http://localhost:5173');
await page.waitForFunction(() => window.app?.engine, null, { timeout: 15000 });

await page.addScriptTag({ content: readFileSync(here + 'lib.js', 'utf8') });
await page.addScriptTag({ content: readFileSync(here + (job === 'og' ? 'og.js' : 'icon.js'), 'utf8') });
const t = Date.now();
const result = await page.evaluate(async () => window.__scene(await window.__kit()));
console.log(`painted in ${((Date.now() - t) / 1000).toFixed(0)}s`);

await page.addStyleTag({ content: '.cursor { display: none !important; }' });   // no brush ring in the shot
if (job === 'icons') await page.addStyleTag({ content: '.app > :not(canvas) { visibility: hidden !important; }' });   // paper only
await page.waitForTimeout(500);

if (job === 'og') {
  // CSS scale: an exact 1200x630 image from the 2x render
  await page.screenshot({ path: 'public/og.jpg', type: 'jpeg', quality: 86, scale: 'css' });
  console.log('saved public/og.jpg');
} else {
  // 256 CSS px around the bloom at device scale 2 = exactly 512 px; smaller sizes are scaled down in the page
  const icon = await page.screenshot({ clip: { x: result.x - 128, y: result.y - 128, width: 256, height: 256 }, scale: 'device' });
  writeFileSync('public/icon-512.png', icon);
  for (const [size, file] of [[192, 'icon-192.png'], [180, 'apple-touch-icon.png']]) {
    const dataUrl = await page.evaluate(async ({ png, size }) => {
      const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
      const canvas = new OffscreenCanvas(size, size), ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, size, size);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
    }, { png: icon.toString('base64'), size });
    writeFileSync(`public/${file}`, Buffer.from(dataUrl.split(',')[1], 'base64'));
  }
  console.log('saved public/icon-512.png, icon-192.png, apple-touch-icon.png');
}
await browser.close();
