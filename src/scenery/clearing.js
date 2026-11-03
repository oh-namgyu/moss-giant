// Background plates: the clearing with its big trees and the dark foreground grass.
function ground(g, r) {
  const by = [
      [160, hex("#b7ab66")],
      [240, hex("#8d9a50")],
      [340, hex("#5f8444")],
      [500, hex("#3f6a39")],
      [700, hex("#2a4f32")],
    ],
    gc = (y) => {
      for (let i = 1; i < by.length; i++)
        if (y <= by[i][0]) return mixc(by[i - 1][1], by[i][1], inv(by[i - 1][0], by[i][0], y));
      return by[4][1];
    };
  const f = g.createLinearGradient(0, 170, 0, 700);
  f.addColorStop(0, "#b7ab66");
  f.addColorStop(0.3, "#6f8a46");
  f.addColorStop(1, "#2a4f32");
  g.fillStyle = f;
  g.beginPath();
  g.moveTo(-1700, 190);
  for (let x = -1700; x <= 1700; x += 40) g.lineTo(x, 190 + 14 * vnoise(x * 0.006, 3) - Math.abs(x) * 0.02);
  g.lineTo(1700, 720);
  g.lineTo(-1700, 720);
  g.closePath();
  g.fill();
  for (let i = 0; i < 7400; i++) {
    const y = 185 + Math.pow(r(), 1.5) * 535,
      k = inv(180, 700, y);
    wash(
      g,
      -1700 + r() * 3400,
      y,
      14 + k * 70 * r() + 8,
      3 + k * 11,
      (r() - 0.5) * 0.8,
      jit(gc(y), r, 20),
      r,
      0.8,
    );
  }
  for (let i = 0; i < 26; i++) {
    const x = (r() < 0.5 ? -1 : 1) * (500 + r() * 1100),
      y = 280 + r() * 420,
      sp = 140 + r() * 340;
    for (let k = 0; k < sp * 0.5; k++) {
      const an = r() * TAU,
        q = Math.sqrt(r());
      wash(
        g,
        x + Math.cos(an) * q * sp,
        y + Math.sin(an) * q * sp * 0.24,
        30 + r() * 70,
        6 + r() * 12,
        (r() - 0.5) * 0.2,
        jit(hex("#21432f"), r, 10),
        r,
        0.5,
      );
    }
  }
  const pool = (x, y, sp, n, a, b) => {
    for (let k = 0; k < n; k++) {
      const an = r() * TAU,
        q = Math.sqrt(r());
      wash(
        g,
        x + Math.cos(an) * q * sp,
        y + Math.sin(an) * q * sp * 0.2,
        10 + r() * 36,
        2 + r() * 5,
        (r() - 0.5) * 0.2,
        mixc(hex(a), hex(b), r()),
        r,
        0.55,
      );
    }
  };
  pool(60, 350, 560, 620, "#8f9f4c", "#c9c264");
  pool(-280, 300, 300, 260, "#b5b45c", "#e2d684");
  for (let i = 0; i < 16; i++)
    pool(-1000 + r() * 2100, 290 + r() * 300, 40 + r() * 80, 50, "#a2aa56", "#d5cc72");
}
function rock(g, x, y, s, r) {
  const P = new Path2D();
  blobPath(P, x, y, s, r, 0.66, 9);
  g.fillStyle = "#51544f";
  g.fill(P);
  g.save();
  g.clip(P);
  g.fillStyle = "#31353b";
  g.fillRect(x, y - s, s * 1.2, s * 2);
  for (let i = 0; i < s / 2; i++)
    wash(
      g,
      x - s + r() * s * 1.3,
      y - s * 0.6 + r() * s * 0.7,
      8 + r() * s * 0.5,
      2 + r() * 5,
      (r() - 0.5) * 0.8,
      mixc(hex("#a79b78"), hex("#d7c594"), r()),
      r,
      0.8,
    );
  g.restore();
  foliage(g, [{ x: x - s * 0.1, y: y - s * 0.52, r: s * 0.6 }], PAL.nearT, r, { size: 5.5, flat: 0.5 });
}
function paintNear() {
  const L = layer(-1700, -1260, 3400, 1980, 1, 1),
    g = L.g,
    r = rng(53);
  ground(g, r);
  for (let i = 0; i < 64; i++) {
    const x = -1700 + i * (3400 / 64) + (r() - 0.5) * 40;
    foliage(
      g,
      [
        { x, y: 200 + r() * 14, r: 22 + r() * 44 },
        { x: x + 24, y: 186 + r() * 10, r: 16 + r() * 28 },
      ],
      PAL.midT,
      r,
      { size: 6.5, jit: 10 },
    );
  }
  for (let i = 0; i < 20; i++) rock(g, -1400 + r() * 2800, 240 + r() * 260, 16 + r() * 40, r);
  for (let i = 0; i < 260; i++) {
    const y = 210 + Math.pow(r(), 1.2) * 480,
      x = -1650 + r() * 3300,
      k = inv(190, 700, y),
      c = [hex("#3f6f3e"), hex("#6f9a48"), hex("#a4b85c")];
    tuft(g, x, y, 12 + k * 48, 5 + ((k * 6) | 0), c, r, 1.5 + k * 3);
    if (r() < 0.33)
      flowers(
        g,
        x + (r() - 0.5) * 40,
        y - 6,
        3 + ((r() * 6) | 0),
        40 + k * 90,
        r() < 0.6 ? hex("#fbf4e4") : hex("#c3a9dd"),
        r,
        2.4 + k * 4,
      );
  }
  for (let i = 0; i < 70; i++) {
    const y = 250 + r() * 430,
      x = -1600 + r() * 3200,
      k = inv(190, 700, y),
      n = 4 + ((r() * 3) | 0);
    for (let j = 0; j < n; j++)
      fern(
        g,
        x,
        y,
        34 + k * 100,
        -Math.PI / 2 + (j / (n - 1) - 0.5) * 2.2,
        mixc(hex("#2f5d3b"), hex("#6f9a48"), r()),
        r,
        hex("#9fb758"),
      );
  }
  [
    [-1320, 420, -780, 190, 120, -40],
    [1400, 430, -780, 190, 110, 60],
  ].forEach((a) => bark(g, a[0], a[1], a[2], a[3], a[4], a[5], r));
  bark(g, -850, 370, -740, 250, 130, -110, r);
  bark(g, 1050, 380, -740, 240, 120, 120, r);
  bark(g, -540, 290, -700, 92, 46, -40, r);
  [
    [-850, -470, -520, -640, 62],
    [1040, -430, 740, -610, 64],
  ].forEach((a) => {
    const q = curve(a[0], a[1], a[2], a[3], a[2] < a[0] ? -0.12 : 0.12, 9);
    rib(g, q, a[4], a[4] * 0.3, "#3a322d");
    rib(
      g,
      q.map((v) => [v[0], v[1] - a[4] * 0.2]),
      a[4] * 0.22,
      a[4] * 0.06,
      css(hex("#b48d62"), 0.75),
    );
    canopy(g, a[2], a[3] - 14, 110 + a[4], 58 + a[4] * 0.5, 7, PAL.nearT, r, 9.5);
  });
  canopy(g, -1150, -760, 620, 250, 40, PAL.nearT, r, 8.5);
  canopy(g, 1200, -760, 640, 270, 40, PAL.nearT, r, 8.5);
  canopy(g, -560, -860, 330, 110, 16, PAL.nearT, r, 8);
  canopy(g, 800, -880, 320, 110, 15, PAL.nearT, r, 8);
  for (let i = 0; i < 30; i++) {
    const x = (r() < 0.5 ? -1 : 1) * (500 + r() * 760),
      y = -720 + r() * 170,
      l = 90 + r() * 240,
      pts = curve(x, y, x + (r() - 0.5) * 24, y + l, (r() - 0.5) * 0.1, 7);
    rib(g, pts, 3, 0.8, "#274336");
    const P = new Path2D();
    pts.forEach((q, k) => {
      if (k % 1 === 0) leafPoly(P, q[0] + (r() - 0.5) * 7, q[1], 5 + r() * 4, r() * TAU, r, 0.6);
    });
    g.fillStyle = css(mixc(hex("#3f7044"), hex("#7fa04e"), r()));
    g.fill(P);
  }
  pigment(L.c, 0.05, 9);
  return L;
}
function paintFore() {
  const L = layer(-1800, -1320, 3600, 2200, 1, 1.32),
    g = L.g,
    r = rng(71),
    P = PAL.foreT;
  g.fillStyle = css(P[0]);
  g.beginPath();
  g.moveTo(-1800, 880);
  for (let x = -1800; x <= 1800; x += 30)
    g.lineTo(x, 505 + 34 * vnoise(x * 0.006, 8) - Math.pow(Math.abs(x) / 1800, 2) * 120);
  g.lineTo(1800, 880);
  g.closePath();
  g.fill();
  for (let i = 0; i < 620; i++) {
    const x = -1800 + r() * 3600,
      y = 520 + r() * 150 - Math.pow(Math.abs(x) / 1800, 2) * 120;
    tuft(g, x, y, 90 + r() * 150, 7, [P[0], P[1], P[1], P[2]], r, 3.5 + r() * 4);
    if (r() < 0.16)
      fern(g, x, y, 120 + r() * 110, -Math.PI / 2 + (r() - 0.5) * 1.6, mixc(P[1], P[3], r()), r, P[3]);
    if (r() < 0.05) flowers(g, x, y - 60, 3, 70, r() < 0.5 ? hex("#f3ecd8") : hex("#b9a4d6"), r, 5.4);
  }
  foliage(
    g,
    [
      { x: -1400, y: -760, r: 300 },
      { x: -1210, y: -920, r: 260 },
      { x: -1560, y: -470, r: 250 },
      { x: -1040, y: -1000, r: 160 },
      { x: 1420, y: -790, r: 300 },
      { x: 1240, y: -960, r: 250 },
      { x: 1590, y: -520, r: 240 },
    ],
    P,
    r,
    { size: 17, jit: 9, bias: 0.3 },
  );
  pigment(L.c, 0.04, 13);
  return L;
}
function buildBackdrops() {
  const B = { sky: paintSky(), far: paintFar(), mid: paintMid(), near: paintNear(), fore: paintFore() };
  kuwahara(B.mid.c, 3);
  kuwahara(B.near.c, 4);
  kuwahara(B.fore.c, 4);
  B.midSoft = Object.assign({}, B.mid, { c: blurred(B.mid.c, 3, 2) });
  // Pixel reads are done; move each plate to a fresh canvas the browser can accelerate.
  ["sky", "far", "mid", "near", "fore"].forEach((k) => {
    const o = B[k].c,
      c = mk(o.width, o.height);
    c.getContext("2d").drawImage(o, 0, 0);
    B[k].c = c;
  });
  return B;
}
