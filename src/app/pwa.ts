import { signal } from '@preact/signals';
import { registerSW } from 'virtual:pwa-register';
import { showToast } from './toast';

// Offline support, page side: registers the service worker (src/sw.ts) and decides
// what to do when a new version has installed.
//
//   new worker waiting ──► does it precache this page's own script? ──yes──► swap workers quietly
//                                        │ no (the page is older)            (the page already runs it:
//                                        ▼                                    online launches load fresh)
//                          UpdatePrompt: "A new version is ready", reload only on a tap
//
// Nothing here reloads by itself. The painting lives only in memory, so a reload clears the paper.

/** A newer version is waiting and this page is older than it. */
export const updateReady = signal(false);

// this module is bundled into the main chunk, so this is a URL the build precaches
const ownScript = import.meta.url;
let userAsked = false;
let quietSwap = false;

const updateSW = registerSW({
  onOfflineReady: () => showToast('Ready to use offline', 3500),
  onNeedRefresh: () => { void decide(); },
  // a new worker took control of this page
  onNeedReload: () => {
    if (userAsked) location.reload();
    else if (quietSwap) quietSwap = false;
    else updateReady.value = true;   // activated from elsewhere (another tab): offer the reload
  },
});

async function decide() {
  const waiting = (await navigator.serviceWorker.getRegistration())?.waiting;
  if (waiting && await hasUrl(waiting, ownScript)) { quietSwap = true; void updateSW(); }
  else updateReady.value = true;
}

/** Ask a worker whether `url` is in its precache list (false if it does not answer). */
function hasUrl(worker: ServiceWorker, url: string): Promise<boolean> {
  return new Promise(resolve => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve(false), 1500);
    channel.port1.onmessage = e => { clearTimeout(timer); resolve(e.data === true); };
    worker.postMessage({ type: 'HAS_URL', url }, [channel.port2]);
  });
}

/** Switch to the new version and reload. Call only from a tap. */
export async function applyUpdate() {
  userAsked = true;
  updateReady.value = false;
  // a waiting worker reloads us once it takes control (onNeedReload); one already in control needs a plain reload
  if ((await navigator.serviceWorker.getRegistration())?.waiting) void updateSW();
  else location.reload();
}

export function dismissUpdate() { updateReady.value = false; }
