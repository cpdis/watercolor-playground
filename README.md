# Watercolor

A watercolour painting app that runs in your browser. Paint flows only where the paper is wet, colours mix the way real pigments do, and washes dry with soft blooms and dark tide lines.

**[Open the app →](https://watercolor.cpd.dev)** Nothing to install. Works with a mouse, a touchscreen or a stylus such as an Apple Pencil.

> This is a fork of [msurguy/watercolor-playground](https://github.com/msurguy/watercolor-playground), hosted at [watercolor.cpd.dev](https://watercolor.cpd.dev). The original runs at [msurguy.github.io/watercolor-playground](https://msurguy.github.io/watercolor-playground/).

![A landscape painted in the app: a blue sky, a pink and violet horizon, green and yellow fields and small trees](docs/screenshots/landscape.webp)

## What you can do

### Mix colours like real paint

Pigment is stored as a light spectrum rather than as RGB, so mixes work like paint does. Yellow and blue make green, rose and ultramarine make violet, and burnt sienna and ultramarine make a soft grey. Put a colour down while the paper is still wet and it bleeds into its neighbours. Paint it on dry paper and you get a hard edge.

![Three pairs of overlapping colour circles, labelled yellow + blue, rose + ultramarine and sienna + ultramarine, mixing where they overlap](docs/screenshots/colour-mixing.webp)

### Choose from 14 brushes

Rounds, flats, a rigger, a hake, a mop, a fan, a dry brush, a sponge, spatter, stipple, sumi and more. Each brush has its own tip and its own way of handling water. A dry brush only touches the bumps of the paper, so its strokes break up. Flats and daggers follow the tilt of an Apple Pencil.

You can also turn any PNG or JPG into a brush: choose **Import texture…** in the brush library, or drop an image onto the page.

![The brush library open next to sample strokes of all 14 brushes in different colours](docs/screenshots/brushes.webp)

### Write text, draw shapes, fill areas

- **Text (T).** Type a line and tap the paper. The brush writes each letter stroke by stroke, using single-line plotter fonts.
- **Shape (G).** Drag to draw a line, an arrow, a rectangle, an ellipse, a triangle, a polygon or a star. You can also trace your own SVG file.
- **Fill (K).** Tap an area and a wash spreads out from that spot to fill it, pooling and drying like a hand-painted wash.

![Hand-lettered "Hello, watercolour" above a pink rectangle, a blue ellipse and a yellow star, each outlined in ink and filled with a wash, with the Text panel open](docs/screenshots/text-shapes-fill.webp)

### And more

- **Water, Pen, Lift and Dry.** Wet the paper and push paint around with clear water. Draw ink lines that feather into wet areas. Blot wet paint off with a tissue. Flash-dry the sheet so you can glaze new colour over it.
- **Paper.** Ten paper types, including cold press, hot press, rough, khadi, washi and kraft, at sizes from postcard to 2400 × 1600.
- **Reference image.** Put a photo or a sketch under the paint and trace over it. iPhone HEIC photos work too.
- **History.** Undo and redo any step, or jump straight to an earlier step in the History panel.
- **Save.** Export a PNG, JPEG or WebP with a transparent, white or paper background. Save a project file (`.wcp`) to keep the wet paint and carry on later.
- **Hand painting.** Turn on **Settings → Hand** and paint in front of your webcam. Pinch to paint, and rest your hand on a button to press it.
- **Works offline.** Add it to your home screen and it opens with no network, for example on a plane. See [Use it offline](#use-it-offline).

## Use it offline

Install the app from the home screen once while you are online. After that it opens and paints with no Wi-Fi, and that includes the text fonts and iPhone photo import.

**Before the flight (iPad or iPhone):**

1. Open [watercolor.cpd.dev](https://watercolor.cpd.dev) in **Safari** while you are on Wi-Fi.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. **Open it from the new home-screen icon** while you are still online. On iOS the home-screen app keeps its own storage, separate from Safari, so it must download its copy itself.
4. Wait for **"Ready to use offline"** at the top (a few seconds, about 8 MB).
5. Test it: turn on **Airplane Mode**, close the app (swipe it away), and open it from the icon. It should open and paint.

On Android, open the site in Chrome and choose **Install app** (or **Add to Home screen**), then do steps 3 to 5.

**On the flight:**

- **Save paintings before you close the app.** The painting lives only in memory, so closing the app (or iOS closing it in the background) clears the paper. Tap **Save** for a PNG or JPEG, or tap **Save project** in the same panel for a `.wcp` file that keeps the wet paint (you can open it later and carry on).
- **Hand painting** downloads its tracking model the first time someone uses it. Turn it on once before the flight if the kids want it offline.

**Updates:** when you are online and a new version is out, the app says **"A new version is ready"**. It never reloads by itself, because reloading clears the paper. If there is paint on the paper, the first tap on **Reload** only warns you, and the second tap reloads.

## How to paint

1. Pick a pigment from the palette at the bottom and a brush from the top of the left toolbar.
2. Paint with the **Brush** (B). While the paint is wet, add a second colour next to it and watch them mix.
3. Use **Water** (W) to soften edges or move wet paint around.
4. Press **Dry** (D) when you want to glaze over a layer without disturbing it.
5. Press **Save** (S) to download your painting.

With a stylus, pressure changes the stroke. The barrel button switches to water and the eraser end lifts paint. On an iPad, once you have used an Apple Pencil, your finger becomes the water brush.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| **B** / **W** / **P** / **L** | Brush / Water / Pen / Lift |
| **T** / **G** / **K** | Text / Shape / Fill |
| **D** | Dry the paper |
| **1–9**, **0** | Choose a pigment (**0** is white gouache) |
| **,** / **.** | Previous / next brush |
| **[** / **]** | Smaller / larger brush |
| **⌘Z** / **⇧⌘Z** | Undo / redo |
| **+** / **−**, **⇧1** | Zoom in / out, fit to screen |
| **R** | Show or hide the reference image |
| **S** | Save the image with your last export settings |
| **⌘S** / **⌘O** | Save / open a project file |
| **F** | Fullscreen |
| **Esc** | Close a panel or stop drawing |

On Windows and Linux, use Ctrl instead of ⌘.

## Run it yourself

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone https://github.com/cpdis/watercolor-playground.git
cd watercolor-playground
npm install
npm run dev      # opens at http://localhost:5173
npm run build    # builds a static site into dist/
```

### Deployment (this fork)

Vercel hosts this fork as the `watercolor` project. Every push to `main` deploys to production at [watercolor.cpd.dev](https://watercolor.cpd.dev). Vercel detects Vite and builds `dist/` with no extra config. A Cloudflare CNAME on the `cpd.dev` zone points the subdomain at Vercel. The Vercel Firewall has Bot Protection (challenge) and AI bot blocking (deny) turned on, so `curl` gets a 429 "Security Checkpoint" while real browsers load normally.

To pull in new work from the original repo:

```bash
git fetch upstream
git merge upstream/main
git push origin main
```

The upstream GitHub Pages workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) stays in the tree to keep merges clean. GitHub does not run a fork's workflows until someone enables them in the Actions tab, so leave them off.

### Offline support (how it works)

This is a PWA built with [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (`injectManifest`). It is off in `npm run dev`.

- [src/sw.ts](src/sw.ts) is the service worker. It precaches the whole build: the app shell, both lazy chunks (HEIC decoder, hand tracking) and all 61 single-line font files, about 8 MB. It also caches Hand mode's MediaPipe files from their CDNs the first time they load.
- **Page loads go to the network first** (4 s timeout) and fall back to the cached app offline. Vercel Bot Protection renews its challenge cookie on page loads. If launches came from the cache forever, the cookie would expire, the browser's update checks for `sw.js` would get a 429, and the app would stay on an old version without anyone noticing. A side effect: an online launch always runs the latest deploy.
- [src/app/pwa.ts](src/app/pwa.ts) registers the worker and decides about updates. When a new worker is waiting, the page asks it whether it precaches the page's own script. If it does, the page already runs that build, so the workers swap quietly. If not, [UpdatePrompt](src/components/UpdatePrompt.tsx) offers a reload. Nothing ever reloads without a tap.
- The web manifest and icons come from [vite.config.ts](vite.config.ts) and `public/`. iOS reads `apple-touch-icon.png` and the `apple-mobile-web-app-*` tags in [index.html](index.html).

To check it end to end in headless Chrome:

```bash
npm i --no-save playwright-core
node scripts/check-offline.mjs
```

It builds three versions of the app, serves them like deploys, and runs 17 checks: install, an offline reload, painting offline, fonts and chunks loading offline, the update prompt (it never reloads by itself, and the first tap only warns when there is paint), and the quiet swap for a page that is already current. Run it after any change to `src/sw.ts`, `src/app/pwa.ts` or the PWA config.

### Painted images (link preview and icons)

The app paints its own images. [scripts/paint/](scripts/paint/) drives the real engine (Fill-tool washes, scripted brush, pen and lift strokes, Dry) and takes screenshots:

- [public/og.jpg](public/og.jpg) (1200 × 630) is the Open Graph image that the tags in [index.html](index.html) point to: a fairy over toadstools, with the toolbars in view. Scene: [og.js](scripts/paint/og.js).
- [public/icon-512.png](public/icon-512.png), `icon-192.png` and `apple-touch-icon.png` (180) are the app icons: one ultramarine and rose bloom on bare paper, centred inside the maskable safe zone. Scene: [icon.js](scripts/paint/icon.js).

To repaint them after you change a scene or the engine:

```bash
npm run dev                              # keep this running in another terminal
npm i --no-save playwright-core          # package.json stays unchanged; any later `npm install` removes it again
node scripts/paint/run.mjs og            # about 2–3 minutes; writes public/og.jpg
node scripts/paint/run.mjs icons         # about 10 seconds; writes the three icons
```

It uses your installed Google Chrome in headless mode. Set `OG_SNAPS=/some/dir` to save a screenshot after each stage of the OG scene. The brushes add a little randomness, so each run comes out slightly different.

**Previews and the firewall.** Bot Protection lets Vercel's [verified bots](https://vercel.com/docs/bot-management#verified-bots) through, and that list includes the Facebook, X and LinkedIn preview bots. The Slack, Discord, Telegram, WhatsApp and iMessage preview fetchers are not verified, so Bot Protection would challenge them and those apps would show no preview. A custom WAF rule, "Link previews: let unverified preview bots fetch / and /og.jpg", lets them through. It matches only when both conditions hold:

- the user agent matches `(Slackbot|Discordbot|TelegramBot|WhatsApp|facebookexternalhit)` (the iMessage fetcher calls itself `facebookexternalhit`)
- the path matches `^/(og\.jpg)?$`, so only the page HTML and the OG image are exempt

Anyone can fake those user agents, but they then reach only about 140 KB of public content. Everything else (the JS bundle, fonts) still gets the challenge. To check it:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -A 'Slackbot-LinkExpanding 1.0' https://watercolor.cpd.dev/og.jpg   # 200
curl -s -o /dev/null -w '%{http_code}\n' https://watercolor.cpd.dev/og.jpg                                  # 429
```

If you rename or move the OG image, update the rule's path condition too.

## How it works

The app is TypeScript and WebGL2, with a [Preact](https://preactjs.com/) interface. The simulation and the rendering don't depend on the UI.

<details>
<summary><strong>Colour mixing</strong></summary>

Each colour is stored as a **spectrum**, not as RGB:

1. A picked colour is turned into a 38-band reflectance curve (the [spectral.js](https://github.com/rvanwijnen/spectral.js) method), then into absorbance `A(λ) = −ln R(λ)`.
2. `A(λ)` is compressed to 7 numbers using a basis fitted offline over the sRGB gamut ([src/engine/spectralData.ts](src/engine/spectralData.ts)). Absorbance adds up linearly with concentration, so the fluid simulation can add, move and spread these numbers and the mix still comes out subtractive (Beer–Lambert, the transparent-glaze model that suits watercolour).
3. The display shader rebuilds the spectrum at 16 wavelengths, applies `exp(−A)` and converts the result to sRGB.

Compared with the full 38-band model, the average colour error is about 0.1–0.2 ΔE_OK (×100 scale), far below the ~2 a person can see. The 7 coefficients plus white-gouache coverage fit exactly in two RGBA16F textures.

</details>

<details>
<summary><strong>The water simulation</strong></summary>

The fluid model is adapted from [inkwash](https://github.com/johnowhitaker/inkwash): a GPU grid for velocity, pressure and vorticity, a wetness field that keeps the flow on wet paper, and pigment that settles ("fixes") into the paper.

| Layer | Format | Purpose |
| --- | --- | --- |
| velocity, pressure | RG16F / R16F, 256 px on the short side | how the water flows |
| wet | R16F, full resolution | standing water, which dries over time |
| ink | 2× RGBA16F | pigment that can still move |
| fixed | 2× RGBA16F | pigment settled into the paper |
| paper | RGBA8 | the paper texture, generated once |

Pigment moves between neighbouring pixels only as far as the water on both sides allows. That conserves pigment and keeps it off dry paper, so wet-on-dry strokes get hard edges and wet-in-wet strokes bloom as far as the water reaches. Pigment is also pulled toward the drying edge of a wash and left there, which makes the dark tide line.

</details>

<details>
<summary><strong>Performance</strong></summary>

- Only the wet part of the sheet is simulated, and only the changed part of the screen is redrawn.
- Once everything is dry, the simulation stops, so an idle painting uses no GPU time.
- Undo copies each 128 px tile only the first time a step changes it, so memory stays bounded. The oldest steps are dropped first.
- The sheet is capped at 2048 × 1536 pixels.

</details>

<details>
<summary><strong>Code layout</strong></summary>

| Folder | What's inside |
| --- | --- |
| [src/engine/](src/engine/) | WebGL2 simulation and renderer, brushes, papers, spectral colour, undo history |
| [src/app/](src/app/) | App state (`store.ts`), the tool list (`registry.ts`), keyboard shortcuts |
| [src/components/](src/components/) | Toolbar, palette, brush library, panels, overlays |
| [src/ui/](src/ui/) | Shared building blocks: panels, sliders, icons |
| [src/text/](src/text/), [src/shapes/](src/shapes/), [src/fill/](src/fill/) | The Text, Shape and Fill tools |
| [src/draw/](src/draw/) | Draws text and shape paths as real brush strokes |
| [src/reference/](src/reference/), [src/export/](src/export/), [src/project/](src/project/) | Reference image, image export, `.wcp` project files |
| [src/hand/](src/hand/) | Hand tracking with MediaPipe |

**To add a tool**, create a folder like `src/fill/` with a store class that implements `PanelTool` and a `*Panel.tsx` component, then add one entry to [src/app/registry.ts](src/app/registry.ts).

In development, `window.app` and `window.engine` are available in the browser console for scripting.

</details>

## Credits

- [inkwash](https://github.com/johnowhitaker/inkwash) by Jonathan Whitaker (MIT), for the wet-paper fluid model, and [WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) by Pavel Dobryakov, for the GPU fluid solver.
- [water-brush](https://github.com/1000ship/water-brush) by Chun Seonghyeok, where this app started.
- [spectral.js](https://github.com/rvanwijnen/spectral.js), for the spectral colour data.
- Single-line fonts (Hershey, EMS, Relief and others) from [drawingbots.net](https://drawingbots.net).
- [vpype-js](https://github.com/plottertools/vpype-js) for SVG import, [q-floodfill](https://github.com/pavelkukov/q-floodfill) for the fill tool, [heic-to](https://github.com/hoppergee/heic-to) for iPhone photos and [MediaPipe](https://ai.google.dev/edge/mediapipe) for hand tracking.

## License

[MIT](LICENSE). The bundled fonts and third-party code keep their own licenses (SIL Open Font License, Hershey Fonts license, MIT, Apache-2.0, LGPL-3.0). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
