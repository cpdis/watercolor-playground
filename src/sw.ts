// The service worker. It precaches the whole app (shell, lazy chunks, fonts, icons),
// so a home-screen install opens with no network. vite-plugin-pwa builds it
// (injectManifest) and replaces self.__WB_MANIFEST with the build's file list.
// The page side (registration, update prompt) is src/app/pwa.ts.
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { cleanupOutdatedCaches, precacheAndRoute, PrecacheFallbackPlugin, type PrecacheEntry } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkOnly } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (PrecacheEntry | string)[] };

const manifest = self.__WB_MANIFEST;

// Page loads try the network first and fall back to the precached app when offline
// (or after 4 s of nothing). Two reasons:
//  - Vercel's Bot Protection renews its challenge cookie on page loads. If launches always
//    came from the cache, the cookie would expire, every later update check for sw.js would
//    get a 429, and the app would be stuck on an old version without anyone noticing.
//  - An online launch always runs the latest deploy.
// This route must be registered before precacheAndRoute, which would otherwise answer `/`
// (via index.html) from the cache.
registerRoute(new NavigationRoute(new NetworkOnly({
  networkTimeoutSeconds: 4,
  plugins: [new PrecacheFallbackPlugin({ fallbackURL: 'index.html' })],
})));

precacheAndRoute(manifest);
cleanupOutdatedCaches();

// Hand mode loads MediaPipe's runtime and model from CDNs. Keep them once they have been used online.
registerRoute(
  ({ url }) => (url.origin === 'https://cdn.jsdelivr.net' && url.pathname.startsWith('/npm/@mediapipe/'))
    || (url.origin === 'https://storage.googleapis.com' && url.pathname.startsWith('/mediapipe-models/')),
  new CacheFirst({ cacheName: 'mediapipe', plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })] }),
);

// Messages from the page:
//  SKIP_WAITING   take over now (sent by workbox-window when the page says so)
//  HAS_URL        is this URL part of my build? A page loaded fresh from the network uses this
//                 to tell whether it already runs this version (then no prompt is needed)
const urls = new Set(manifest.map(e => new URL(typeof e === 'string' ? e : e.url, self.location.href).href));
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
  if (event.data?.type === 'HAS_URL') event.ports[0]?.postMessage(urls.has(event.data.url));
});
