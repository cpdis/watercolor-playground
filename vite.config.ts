import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    // Preact JSX plus Prefresh, so component edits hot-swap without reloading the page (and losing the painting)
    preact(),
    // Offline support: src/sw.ts precaches the whole app so a home-screen install opens with no network.
    // The page side (registration, update prompt) is src/app/pwa.ts. Off in `npm run dev`.
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      // the manifest and its icons are precached by the plugin itself; add the iOS icon too
      includeAssets: ['apple-touch-icon.png'],
      injectManifest: {
        // app shell, lazy chunks (HEIC decoder, hand tracking) and the single-line fonts (.svg, .txt, one .png)
        globPatterns: ['**/*.{js,css,html,svg,txt}', 'fonts/**/*.png'],
        // the HEIC decoder chunk is ~3.2 MB; the default limit (2 MB) would silently leave it out
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Watercolor',
        short_name: 'Watercolor',
        description: 'Paint real-feeling watercolours: wet-in-wet bleeds, pigment mixing, blooms and tide lines. Works offline.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#e9e5dc',
        theme_color: '#e9e5dc',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  server: { host: true },
  // the HEIC decoder (~3 MB) is its own chunk, only fetched when an iPhone photo needs it
  build: { chunkSizeWarningLimit: 3500 },
});
