// Background plates: the sky and the distant ridges.
const PAL = {
  sun: [-420, -300],
  hazeT: [hex("#7f9e9a"), hex("#93b0a0"), hex("#aec2a2"), hex("#d6d6a8"), hex("#f2e7b4")],
  midT: [hex("#2c4a44"), hex("#3a6150"), hex("#55805a"), hex("#8ea45f"), hex("#d4c97c")],
  nearT: [hex("#16302c"), hex("#234637"), hex("#386540"), hex("#6a9049"), hex("#c3c267")],
  foreT: [hex("#0c1f20"), hex("#14322b"), hex("#225038"), hex("#4e7c3e"), hex("#b4bd5c")],
  cloud: [hex("#bcb7c6"), hex("#d9cfcf"), hex("#f1e4d2"), hex("#fff3dc"), hex("#fffbef")],
};
function skyColor(y) {
  const st = [
    [-1300, hex("#5f9dc0")],
    [-800, hex("#8dbcc8")],
    [-420, hex("#cfd9bd")],
    [-200, hex("#f3dfae")],
    [60, hex("#fbd28e")],
    [400, hex("#f6c98a")],
  ];
  for (let i = 1; i < st.length; i++)
    if (y <= st[i][0]) return mixc(st[i - 1][1], st[i][1], inv(st[i - 1][0], st[i][0], y));
  return st[st.length - 1][1];
}
function cloud(g, cx, cy, w, h, r) {
  const b = [],
    n = Math.round(w / 30);
  for (let i = 0; i < n; i++) {
    const t = (i + r() * 0.8) / n,
      env = Math.pow(Math.sin(t * Math.PI), 0.62),
      rad = lerp(0.15, 0.31, r()) * h * (0.42 + env * 0.8);
    b.push({ x: cx + (t - 0.5) * w, y: cy - rad * 0.5 - r() * h * 0.66 * env, r: rad });
  }
  b.sort((p, q) => p.y - q.y);
  const T = [hex("#c3bfcf"), hex("#e6dbd5"), hex("#fff4e2"), hex("#fffcf2")],
    C = T.map((c) => css(c));
  g.save();
  g.beginPath();
  g.rect(cx - w, cy - h * 2, w * 2, h * 2 + h * 0.05);
  g.clip();
  b.forEach((q) => {
    const j = r() * 0.14;
    [
      [0, 0, 1, 0],
      [-0.12 - j, -0.2 - j, 0.86, 1],
      [-0.26 - j, -0.38 - j, 0.56, 2],
    ].forEach((l) => {
      const P = new Path2D();
      smoothBlob(P, q.x + l[0] * q.r, q.y + l[1] * q.r, q.r * l[2], r, 0.92, 11);
      g.fillStyle = C[l[3]];
      g.fill(P);
    });
  });
  g.restore();
}
function paintSky() {
  const L = layer(-1500, -1300, 3000, 1700, 0.8, 0.3),
    g = L.g,
    r = rng(11);
  for (let i = 0; i < 34; i++) {
    g.fillStyle = css(skyColor(-1300 + i * 50));
    g.fillRect(-1500, -1300 + i * 50, 3000, 52);
  }
  for (let i = 0; i < 5200; i++) {
    const y = -1300 + r() * 1700;
    wash(
      g,
      -1500 + r() * 3000,
      y,
      90 + r() * 260,
      16 + r() * 30,
      (r() - 0.5) * 0.16,
      jit(skyColor(y + (r() - 0.5) * 60), r, 9),
      r,
      0.55,
    );
  }
  const S = PAL.sun,
    sg = g.createRadialGradient(S[0], S[1], 10, S[0], S[1], 820);
  sg.addColorStop(0, "rgba(255,246,206,.98)");
  sg.addColorStop(0.16, "rgba(255,230,160,.72)");
  sg.addColorStop(0.5, "rgba(255,205,130,.26)");
  sg.addColorStop(1, "rgba(255,190,120,0)");
  g.fillStyle = sg;
  g.fillRect(-1500, -1300, 3000, 1700);
  [
    [520, -640, 900, 330],
    [-1020, -760, 760, 270],
    [1180, -900, 640, 220],
    [-180, -880, 460, 130],
    [860, -340, 560, 170],
    [-1280, -400, 520, 150],
    [140, -470, 300, 80],
  ].forEach((a) => cloud(g, a[0], a[1], a[2], a[3], r));
  kuwahara(L.c, 3);
  pigment(L.c, 0.03, 3);
  return L;
}
function ridge(g, y0, amp, col, r, seed) {
  const P = new Path2D();
  P.moveTo(-1700, 420);
  const f = 0.0034;
  for (let x = -1700; x <= 1700; x += 14) {
    const y =
      y0 -
      amp * fbm(x * f + seed, seed, 3) * 1.6 +
      amp * 0.4 -
      8 * vnoise(x * 0.05, seed) -
      5 * vnoise(x * 0.13, seed + 3);
    P.lineTo(x, y);
  }
  P.lineTo(1700, 420);
  P.closePath();
  g.fillStyle = css(col);
  g.fill(P);
}
function paintFar() {
  const L = layer(-1700, -500, 3400, 920, 0.8, 0.45),
    g = L.g,
    r = rng(23);
  const tiers = [
    [-30, 180, hex("#b7c7b4"), hex("#d8d7b0")],
    [50, 150, hex("#9db6a3"), hex("#cfd2a4")],
    [110, 110, hex("#7fa08f"), hex("#bfc48e")],
  ];
  tiers.forEach((t, ti) => {
    ridge(g, t[0], t[1], t[2], r, ti * 7 + 2);
    const pal = [t[2], mixc(t[2], t[3], 0.3), mixc(t[2], t[3], 0.6), t[3], mixc(t[3], hex("#fff0c0"), 0.5)];
    for (let k = 0; k < 70; k++) {
      const x = -1700 + r() * 3400,
        top = t[0] - t[1] * fbm(x * 0.0034 + ti * 7 + 2, ti * 7 + 2, 3) * 1.6 + t[1] * 0.4;
      foliage(g, [{ x, y: top + 10 + r() * 20, r: 22 + r() * 26 + ti * 6 }], pal, r, {
        size: 6 + ti * 1.5,
        jit: 7,
        spread: 0.3,
      });
    }
    for (let k = 0; k < 70; k++)
      wash(
        g,
        -1700 + r() * 3400,
        t[0] + 60 + r() * 130,
        240 + r() * 420,
        18 + r() * 34,
        (r() - 0.5) * 0.05,
        hex("#f6e6c0"),
        r,
        0.13 + ti * 0.03,
      );
  });
  pigment(L.c, 0.045, 5);
  return L;
}
