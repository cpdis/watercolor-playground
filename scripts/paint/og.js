// Fairy-glen OG scene, painted layer by layer like a real watercolour:
// sky wash + lifted moon -> hills -> toadstools -> fairy -> ink -> sparkles, grass, flowers.
// V space: y down, 600 = paper height, W = width. Safe zone avoids the app chrome:
// toolbar x<40, action bar x>690 & y<52, palette 267<x<877 & y>537.
window.__scene = async function scene(k) {
  const { app, W, set, stroke, fill, dry, sleep, sweeps, ellipse, spline, dot, rot, rand } = k;
  const snap = n => window.__snap?.(n);
  app.hintGone.value = true;

  /* ---------- 1. twilight sky: wet the sheet, drop colour bands in, lift a moon ---------- */
  set({ pigment: 'French Ultramarine', water: 0.9 });
  await fill([[0, 0], [W, 0], [W, 440], [0, 440]], [W / 2, 200], { paint: false, water: 0.95, speed: 0.75 });
  const band = async (pigment, load, y0, y1, pressure) => {
    set({ pigment, brush: 'mop', size: 0.85, water: 0.82, load, bleed: 0.72 });
    await stroke([sweeps(-20, W + 20, y0, y1, 34, 10)], { pressure, speed: 1.6, taper: 0 });
  };
  await band('French Ultramarine', 0.6, 0, 95, 0.78);
  await band('Dioxazine Violet', 0.45, 85, 175, 0.7);
  await band('Quinacridone Rose', 0.38, 168, 280, 0.65);
  await band('New Gamboge', 0.34, 275, 430, 0.6);
  // blot a moon out of the damp wash: soft halo first, then the core
  const moon = [175, 118];
  set({ size: 0.55 });
  const spiral = (r, turns) => Array.from({ length: 60 }, (_, i) => { const t = i / 59, a = t * turns * Math.PI * 2; return [moon[0] + Math.cos(a) * r * t, moon[1] + Math.sin(a) * r * t]; });
  await stroke([spiral(34, 3)], { tool: 'lift', pressure: 0.9, speed: 0.35, taper: 0, wobble: 0 });
  await sleep(2200);
  await dry();
  await stroke([spiral(22, 3)], { tool: 'lift', pressure: 0.8, speed: 0.3, taper: 0, wobble: 0 });
  await snap('1-sky');

  /* ---------- 2. far hills (cool, pale) and the near hill (sunlit crest, shaded foot) ---------- */
  const far = [[0, 392], ...spline([[0, 392], [W * 0.18, 360], [W * 0.38, 384], [W * 0.6, 352], [W * 0.82, 378], [W, 360]], 12), [W, 600], [0, 600]];
  set({ pigment: 'Phthalo Blue', load: 0.4, water: 0.7 });
  await fill(far, [W * 0.5, 500], { strength: 0.55, water: 0.7 });
  await dry();
  const crest = [[0, 470], [W * 0.22, 455], [W * 0.45, 482], [W * 0.7, 438], [W * 0.88, 450], [W, 470]];
  set({ pigment: 'Sap Green', load: 0.55, water: 0.75 });
  await fill([[0, 470], ...spline(crest, 12), [W, 600], [0, 600]], [W * 0.5, 560], { strength: 0.95, water: 0.75 });
  set({ pigment: 'Hansa Yellow', brush: 'round', size: 0.75, water: 0.75, load: 0.6, bleed: 0.7 });
  await stroke([spline(crest.map(([x, y]) => [x, y + 8]), 12)], { pressure: 0.8, speed: 1.2 });
  set({ pigment: 'Phthalo Green', brush: 'mop', size: 0.6, water: 0.7, load: 0.5, bleed: 0.6 });
  await stroke([sweeps(-20, W + 20, 565, 600, 22, 6)], { pressure: 0.6, speed: 1.4, taper: 0 });
  await sleep(1500);
  await dry();
  // the moon, crisp: a gouache disc with a warm blush
  set({ pigment: 'White Gouache', load: 0.7, water: 0.5 });
  await fill(ellipse(moon[0], moon[1], 30, 30, 0, 40), moon, { strength: 1.1, water: 0.5, soft: 0.15 });
  set({ pigment: 'Hansa Yellow', brush: 'round', size: 0.4, water: 0.8, load: 0.2 });
  await stroke([ellipse(moon[0] + 6, moon[1] + 5, 14, 12, 0, 20)], { pressure: 0.5, speed: 0.4, taper: 0 });
  await dry();
  await snap('2-hills');

  /* ---------- 3. toadstools on the knoll ---------- */
  const toad = async ({ cx, base, top, sw, cw, ch, lean = 0, spots }) => {
    const L = p => rot([p[0] - cx, p[1] - base], lean, [cx, base]);
    const stem = [[cx - sw * 1.25, base], ...spline([[cx - sw * 1.25, base], [cx - sw * 1.05, (base + top) / 2], [cx - sw * 0.85, top]], 8),
      ...spline([[cx + sw * 0.85, top], [cx + sw * 1.05, (base + top) / 2], [cx + sw * 1.25, base]], 8)].map(L);
    const capBase = top + ch * 0.08;
    const cap = [...ellipse(cx, capBase, cw, ch, 0, 40, Math.PI, Math.PI * 2), ...spline([[cx + cw, capBase], [cx, capBase + ch * 0.16], [cx - cw, capBase]], 10)].map(L);
    // watercolour is transparent, so block the silhouette in with gouache first:
    // otherwise the hills show through the cap and the cream stem vanishes into the grass
    set({ pigment: 'White Gouache', load: 0.75, water: 0.5 });
    await fill(stem, L([cx, (base + top) / 2]), { strength: 1.2, water: 0.5, soft: 0.08 });
    await fill(cap, L([cx, capBase - ch * 0.5]), { strength: 1.2, water: 0.5, soft: 0.08 });
    await dry(1400);
    // stem shading on the right
    set({ pigment: 'Yellow Ochre', brush: 'round', size: 0.3, water: 0.6, load: 0.35, edge: 0.2 });
    await stroke([[[cx + sw * 0.55, top + 4], [cx + sw * 0.8, base - 4]].map(L)], { pressure: 0.6, speed: 0.6 });
    // cap: scarlet glaze, rose blush on the lit side, a sienna rim just inside the edge
    set({ pigment: 'Pyrrol Scarlet', load: 0.6, water: 0.6 });
    await fill(cap, L([cx, capBase - ch * 0.5]), { strength: 1.15, water: 0.6, soft: 0.1 });
    set({ pigment: 'Quinacridone Rose', brush: 'round', size: 0.45, water: 0.6, load: 0.4 });
    await stroke([ellipse(cx - cw * 0.4, capBase - ch * 0.6, cw * 0.2, ch * 0.15, -0.5, 14).map(L)], { pressure: 0.6, speed: 0.4, taper: 0 });
    set({ pigment: 'Burnt Sienna', brush: 'round', size: 0.32, water: 0.45, load: 0.45 });
    await stroke([spline([[cx - cw * 0.9, capBase - 3], [cx, capBase + ch * 0.08], [cx + cw * 0.9, capBase - 3]], 10).map(L)], { pressure: 0.6, speed: 0.7 });
    await dry(1400);
    // gouache spots
    set({ pigment: 'White Gouache', brush: 'detail', size: 0.5, water: 0.45, load: 0.9 });
    await stroke(spots.map(([u, v, r]) => dot(...L([cx + u * cw, capBase - v * ch]), r)), { pressure: 0.85, speed: 0.25, taper: 0, wobble: 0 });
  };
  await toad({ cx: 800, base: 494, top: 362, sw: 22, cw: 118, ch: 108, lean: 0.04,
    spots: [[-0.55, 0.45, 9], [-0.12, 0.8, 11], [0.32, 0.55, 10], [0.7, 0.3, 7], [-0.8, 0.15, 6], [0.05, 0.35, 7], [0.5, 0.85, 6]] });
  await toad({ cx: 965, base: 502, top: 440, sw: 13, cw: 62, ch: 54, lean: 0.14, spots: [[-0.4, 0.5, 7], [0.25, 0.7, 7], [0.6, 0.25, 5]] });
  await toad({ cx: 690, base: 506, top: 478, sw: 8, cw: 34, ch: 28, lean: -0.12, spots: [[-0.3, 0.5, 5], [0.35, 0.45, 4]] });
  await dry();
  await snap('3-toadstools');

  /* ---------- 4. the fairy (local frame: waist at origin, facing right) ---------- */
  const origin = [450, 262], s = 1.3, tilt = 0.3;
  const F = p => rot([p[0] * s, p[1] * s], tilt, origin);
  const Fp = pts => pts.map(F);
  const wing = (cx, cy, rx, ry, a) => Fp(ellipse(cx, cy, rx, ry, a, 36));
  const wings = [
    { e: [-34, -90, 42, 17, 1.06], pig: 'Phthalo Blue', str: 0.28 },     // upper, behind
    { e: [-28, -6, 24, 11, -0.9], pig: 'Phthalo Blue', str: 0.28 },      // lower, behind
    { e: [-54, -74, 50, 24, 0.71], pig: 'Phthalo Blue', str: 0.4 },      // upper, front
    { e: [-42, -16, 32, 15, -0.53], pig: 'Phthalo Blue', str: 0.4 },     // lower, front
  ];
  for (const { e, pig, str } of wings) {
    set({ pigment: pig, load: 0.3, water: 0.85 });
    await fill(wing(...e), F([e[0], e[1]]), { strength: str, water: 0.85, soft: 0.2 });
    // an iridescent rose blush pooling at the tip
    set({ pigment: 'Quinacridone Rose', brush: 'round', size: 0.4, water: 0.85, load: 0.25 });
    const tip = rot([e[2] * 0.55, 0], e[4], [e[0], e[1]]);
    await stroke([Fp(ellipse(tip[0], tip[1], e[2] * 0.25, e[3] * 0.35, e[4], 12))], { pressure: 0.5, speed: 0.5, taper: 0 });
  }
  await dry();
  // face: a pale warm wash (limbs are ink lines, drawn later, so they stay crisp)
  set({ pigment: 'Yellow Ochre', load: 0.3, water: 0.6 });
  await fill(Fp(ellipse(8, -62, 15, 15, 0, 30)), F([8, -62]), { strength: 0.22, water: 0.6, soft: 0.12 });
  const limbs = [
    Fp(spline([[5, -38], [24, -47], [40, -60]], 6)),         // wand arm, reaching forward
    Fp(spline([[-5, -38], [-20, -28], [-32, -31]], 6)),      // back arm
    Fp(spline([[6, 34], [15, 56], [26, 70]], 6)),            // front leg
    Fp(spline([[-12, 36], [-24, 52], [-42, 56]], 6)),        // back leg, kicked up
  ];
  // dress: rose, deepening to violet at the hem
  const dress = Fp([[-8, -44], [7, -44], [8, -24], [6, -8], [22, 34], [13, 41], [5, 34], [-5, 43], [-14, 34], [-24, 41], [-34, 30], [-6, -8], [-9, -24]]);
  set({ pigment: 'Quinacridone Rose', load: 0.55, water: 0.7 });
  await fill(dress, F([0, -10]), { strength: 0.85, water: 0.7, soft: 0.1 });
  set({ pigment: 'Dioxazine Violet', brush: 'round', size: 0.4, water: 0.8, load: 0.4 });
  await stroke([Fp(spline([[-30, 30], [-14, 34], [5, 32], [18, 33]], 8))], { pressure: 0.6, speed: 0.6 });
  await dry(1200);
  // hair: auburn over the back and top of the head, plus a bun. Filled, not brushed, so nothing bleeds onto the wings
  const hair = Fp([...ellipse(8, -62, 18, 18, 0, 28, Math.PI * 0.55, Math.PI * 1.8), [17, -71], [9, -71], [3, -65], [1, -55]]);
  const bun = Fp(ellipse(-6, -80, 8, 8, 0, 20));
  set({ pigment: 'Burnt Sienna', load: 0.75, water: 0.45 });
  await fill(hair, F([0, -70]), { strength: 1.25, water: 0.45, soft: 0.06 });
  await fill(bun, F([-6, -80]), { strength: 1.25, water: 0.45, soft: 0.06 });
  await dry();
  await snap('4-fairy-wash');

  /* ---------- 5. ink: line-and-wash outlines that make her read at thumbnail size ---------- */
  const ink = { tool: 'pen', pressure: 0.55, speed: 0.55, taper: 0.5, wobble: 0.35, ref: 0.08 };
  set({ pigment: "Payne's Grey", size: 0.24 });   // finer line for the gauzy wings
  await stroke([...wings.map(({ e }) => wing(...e)),
    Fp(spline([[-6, -36], [-30, -58], [-62, -82]], 6)), Fp(spline([[-6, -36], [-40, -66], [-88, -96]], 6)),   // wing veins
    Fp(spline([[-6, -30], [-28, -16], [-58, -24]], 6))], ink);
  set({ pigment: "Payne's Grey", size: 0.3 });
  await stroke([[...dress, dress[0]], Fp(ellipse(8, -62, 15, 15, 0, 30)), [...hair, hair[0]], bun, ...limbs], ink);
  set({ pigment: 'Burnt Umber', size: 0.3 });
  await stroke([Fp(dot(14, -64, 1.8)), Fp(spline([[11, -56], [14, -55], [17, -57]], 4)), Fp([[40, -60], [64, -84]])], { ...ink, wobble: 0.1 });
  set({ pigment: 'Quinacridone Rose', brush: 'detail', size: 0.5, water: 0.6, load: 0.5 });
  await stroke([Fp(dot(4, -56, 3.5)), Fp(dot(26, 70, 4)), Fp(dot(-42, 56, 4))], { pressure: 0.7, speed: 0.2, taper: 0, wobble: 0 });   // cheek, slippers
  // wand star with a gouache glint
  const star = F([70, -90]);
  const starPts = Array.from({ length: 11 }, (_, i) => { const r = i % 2 ? 8 : 20, a = -Math.PI / 2 + i * Math.PI / 5; return [star[0] + Math.cos(a) * r, star[1] + Math.sin(a) * r]; });
  set({ pigment: 'Hansa Yellow', load: 0.7, water: 0.55 });
  await fill(starPts, star, { strength: 1.2, water: 0.55, soft: 0.06 });
  await dry(1200);
  set({ pigment: 'White Gouache', brush: 'detail', size: 0.4, water: 0.4, load: 1 });
  await stroke([dot(star[0], star[1], 3)], { pressure: 0.8, speed: 0.2, taper: 0, wobble: 0 });
  await snap('5-ink');

  /* ---------- 6. magic: a glowing ribbon from the wand that loops down to the big toadstool ---------- */
  const trail = spline([star, [star[0] + 70, star[1] - 30], [star[0] + 150, star[1] - 5], [star[0] + 175, star[1] + 55],
    [star[0] + 130, star[1] + 80], [star[0] + 120, star[1] + 35], [star[0] + 190, star[1] + 40], [star[0] + 260, star[1] + 95], [800, 230]], 12);
  set({ pigment: 'Hansa Yellow', brush: 'round', size: 0.5, water: 0.85, load: 0.35 });
  await stroke([trail], { pressure: 0.55, speed: 0.9, taper: 0.7, wobble: 0.2 });
  set({ pigment: 'Hansa Yellow', brush: 'spatter', size: 0.5, water: 0.9, load: 0.9 });
  await stroke([trail], { pressure: 0.35, speed: 0.6, taper: 0.3 });
  await dry(1200);
  set({ pigment: 'White Gouache', brush: 'spatter', size: 0.45, water: 0.6, load: 1 });
  await stroke([trail.map(([x, y]) => [x + 4, y - 3])], { pressure: 0.3, speed: 0.6, taper: 0.3 });
  // twinkles along the ribbon and in the sky: little gouache crosses
  const twinkle = (x, y, r) => [[[x - r, y], [x + r, y]], [[x, y - r], [x, y + r]], [[x - r * 0.4, y - r * 0.4], [x + r * 0.4, y + r * 0.4]], [[x - r * 0.4, y + r * 0.4], [x + r * 0.4, y - r * 0.4]]];
  set({ pigment: 'White Gouache', brush: 'detail', size: 0.35, water: 0.4, load: 1 });
  const twinkles = [[0.18, 13], [0.36, 9], [0.55, 11], [0.74, 8], [0.9, 10]].map(([t, r]) => twinkle(...trail[Math.floor(t * (trail.length - 1))], r))
    .concat([[330, 70, 9], [560, 95, 7], [640, 40, 6], [280, 170, 6], [95, 230, 7], [1000, 160, 8]].map(([x, y, r]) => twinkle(x, y, r)));
  await stroke(twinkles.flat(), { pressure: 0.7, speed: 0.5, taper: 0.8, wobble: 0 });
  await snap('6-magic');

  /* ---------- 7. grass, fireflies, daisies ---------- */
  const crestY = x => { const c = spline(crest, 12); let best = c[0]; for (const p of c) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; return best[1]; };
  const blades = [];
  for (const [x0, x1, n] of [[40, 260, 22], [600, 1080, 40]]) for (let i = 0; i < n; i++) {
    const x = rand(x0, x1), y = crestY(x) + rand(14, 42), h = rand(14, 30), lean = rand(-9, 9);
    blades.push(spline([[x, y], [x + lean * 0.4, y - h * 0.55], [x + lean, y - h]], 4));
  }
  set({ pigment: 'Phthalo Green', brush: 'rigger', size: 0.55, water: 0.5, load: 0.8 });
  await stroke(blades, { pressure: 0.7, speed: 1.2, taper: 0.9, wobble: 0.1 });
  const flies = [[580, 330], [660, 300], [905, 330], [1095, 405], [1090, 300], [610, 420], [930, 260], [150, 440], [250, 410], [1000, 430]];
  // soft glow (no tide-line edge, or they dry as rings), then a bright gouache core
  set({ pigment: 'Hansa Yellow', brush: 'round', size: 0.4, water: 0.8, load: 0.6, edge: 0 });
  await stroke(flies.map(([x, y]) => dot(x, y, 4)), { pressure: 0.7, speed: 0.3, taper: 0, wobble: 0 });
  await dry(1200);
  set({ pigment: 'White Gouache', brush: 'detail', size: 0.45, water: 0.4, load: 1, edge: 0 });
  await stroke(flies.map(([x, y]) => dot(x, y, 2.5)), { pressure: 0.8, speed: 0.2, taper: 0, wobble: 0 });
  // daisies in the foreground grass
  const daisies = [[120, 512, 11], [205, 498, 9], [1050, 515, 10], [935, 520, 8], [600, 520, 7]];
  await stroke(daisies.flatMap(([x, y, r]) => Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return [[x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35], [x + Math.cos(a) * r, y + Math.sin(a) * r]]; })),
    { pressure: 0.8, speed: 0.4, taper: 0.5, wobble: 0 });
  set({ pigment: 'New Gamboge', brush: 'detail', size: 0.45, water: 0.5, load: 0.9 });
  await stroke(daisies.map(([x, y]) => dot(x, y, 2.5)), { pressure: 0.8, speed: 0.2, taper: 0, wobble: 0 });
  await sleep(1500);

  // leave the UI showing a friendly brush and pigment
  set({ pigment: 'Quinacridone Rose', brush: 'round' });
};
