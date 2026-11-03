// Background plate: the mid-distance forest, plus the trunks and canopies shared with the clearing.
function conifer(g, x, base, h, w, pal, r, size) {
  const n = Math.round(h / 15),
    b = [];
  for (let i = 0; i < n; i++) {
    const t = i / n,
      wd = w * (0.07 + t * 0.93),
      y = base - h + t * h,
      m = 1 + Math.round(t * 3);
    for (let j = 0; j < m; j++) {
      const q = m > 1 ? j / (m - 1) - 0.5 : 0;
      b.push({
        x: x + q * wd * 1.5 + (r() - 0.5) * 4,
        y: y + Math.abs(q) * wd * 0.42,
        r: wd * (0.36 + r() * 0.14) + 6,
      });
    }
  }
  foliage(g, b, pal, r, { size, flat: 0.7, jit: 10 });
}
function broad(g, x, base, h, w, pal, r, size, tr) {
  const b = [],
    hh = Math.min(h, w * 2.6),
    n = Math.round((w * hh) / 2600) + 10;
  for (let i = 0; i < n; i++) {
    const a = r() * TAU,
      k = Math.sqrt(r());
    b.push({
      x: x + Math.cos(a) * k * w,
      y: base - hh * 0.48 + Math.sin(a) * k * hh * 0.44,
      r: lerp(w * 0.3, w * 0.52, r()),
    });
  }
  rib(
    g,
    [
      [x, base],
      [x + (r() - 0.5) * 10, base - h * 0.4],
      [x + (r() - 0.5) * 20, base - h * 0.7],
    ],
    w * 0.13,
    w * 0.05,
    css(tr),
  );
  foliage(g, b, pal, r, { size, jit: 12, bias: 0.33, spread: 0.2 });
}
function paintMid() {
  const L = layer(-1700, -760, 3400, 1160, 1, 0.72),
    g = L.g,
    r = rng(37),
    P1 = PAL.hazeT.map((c) => mixc(c, hex("#3d6c60"), 0.28)),
    P2 = PAL.midT;
  for (let i = 0; i < 46; i++) {
    const x = -1700 + i * (3400 / 46) + (r() - 0.5) * 50,
      base = 190 + r() * 20,
      h = 340 + r() * 280;
    if (r() < 0.3) conifer(g, x, base, h * 0.82, 56 + r() * 44, P1, r, 5.5);
    else broad(g, x, base, h * 0.8, 110 + r() * 70, P1, r, 5.5, hex("#5d6e5c"));
  }
  for (let k = 0; k < 26; k++)
    wash(
      g,
      -1700 + r() * 3400,
      120 + r() * 90,
      420 + r() * 600,
      30 + r() * 40,
      (r() - 0.5) * 0.04,
      hex("#f7e8c2"),
      r,
      0.1,
    );
  for (let i = 0; i < 30; i++) {
    const x = -1700 + i * (3400 / 30) + (r() - 0.5) * 70,
      base = 250 + r() * 30,
      h = 300 + r() * 300,
      cl = Math.abs(x - 120) < 420;
    if (r() < 0.16) conifer(g, x, base, h * (cl ? 0.7 : 0.86), 70 + r() * 44, P2, r, 6);
    else broad(g, x, base, h * (cl ? 0.66 : 1), 130 + r() * 90, P2, r, 6.5, hex("#3a3a36"));
  }
  for (let k = 0; k < 44; k++)
    wash(
      g,
      -1700 + r() * 3400,
      170 + r() * 130,
      360 + r() * 640,
      26 + r() * 46,
      (r() - 0.5) * 0.04,
      hex("#fbeec9"),
      r,
      0.09,
    );
  g.fillStyle = "rgba(120,130,80,1)";
  g.fillRect(-1700, 300, 3400, 100);
  g.globalCompositeOperation = "source-atop";
  g.fillStyle = "rgba(240,222,170,.2)";
  g.fillRect(-1700, -760, 3400, 1160);
  g.globalCompositeOperation = "source-over";
  pigment(L.c, 0.05, 7);
  return L;
}
function bark(g, x, base, top, w0, w1, lean, r) {
  const n = 16,
    cx = (t) => x + lean * t * t + Math.sin(t * 3.1 + x) * w0 * 0.05,
    wd = (t) => lerp(w0, w1, Math.pow(t, 0.62)) + w0 * 0.75 * Math.pow(1 - t, 7);
  const edge = (s) => {
      const o = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        o.push([cx(t) + (s * wd(t)) / 2 + (r() - 0.5) * 3, lerp(base, top, t)]);
      }
      return o;
    },
    Lf = edge(-1),
    Rt = edge(1),
    body = new Path2D();
  Lf.forEach((q, i) => (i ? body.lineTo(q[0], q[1]) : body.moveTo(q[0], q[1])));
  Rt.reverse().forEach((q) => body.lineTo(q[0], q[1]));
  body.closePath();
  g.fillStyle = "#4a3f38";
  g.fill(body);
  g.save();
  g.clip(body);
  for (let i = 0; i < (Math.abs(base - top) * w0) / 70; i++) {
    const t = r(),
      y = lerp(base, top, t),
      w = wd(t),
      u = r(),
      X = cx(t) + (u - 0.5) * w,
      l = 30 + r() * 110,
      lit = 1 - u;
    const c =
      lit > 0.72
        ? mixc(hex("#a37f5a"), hex("#e9b878"), r())
        : lit > 0.38
          ? mixc(hex("#574a40"), hex("#7d6a54"), r())
          : mixc(hex("#22242c"), hex("#3a3a3c"), r());
    rib(g, curve(X, y, X + (r() - 0.5) * 10, y - l, (r() - 0.5) * 0.2, 4), 2 + r() * 7, 0.8, css(c, 0.85));
  }
  for (let i = 0; i < w0 * 0.42; i++) {
    const t = Math.pow(r(), 2.6) * 0.32,
      y = lerp(base, top, t),
      X = cx(t) + (r() - 0.5) * wd(t) * 0.95;
    foliage(g, [{ x: X, y, r: 8 + r() * 20 }], PAL.nearT, r, { size: 4.5, jit: 12 });
  }
  g.restore();
  for (let i = 0; i < 6; i++) {
    const sd = i < 3 ? -1 : 1,
      ex = x + sd * (w0 * 0.5 + r() * w0 * 0.6),
      ey = base + 6 + r() * 30,
      q = curve(x + sd * w0 * 0.34, base - 50 - r() * 50, ex, ey, sd * 0.16, 8);
    rib(g, q, w0 * 0.17, 4, "#2f2a2a");
    rib(
      g,
      q.map((v) => [v[0] - w0 * 0.02, v[1] - 3]),
      w0 * 0.05,
      1.5,
      css(hex("#7a6a50"), 0.75),
    );
    foliage(g, [{ x: ex, y: ey - 4, r: 10 + w0 * 0.05 }], PAL.nearT, r, { size: 4.5, flat: 0.55 });
  }
}
function canopy(g, cx, cy, w, h, n, pal, r, size) {
  const b = [];
  for (let i = 0; i < n; i++) {
    const a = r() * TAU,
      k = Math.sqrt(r());
    b.push({ x: cx + Math.cos(a) * k * w, y: cy + Math.sin(a) * k * h, r: lerp(52, 132, r()) });
  }
  foliage(g, b, pal, r, { size, jit: 15 });
}
