// Prebuilt effect sprites (mist, light rays, grain, vignette, ground cover) and the flight path.
const FX = {};
function mistSprite(w, h, seed, col) {
  const c = mk(w, h),
    g = c.getContext("2d"),
    img = g.createImageData(w, h),
    D = img.data;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4,
        u = x / w,
        v = y / h,
        n = fbm(u * 7 + seed, v * 5 + seed * 0.3, 4),
        env = Math.pow(Math.sin(Math.PI * v), 1.3) * Math.pow(Math.sin(Math.PI * u), 0.3);
      D[i] = col[0];
      D[i + 1] = col[1];
      D[i + 2] = col[2];
      D[i + 3] = sstep(0.3, 0.68, n) * env * 255;
    }
  g.putImageData(img, 0, 0);
  return c;
}
function raysSprite() {
  const c = mk(960, 600),
    g = c.getContext("2d");
  g.globalCompositeOperation = "lighter";
  [
    [0.1, 0.05],
    [0.2, 0.075],
    [0.31, 0.05],
    [0.42, 0.09],
    [0.55, 0.06],
    [0.67, 0.045],
    [0.78, 0.07],
    [0.92, 0.05],
  ].forEach((a) => {
    const ang = a[0] * 1.25 + 0.1,
      sp = a[1],
      L = 1150,
      gr = g.createLinearGradient(0, 0, Math.cos(ang) * L, Math.sin(ang) * L);
    gr.addColorStop(0, "rgba(255,236,178,.34)");
    gr.addColorStop(0.55, "rgba(255,224,160,.14)");
    gr.addColorStop(1, "rgba(255,220,150,0)");
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(Math.cos(ang - sp) * L, Math.sin(ang - sp) * L);
    g.lineTo(Math.cos(ang + sp) * L, Math.sin(ang + sp) * L);
    g.closePath();
    g.fill();
  });
  return blurred(c, 2, 2);
}
function grainTiles() {
  return [0, 1, 2, 3].map((k) => {
    const c = mk(480, 270),
      g = c.getContext("2d"),
      img = g.createImageData(480, 270),
      D = img.data,
      r = rng(900 + k);
    for (let i = 0; i < D.length; i += 4) {
      const v = 128 + (r() - 0.5) * 150;
      D[i] = D[i + 1] = D[i + 2] = v;
      D[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c;
  });
}
function vignette() {
  const c = mk(480, 270),
    g = c.getContext("2d"),
    gr = g.createRadialGradient(240, 135, 70, 240, 135, 300);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(0.62, "rgba(22,24,42,.08)");
  gr.addColorStop(1, "rgba(14,16,34,.5)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 480, 270);
  return c;
}
const SPL = (cam, d, x, y) => {
  const z = 1 + (cam.zoom - 1) * d;
  return [VW / 2 + (x - cam.x * d) * z, VH / 2 + (y - cam.y * d) * z, z];
};
function spr(g, c, cam, d, x, y, w, h, a = 1) {
  const [X, Y, z] = SPL(cam, d, x, y);
  g.globalAlpha = a;
  g.drawImage(c, X, Y, w * z, h * z);
  g.globalAlpha = 1;
}
function sprLayer(g, L, cam, a) {
  spr(g, L.c, cam, 1, L.x0, L.y0, L.w, L.h, a);
}
function buildFX() {
  FX.mist = [
    mistSprite(640, 180, 3, hex("#fff0cc")),
    mistSprite(640, 200, 9, hex("#fbe7bf")),
    mistSprite(520, 180, 15, hex("#fff7e2")),
  ];
  FX.rays = raysSprite();
  FX.grain = grainTiles();
  FX.vig = vignette();
  FX.P = buildParticles();
  FX.bloom = mk(240, 135);
  const cover = layer(-560, 120, 1100, 360, 1, 1),
    g = cover.g,
    r = rng(66);
  [
    [-250, 330, 120],
    [-130, 330, 90],
    [120, 330, 110],
    [245, 330, 70],
    [-340, 332, 80],
  ].forEach((a) => {
    for (let i = 0; i < 20; i++) {
      const x = a[0] + ROOT.x - 120 + (r() - 0.5) * a[2] * 2,
        y = a[1] + r() * 16;
      tuft(g, x, y, 16 + r() * 40, 6, [MOSSP[1], MOSSP[2], MOSSP[3]], r, 2.8);
      if (r() < 0.4)
        fern(
          g,
          x,
          y,
          36 + r() * 44,
          -Math.PI / 2 + (r() - 0.5) * 1.5,
          mixc(MOSSP[1], MOSSP[3], r()),
          r,
          MOSSP[4],
        );
      if (r() < 0.2) flowers(g, x, y - 14, 3, 50, r() < 0.6 ? hex("#fbf4e4") : hex("#c7aee0"), r, 3.6);
    }
  });
  FX.cover = cover;
  const sh = layer(-800, 220, 1500, 240, 0.5, 1),
    h = sh.g;
  for (let i = 0; i < 1100; i++) {
    const a = r() * TAU,
      k = Math.sqrt(r());
    h.fillStyle = css(jit(hex("#1e3a2e"), r, 12), 0.075);
    h.beginPath();
    h.ellipse(30 + Math.cos(a) * k * 520, 332 + Math.sin(a) * k * 66, 30 + r() * 62, 8 + r() * 14, 0, 0, TAU);
    h.fill();
  }
  FX.shadow = sh;
  const sc = layer(-500, 290, 1000, 90, 1, 1),
    q = sc.g;
  [
    [-30, 332, 84],
    [176, 334, 56],
    [-345, 334, 70],
    [-120, 336, 110],
  ].forEach((a) => {
    for (let i = 0; i < 190; i++) {
      const an = r() * TAU,
        k = Math.sqrt(r());
      wash(
        q,
        a[0] + Math.cos(an) * k * a[2],
        a[1] + Math.sin(an) * k * a[2] * 0.2,
        6 + r() * 22,
        2 + r() * 5,
        (r() - 0.5) * 0.6,
        jit(hex("#4a3a2c"), r, 24),
        r,
        0.85,
      );
    }
  });
  FX.scar = sc;
  FX.flight = [];
  for (let u = 0; u <= 1.8; u += 1 / 48) FX.flight.push({ u, o: flightOffset(u) });
}
function flightOffset(u) {
  const e = Math.pow(u / 1.7, 1.5);
  return [-560 * e + 250 * Math.sin(u * 2.6), -1660 * e];
}
