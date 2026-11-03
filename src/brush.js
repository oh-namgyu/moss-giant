// Gouache-like marks: dabs, dragged strokes and leaf clusters. Paths are grouped by colour so hundreds of thousands of dabs stay fast.
function leafPoly(p, x, y, s, a, r, asp = 0.62) {
  const ca = Math.cos(a),
    sa = Math.sin(a);
  for (let i = 0; i < 5; i++) {
    const t = (i / 5) * TAU,
      k = s * (0.72 + r() * 0.5),
      lx = Math.cos(t) * k,
      ly = Math.sin(t) * k * asp,
      X = x + lx * ca - ly * sa,
      Y = y + lx * sa + ly * ca;
    i ? p.lineTo(X, Y) : p.moveTo(X, Y);
  }
  p.closePath();
}
function smoothBlob(p, x, y, rad, r, flat = 1, n = 12) {
  const q = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU,
      k = rad * (0.92 + r() * 0.15);
    q.push([x + Math.cos(t) * k, y + Math.sin(t) * k * flat]);
  }
  const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2],
    s = m(q[n - 1], q[0]);
  p.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) {
    const e = m(q[i], q[(i + 1) % n]);
    p.quadraticCurveTo(q[i][0], q[i][1], e[0], e[1]);
  }
  p.closePath();
}
function blobPath(p, x, y, rad, r, flat = 1, n = 13) {
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU,
      k = rad * (0.8 + r() * 0.34),
      X = x + Math.cos(t) * k,
      Y = y + Math.sin(t) * k * flat;
    i ? p.lineTo(X, Y) : p.moveTo(X, Y);
  }
  p.closePath();
}
// A tapered brush line: branches, grass, vines and bark are all made of this.
function rib(g, pts, w0, w1, col) {
  const n = pts.length,
    L = [],
    R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)],
      b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0],
      dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  g.fillStyle = col;
  g.beginPath();
  L.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
  for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath();
  g.fill();
}
function curve(x0, y0, x1, y1, bend, n = 8) {
  const o = [],
    mx = (x0 + x1) / 2 - (y1 - y0) * bend,
    my = (y0 + y1) / 2 + (x1 - x0) * bend;
  for (let i = 0; i <= n; i++) {
    const t = i / n,
      a = (1 - t) * (1 - t),
      b = 2 * t * (1 - t),
      c = t * t;
    o.push([a * x0 + b * mx + c * x1, a * y0 + b * my + c * y1]);
  }
  return o;
}
// A foliage mass: a dark base, then lighter leaves toward the light. This gives trees their clumped, painted volume.
function foliage(g, blobs, pal, r, o = {}) {
  const size = o.size || 10,
    L = o.light || [-0.6, -0.8],
    den = o.density || 1,
    edge = o.edge || 1.14,
    flat = o.flat || 0.88,
    bias = o.bias ?? 0.42,
    spread = o.spread ?? 0.24;
  const tones = pal.map((c) => [0, 1, 2].map(() => css(jit(c, r, o.jit ?? 14))));
  blobs = blobs.slice().sort((a, b) => a.y - b.y);
  for (const b of blobs) {
    const paths = tones.map((t) => t.map(() => new Path2D())),
      base = new Path2D();
    blobPath(base, b.x, b.y, b.r * 0.95, r, flat);
    g.fillStyle = tones[0][0];
    g.fill(base);
    const n = Math.round(((b.r * b.r) / (size * size)) * den * 3.4);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        rad = Math.sqrt(r()) * b.r * edge,
        x = b.x + Math.cos(a) * rad,
        y = b.y + Math.sin(a) * rad * flat,
        t = ((x - b.x) * L[0] + (y - b.y) * L[1]) / b.r,
        v = t * 0.62 + bias + (r() - 0.5) * spread;
      const k = v < 0.2 ? 0 : v < 0.44 ? 1 : v < 0.7 ? 2 : v < 0.94 ? 3 : 4,
        s = size * (0.55 + r() * 0.75) * (k >= 3 ? 0.74 : 1),
        ang = o.round ? r() * TAU : Math.PI / 2 + (r() - 0.5) * 2.2;
      leafPoly(paths[k][(r() * 3) | 0], x, y, s, ang, r, o.round ? 0.82 : 0.6);
    }
    paths.forEach((set, k) =>
      set.forEach((p, j) => {
        g.fillStyle = tones[k][j];
        g.fill(p);
      }),
    );
  }
}
// A long brush stroke with split bristles, used for the underpainting of sky and ground.
function wash(g, x, y, len, w, ang, col, r, a = 0.8) {
  const ca = Math.cos(ang),
    sa = Math.sin(ang),
    P = new Path2D(),
    steps = 6,
    top = [],
    bot = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps - 0.5;
    top.push([t * len, (-w / 2) * (0.7 + r() * 0.5)]);
    bot.push([t * len, (w / 2) * (0.7 + r() * 0.5)]);
  }
  const pt = (q) => [x + q[0] * ca - q[1] * sa, y + q[0] * sa + q[1] * ca];
  top.forEach((q, i) => {
    const s = pt(q);
    i ? P.lineTo(s[0], s[1]) : P.moveTo(s[0], s[1]);
  });
  bot.reverse().forEach((q) => {
    const s = pt(q);
    P.lineTo(s[0], s[1]);
  });
  P.closePath();
  g.fillStyle = css(col, a);
  g.fill(P);
  const br = 1 + ((w / 9) | 0);
  for (let i = 0; i < br; i++) {
    const off = (r() - 0.5) * w,
      l = len * (0.5 + r() * 0.5),
      s = (r() - 0.5) * (len - l),
      d = r() < 0.5 ? -1 : 1,
      c = [col[0] + d * 14, col[1] + d * 14, col[2] + d * 14];
    rib(
      g,
      [pt([s - l / 2, off]), pt([s, off + (r() - 0.5) * 2]), pt([s + l / 2, off])],
      0.4 + r() * 1.8,
      0.3,
      css(c, 0.3),
    );
  }
}
function tuft(g, x, y, h, n, cols, r, wd = 3) {
  for (let i = 0; i < n; i++) {
    const dx = (r() - 0.5) * h * 0.7,
      hh = h * (0.55 + r() * 0.6),
      bend = (r() - 0.5) * 0.5;
    rib(
      g,
      curve(x + dx * 0.3, y, x + dx, y - hh, bend, 5),
      wd * (0.6 + r() * 0.6),
      0.4,
      css(cols[(r() * cols.length) | 0]),
    );
  }
}
function fern(g, x, y, len, ang, col, r, tip) {
  const n = 9,
    pts = [];
  let a = ang,
    X = x,
    Y = y;
  const stepL = len / n;
  for (let i = 0; i <= n; i++) {
    pts.push([X, Y]);
    a += 0.09;
    X += Math.cos(a) * stepL;
    Y += Math.sin(a) * stepL;
  }
  rib(g, pts, 3, 0.5, css(col));
  const P = new Path2D(),
    Q = new Path2D();
  for (let i = 1; i < n; i++) {
    const [px, py] = pts[i],
      k = (1 - i / n) * len * 0.3 + 3,
      t = Math.atan2(pts[i + 1][1] - py, pts[i + 1][0] - px);
    [-1, 1].forEach((sd) => {
      const aa = t + sd * 1.05;
      leafPoly(
        sd < 0 ? P : Q,
        px + Math.cos(aa) * k * 0.5,
        py + Math.sin(aa) * k * 0.5,
        k * 0.55,
        aa,
        r,
        0.34,
      );
    });
  }
  g.fillStyle = css(col);
  g.fill(P);
  g.fillStyle = css(tip || col);
  g.fill(Q);
}
function flowers(g, x, y, n, sp, col, r, s = 4) {
  for (let i = 0; i < n; i++) {
    const X = x + (r() - 0.5) * sp,
      Y = y + (r() - 0.5) * sp * 0.5;
    rib(g, curve(X, Y + s * 3, X, Y, 0, 2), 1.1, 0.6, "rgba(60,90,50,.9)");
    const P = new Path2D();
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU + r();
      leafPoly(P, X + Math.cos(a) * s * 0.7, Y + Math.sin(a) * s * 0.55, s * 0.62, a, r, 0.7);
    }
    g.fillStyle = css(jit(col, r, 10));
    g.fill(P);
    g.fillStyle = "rgba(240,200,80,.95)";
    g.beginPath();
    g.arc(X, Y, s * 0.32, 0, TAU);
    g.fill();
  }
}
