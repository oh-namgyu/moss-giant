// Painted-on age: stains, rust, chips, cracks, and moss that grows only where the kneeling pose faces up.
// Stains, rust, chipped paint and cracks. Rust runs downward relative to the kneeling pose.
function agedTex(pts, col, ang, res0, seed, lvl = 1) {
  const res = res0 * Math.max(Q, 0.55),
    [x0, y0, w, h] = bbox(pts),
    c = mk(w * res, h * res),
    g = c.getContext("2d"),
    r = rng(seed),
    D = rot([0, 1], -ang),
    aD = Math.atan2(D[1], D[0]);
  g.scale(res, res);
  g.translate(-x0, -y0);
  const ar = w * h;
  for (let i = 0; i < (ar / 900) * lvl; i++)
    wash(
      g,
      x0 + r() * w,
      y0 + r() * h,
      20 + r() * 70,
      6 + r() * 20,
      aD + (r() - 0.5) * 0.5,
      jit(col, r, 30),
      r,
      0.34,
    );
  for (let i = 0; i < (ar / 5200) * lvl; i++) {
    const x = x0 + r() * w,
      y = y0 + r() * h,
      l = 26 + r() * 110,
      e = [x + D[0] * l + (r() - 0.5) * 8, y + D[1] * l + (r() - 0.5) * 8];
    rib(
      g,
      curve(x, y, e[0], e[1], (r() - 0.5) * 0.1, 5),
      2 + r() * 5,
      0.5,
      css(mixc(RC.rust, hex("#5b3a2c"), r()), 0.16 + r() * 0.24),
    );
  }
  for (let i = 0; i < (ar / 2600) * lvl; i++) {
    const x = x0 + r() * w,
      y = y0 + r() * h,
      s = 1.5 + r() * r() * r() * 16,
      P = new Path2D();
    blobPath(P, x, y, s, r, 0.5 + r() * 0.5, 5);
    g.fillStyle = css(mixc(hex("#4f4640"), hex("#7d5a44"), r()), 0.72);
    g.fill(P);
    if (r() < 0.6) {
      const Q = new Path2D();
      blobPath(Q, x - 1, y - 1.2, s * 0.72, r, 0.7, 6);
      g.fillStyle = css(jit(mixc(col, hex("#efe2c2"), 0.45), r, 10), 0.5);
      g.globalCompositeOperation = "destination-over";
      g.fill(Q);
      g.globalCompositeOperation = "source-over";
    }
  }
  for (let i = 0; i < (ar / 6000) * lvl; i++) {
    let x = x0 + r() * w,
      y = y0 + r() * h,
      a = r() * TAU;
    const q = [[x, y]];
    for (let k = 0; k < 7; k++) {
      a += (r() - 0.5) * 1.2;
      x += Math.cos(a) * (6 + r() * 12);
      y += Math.sin(a) * (6 + r() * 12);
      q.push([x, y]);
    }
    inkOpen(g, q, 0.9 + r() * 0.9, "rgba(40,30,38,.7)");
  }
  return { c, x: x0, y: y0, w, h };
}
const MOSSP = [hex("#233f2e"), hex("#365a30"), hex("#527a36"), hex("#869c47"), hex("#cdc774")];
// Moss grows only on faces that point up while kneeling, and spills over the outline to break the silhouette.
function mossTex(pts, ang, res0, seed, amt = 1, flowersOn = true) {
  const res = res0 * Math.max(Q, 0.55),
    [x0, y0, w, h] = bbox(pts, 46),
    c = mk(w * res, h * res),
    g = c.getContext("2d"),
    r = rng(seed),
    s = area(pts) > 0 ? 1 : -1;
  amt *= 1.35;
  g.scale(res, res);
  g.translate(-x0, -y0);
  const list = [],
    n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[(i + n - 1) % n],
      b = pts[(i + 1) % n];
    let dx = b[0] - a[0],
      dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const N = [dy * s, -dx * s],
      W = rot(N, ang),
      up = -W[1],
      mask = fbm(pts[i][0] * 0.016 + seed, pts[i][1] * 0.016, 3);
    if (up > 0.12 && mask > 0.56 - amt * 0.14 * up && r() < 0.9) {
      const R = (9 + r() * 19) * (0.6 + up * 0.6);
      list.push({ x: pts[i][0] - N[0] * R * 0.25, y: pts[i][1] - N[1] * R * 0.25, r: R });
      const dr = 1 + ((r() * 3) | 0);
      for (let k = 0; k < dr; k++) {
        const q = (k + 1) * (10 + r() * 14);
        list.push({
          x: pts[i][0] - N[0] * q + (r() - 0.5) * 12,
          y: pts[i][1] - N[1] * q + (r() - 0.5) * 12,
          r: R * (0.72 - k * 0.14),
        });
      }
    }
  }
  const sh = new Path2D();
  list.forEach((b) => blobPath(sh, b.x + 2, b.y + 6, b.r * 0.96, r, 0.86, 8));
  g.fillStyle = "rgba(30,28,44,.3)";
  g.fill(sh);
  foliage(g, list, MOSSP, r, { size: 3.1, jit: 12, light: rot(LIGHT, -ang), bias: 0.44, edge: 1.05 });
  if (flowersOn)
    for (let i = 0; i < list.length * 0.4; i++) {
      const b = list[(r() * list.length) | 0];
      if (r() < 0.36)
        flowers(g, b.x, b.y - b.r * 0.4, 2, b.r * 1.4, r() < 0.68 ? hex("#fbf6e6") : hex("#c7aee0"), r, 2.3);
      else tuft(g, b.x, b.y - b.r * 0.3, 12 + r() * 20, 3, [MOSSP[2], MOSSP[3], MOSSP[1]], r, 1.5);
    }
  return { c, x: x0, y: y0, w, h };
}
function sapling(g, x, y, h, lean, r) {
  const tp = [x + lean, y - h * 0.72];
  rib(
    g,
    [
      [x - h * 0.02, y + 8],
      [x, y - h * 0.1],
      [x + lean * 0.4, y - h * 0.42],
      [tp[0], tp[1]],
    ],
    h * 0.15,
    h * 0.035,
    "#43362f",
  );
  rib(
    g,
    [
      [x - h * 0.04, y + 6],
      [x - h * 0.018, y - h * 0.1],
      [x + lean * 0.4 - h * 0.012, y - h * 0.42],
      [tp[0] - h * 0.006, tp[1]],
    ],
    h * 0.05,
    h * 0.012,
    css(hex("#b98f62"), 0.8),
  );
  const b = [];
  for (let i = 0; i < 7 + h / 22; i++) {
    const a = r() * TAU,
      k = Math.sqrt(r());
    b.push({
      x: tp[0] + Math.cos(a) * k * h * 0.42,
      y: tp[1] - h * 0.12 + Math.sin(a) * k * h * 0.27,
      r: h * (0.1 + r() * 0.11),
    });
  }
  foliage(g, b, [hex("#21403a"), hex("#2f5a45"), hex("#4e8150"), hex("#8ca85a"), hex("#d8ce7a")], r, {
    size: Math.max(3.4, h / 34),
    jit: 12,
    spread: 0.2,
  });
}
