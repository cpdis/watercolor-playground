// App icon scene: one juicy wet-in-wet bloom on bare paper. Ultramarine (the favicon's
// blue) with a drop of rose that bleeds to violet. It is centred and well inside the
// maskable safe zone, so Android can crop it to any shape. Returns where to crop (CSS px).
window.__scene = async function icon(k) {
  const { app, W, set, stroke, fill, dry, sleep, ellipse, dot, client } = k;
  app.hintGone.value = true;
  const [cx, cy] = [W / 2, 300], r = 84;

  set({ pigment: 'French Ultramarine', load: 0.62, water: 0.9, bleed: 0.8, edge: 0.75 });
  await fill(ellipse(cx, cy, r, r * 0.95, 0.4, 48), [cx - 10, cy - 10], { strength: 1.15, water: 0.9, soft: 0.28 });
  // rose dropped into the wet wash, low right: it blooms out into violet
  set({ pigment: 'Quinacridone Rose', brush: 'round', size: 0.8, water: 0.9, load: 0.6, bleed: 0.85, edge: 0.75 });
  await stroke([dot(cx + 18, cy + 16, 16)], { pressure: 0.8, speed: 0.4, taper: 0, wobble: 0 });
  // a little more ultramarine at the top left for depth
  set({ pigment: 'French Ultramarine', brush: 'round', size: 0.7, water: 0.8, load: 0.75, bleed: 0.8, edge: 0.75 });
  await stroke([dot(cx - 34, cy - 30, 16)], { pressure: 0.8, speed: 0.4, taper: 0, wobble: 0 });
  await sleep(5000);   // let the colours run into each other before fixing
  await dry();

  const [x, y] = client([cx, cy]);
  return { x, y };
};
