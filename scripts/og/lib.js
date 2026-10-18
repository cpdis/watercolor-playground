// In-page painting kit for the OG scene. Runs inside the dev build, which exposes
// window.app. Every mark goes through the real engine: StrokeWriter for brush/pen/lift
// strokes and the Fill tool's distance-field wash for shapes, so the sim bleeds,
// pools and dries everything exactly as it would for a person painting.
//
// Scene space "V": y down, 600 units = paper height, width = 600 * aspect.
window.__kit = async function kit() {
  const app = window.app, engine = app.engine;
  const { StrokeWriter } = await import('/src/draw/StrokeWriter.ts');
  const { PALETTE } = await import('/src/palette.ts');
  const { distanceField } = await import('/src/fill/region.ts');
  const { DEFAULT_PARAMS } = await import('/src/engine/Engine.ts');
  const writer = new StrokeWriter(engine);
  const aspect = engine.aspect;
  const [dw, dh] = engine.docSize;
  const H = 600, W = H * aspect;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(r));
  // V point -> StrokeWriter units (doc heights, y up, anchor [0,0])
  const w = ([x, y]) => [x / H, 1 - y / H];

  /** Pick pigment, brush and sim params for the next marks. */
  function set({ pigment, brush, ...params } = {}) {
    if (pigment) app.current.value = PALETTE.find(p => p.name === pigment) ?? (() => { throw new Error('no pigment ' + pigment); })();
    if (brush) app.brush.value = app.builtIn.find(b => b.id === brush) ?? (() => { throw new Error('no brush ' + brush); })();
    app.params.value = { ...DEFAULT_PARAMS, ...params };
  }

  /** Paint polylines (V coords) as one undo step and wait until the last one lifts. */
  function stroke(polys, { tool = 'brush', speed = 0.9, pressure = 0.6, taper = 0.4, wobble = 0.15, ref = 0.1, maxRadius } = {}) {
    polys = polys.filter(p => p.length > 1).map(p => p.map(w));
    return new Promise(res => writer.write(polys, [0, 0], { tool, speed, pressure, taper, wobble, ref, maxRadius, label: 'OG' }, { onDone: res }))
      .then(async () => { while (engine.scripting) await frame(); });
  }

  /** Lay a Fill-tool wash over polygon `poly` (V), spreading from `seed`. */
  async function fill(poly, seed, { strength = 1, water = 0.6, soft = 0.3, speed = 0.6, paint = true } = {}) {
    const cv = new OffscreenCanvas(dw, dh), cx = cv.getContext('2d');
    // canvas row r == doc texel row r (uv y up), so V y flips once here
    cx.beginPath();
    poly.forEach(([x, y], i) => { const px = (x / H) * dh, py = (1 - y / H) * dh; i ? cx.lineTo(px, py) : cx.moveTo(px, py); });
    cx.closePath(); cx.fillStyle = '#fff'; cx.fill();
    const rgba = cx.getImageData(0, 0, dw, dh).data, mask = new Uint8Array(dw * dh);
    for (let i = 0; i < mask.length; i++) mask[i] = rgba[i * 4 + 3] > 127 ? 1 : 0;
    const sx = Math.round((seed[0] / H) * dh), sy = Math.round((1 - seed[1] / H) * dh);
    const region = distanceField(mask, dw, dh, sx, sy, 48);
    while (!engine.fillBegin(region.field, region.bbox, 'OG fill')) await frame();
    const max = region.maxDist + engine.fillMargin, pxPerS = 120 * Math.pow(25, speed);
    let from = -0.5, last = performance.now();
    while (from < max) {
      const now = await frame();
      const to = Math.min(max, from + pxPerS * Math.min(0.1, (now - last) / 1000));
      last = now;
      if (!engine.fillStep(from, to, { strength, water, soft: soft * 40, paint })) break;
      from = to;
    }
    engine.fillEnd();
  }

  /** Flash-dry the sheet (the Dry button) and wait for it to settle. */
  async function dry(wait = 1700) { await sleep(300); engine.fix(); await sleep(wait); }

  /* ---------- geometry (all V coords) ---------- */
  const rot = ([x, y], a, [ox, oy] = [0, 0]) => [ox + x * Math.cos(a) - y * Math.sin(a), oy + x * Math.sin(a) + y * Math.cos(a)];
  const ellipse = (cx, cy, rx, ry, a = 0, n = 48, t0 = 0, t1 = Math.PI * 2) =>
    Array.from({ length: n + 1 }, (_, i) => { const t = t0 + (t1 - t0) * i / n; return rot([rx * Math.cos(t), ry * Math.sin(t)], a, [cx, cy]); });
  /** Smooth path through points (Catmull-Rom). */
  const spline = (pts, n = 10) => {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let j = 0; j < n; j++) {
        const t = j / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  /** Back-and-forth horizontal sweeps between y0 and y1 (a wash done by hand). */
  const sweeps = (x0, x1, y0, y1, gap, jitter = 0) => {
    const pts = [];
    for (let y = y0, k = 0; y <= y1; y += gap, k++) {
      const j = () => (Math.random() - 0.5) * jitter;
      pts.push(k % 2 ? [x1, y + j()] : [x0, y + j()], k % 2 ? [x0, y + gap * 0.5 + j()] : [x1, y + gap * 0.5 + j()]);
    }
    return pts;
  };
  /** A small round dot: a tight spiral, so the brush lays a solid blob. */
  const dot = (cx, cy, r) => Array.from({ length: 18 }, (_, i) => { const t = i / 17, a = t * Math.PI * 4; return [cx + Math.cos(a) * r * t, cy + Math.sin(a) * r * t]; });
  const rand = (a, b) => a + Math.random() * (b - a);

  return { app, engine, W, H, set, stroke, fill, dry, sleep, rot, ellipse, spline, sweeps, dot, rand };
};
