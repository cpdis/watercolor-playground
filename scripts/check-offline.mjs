// End-to-end check of offline support (src/sw.ts, src/app/pwa.ts) in headless Chrome.
//
//   npm i --no-save playwright-core          # once (any later `npm install` removes it again)
//   node scripts/check-offline.mjs
//
// It builds the app three times (v1, v2, v3: each with a different main chunk, like real
// deploys) into a temp folder, serves one version at a time from a tiny local server, and checks:
//   1. install:    "Ready to use offline" shows; the precache holds the app, fonts, lazy chunks
//   2. offline:    with the network cut, a reload opens the app, it paints, fonts and chunks load
//   3. stale page: v2 is deployed while v1 is open. The prompt shows, nothing reloads by itself,
//                  the first tap only warns (there is paint), the second tap moves to v2
//   4. fresh page: v3 is deployed, then the app is opened online. It runs v3 at once, the worker
//                  swaps quietly, no prompt
// Exits 1 if any check fails.
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { chromium } from 'playwright-core';
import { build } from 'vite';

const root = join(tmpdir(), 'watercolor-check-offline');
const PORT = 4180;
let failures = 0;
const check = (ok, what) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}`); if (!ok) failures++; };

// ---- three builds, each tagged so its main chunk (and so its hash) differs
for (const tag of ['v1', 'v2', 'v3']) {
  await build({
    logLevel: 'error',
    build: { outDir: join(root, tag), emptyOutDir: true },
    plugins: [{ name: 'tag-build', renderChunk: (code, chunk) => (chunk.isEntry ? `${code}\nglobalThis.__build=${JSON.stringify(tag)};` : null) }],
  });
}

// ---- a static server whose version can be switched, like a deploy
let serving = 'v1';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try {
    const body = await readFile(join(root, serving, path === '/' ? 'index.html' : path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? (path === '/' ? 'text/html' : 'application/octet-stream'), 'cache-control': 'no-cache' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
}).listen(PORT);
const url = `http://localhost:${PORT}/`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1200, height: 800 } });
const page = await context.newPage();
// Poll a page predicate (sync or async) until it is truthy. Not page.waitForFunction: it does not
// await an async predicate, so the returned Promise counts as truthy and the wait passes at once.
const until = async (fn, arg, timeout = 15000) => {
  for (const end = Date.now() + timeout; Date.now() < end; await new Promise(r => setTimeout(r, 200))) {
    if (await page.evaluate(fn, arg).catch(() => false)) return true;   // throws mid-navigation: try again
  }
  return false;
};
const build_ = () => page.evaluate(() => globalThis.__build);
const paint = async () => { await page.mouse.move(500, 300); await page.mouse.down(); await page.mouse.move(700, 380, { steps: 12 }); await page.mouse.up(); };
const undoEnabled = () => until(() => document.querySelector('button[title^="Undo"]')?.disabled === false, null, 5000);

try {
  // 1. install
  await page.goto(url);
  check(await until(() => document.querySelector('.toast')?.textContent === 'Ready to use offline'), 'first visit: "Ready to use offline" toast');
  const cached = await page.evaluate(async () => {
    const names = await caches.keys();
    const keys = (await Promise.all(names.map(async n => (await caches.open(n)).keys()))).flat().map(r => r.url);
    return { count: keys.length, font: keys.some(u => u.includes('/fonts/')), heic: keys.some(u => u.includes('heic-to')), hand: keys.some(u => u.includes('/hand-')) };
  });
  check(cached.count >= 70 && cached.font && cached.heic && cached.hand, `precache holds ${cached.count} files incl. fonts, HEIC and hand chunks`);

  // 2. offline
  await context.setOffline(true);
  await page.reload();
  check(await until(() => !!document.querySelector('canvas') && !!document.querySelector('button[title^="Undo"]')), 'offline reload: the app opens');
  await paint();
  check(await undoEnabled(), 'offline: a brush stroke paints (Undo turns on)');
  const lazy = await page.evaluate(async () => {
    const names = await caches.keys();
    const keys = (await Promise.all(names.map(async n => (await caches.open(n)).keys()))).flat().map(r => r.url);
    // fetch the plain URL the app asks for, not the cache key (revisioned keys carry ?__WB_REVISION__=…)
    const pick = s => { const u = new URL(keys.find(k => k.includes(s))); u.search = ''; return u.href; };
    const ok = async u => { try { return (await fetch(u)).ok; } catch { return false; } };
    return { heic: await ok(pick('heic-to')), hand: await ok(pick('/hand-')), font: await ok(pick('/fonts/')) };
  });
  check(lazy.heic, 'offline: the HEIC decoder chunk loads from the cache');
  check(lazy.hand, 'offline: the hand-tracking chunk loads from the cache');
  check(lazy.font, 'offline: a single-line font loads from the cache');

  // 3. stale page: deploy v2 while v1 is open
  await context.setOffline(false);
  await page.reload();
  check(await build_() === 'v1', 'back online: page runs v1');
  await page.evaluate(() => { window.__marker = 'still here'; });
  serving = 'v2';
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  check(await until(() => document.querySelector('.update span')?.textContent === 'A new version is ready'), 'v2 deployed: "A new version is ready" shows');
  await page.waitForTimeout(2500);
  check(await page.evaluate(() => window.__marker) === 'still here', 'no reload on its own');
  await paint();
  await undoEnabled();
  await page.click('.update button.primary');
  check(await until(() => document.querySelector('.update span')?.textContent.startsWith('Reloading clears the paper'), null, 3000), 'with paint, the first tap only warns');
  check(await page.evaluate(() => window.__marker) === 'still here', 'still no reload after the first tap');
  await Promise.all([page.waitForEvent('load'), page.click('.update button.primary')]);
  check(await until(() => globalThis.__build === 'v2') && await page.evaluate(() => window.__marker) === undefined, 'second tap: reloads into v2');

  // 4. fresh page: deploy v3, then open the app online
  serving = 'v3';
  await page.goto(url);
  check(await build_() === 'v3', 'v3 deployed, opened online: page runs v3 at once (network first)');
  await page.evaluate(() => { window.__marker = 'still here'; });
  check(await until(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!r?.active && !r.waiting && !r.installing; }), 'the v3 worker installs and takes over');
  await page.waitForTimeout(2000);
  check(await page.evaluate(() => !document.querySelector('.update') && window.__marker === 'still here'), 'no prompt and no reload (the page already runs v3)');
  await context.setOffline(true);
  await page.reload();
  check(await until(() => globalThis.__build === 'v3'), 'offline again: the cache now serves v3');
} finally {
  await browser.close();
  server.close();
}
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
