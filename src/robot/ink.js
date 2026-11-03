// Geometry helpers and the hand-inked line: pressure-varied outlines that wobble slightly from drawing to drawing.
const RC = {
  slate: hex("#8d979b"),
  slateD: hex("#6f7b85"),
  cream: hex("#cfc2a0"),
  red: hex("#a9583f"),
  joint: hex("#3b404c"),
  ink: "#241c26",
  rust: hex("#9a5832"),
  shadow: hex("#b4b2c6"),
  deep: hex("#9c9ab6"),
  rim: hex("#ffd79a"),
};
const LIGHT = [-0.62, -0.78];
function rp(v, rad = 14, step = 13) {
  const o = [],
    n = v.length;
  for (let i = 0; i < n; i++) {
    const p = v[i],
      a = v[(i + n - 1) % n],
      b = v[(i + 1) % n],
      da = Math.hypot(a[0] - p[0], a[1] - p[1]),
      db = Math.hypot(b[0] - p[0], b[1] - p[1]),
      d = Math.min(rad, da / 2, db / 2),
      ax = p[0] + ((a[0] - p[0]) / da) * d,
      ay = p[1] + ((a[1] - p[1]) / da) * d,
      bx = p[0] + ((b[0] - p[0]) / db) * d,
      by = p[1] + ((b[1] - p[1]) / db) * d;
    for (let k = 0; k <= 4; k++) {
      const t = k / 4,
        u = 1 - t;
      o.push([u * u * ax + 2 * u * t * p[0] + t * t * bx, u * u * ay + 2 * u * t * p[1] + t * t * by]);
    }
    const q = v[(i + 1) % n],
      ex = q[0] + ((p[0] - q[0]) / db) * Math.min(rad, db / 2),
      ey = q[1] + ((p[1] - q[1]) / db) * Math.min(rad, db / 2),
      m = Math.floor(Math.hypot(ex - bx, ey - by) / step);
    for (let k = 1; k <= m; k++) {
      const t = k / (m + 1);
      o.push([lerp(bx, ex, t), lerp(by, ey, t)]);
    }
  }
  return o;
}
function ell(cx, cy, rx, ry, n = 30, rot = 0) {
  const o = [],
    c = Math.cos(rot),
    s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * TAU,
      x = Math.cos(t) * rx,
      y = Math.sin(t) * ry;
    o.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return o;
}
const wob = (pts, seed, f, amp) =>
  pts.map((q, i) => [
    q[0] + (vnoise(i * 0.21 + seed, f * 3.7) - 0.5) * 2 * amp,
    q[1] + (vnoise(i * 0.21 + seed + 40, f * 3.7) - 0.5) * 2 * amp,
  ]);
function polyPath(pts) {
  const P = new Path2D();
  pts.forEach((q, i) => (i ? P.lineTo(q[0], q[1]) : P.moveTo(q[0], q[1])));
  P.closePath();
  return P;
}
function area(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i],
      q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a;
}
// A pressure-varied outline: heavier on the shadow side, thinner toward the light.
function inkClosed(g, pts, w, seed, L) {
  const n = pts.length,
    s = area(pts) > 0 ? 1 : -1,
    P = new Path2D(),
    O = [],
    I = [];
  for (let i = 0; i < n; i++) {
    const a = pts[(i + n - 1) % n],
      b = pts[(i + 1) % n];
    let dx = b[0] - a[0],
      dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const nx = dy * s,
      ny = -dx * s,
      lit = nx * L[0] + ny * L[1],
      h =
        (w *
          (0.5 + 0.62 * vnoise(i * 0.17 + seed, seed * 0.3)) *
          (lit > 0 ? 0.62 + 0.2 * (1 - lit) : 1 + 0.55 * -lit)) /
        2;
    O.push([pts[i][0] + nx * h, pts[i][1] + ny * h]);
    I.push([pts[i][0] - nx * h, pts[i][1] - ny * h]);
  }
  O.forEach((q, i) => (i ? P.lineTo(q[0], q[1]) : P.moveTo(q[0], q[1])));
  P.closePath();
  I.forEach((q, i) => (i ? P.lineTo(q[0], q[1]) : P.moveTo(q[0], q[1])));
  P.closePath();
  g.fillStyle = RC.ink;
  g.fill(P, "evenodd");
}
function inkOpen(g, pts, w, col = RC.ink) {
  const n = pts.length;
  if (n < 2) return;
  const P = new Path2D(),
    A = [],
    B = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)],
      b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0],
      dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    dx /= m;
    dy /= m;
    const t = i / (n - 1),
      h = (w * Math.pow(Math.sin(Math.PI * clamp(t, 0.03, 0.97)), 0.55)) / 2;
    A.push([pts[i][0] - dy * h, pts[i][1] + dx * h]);
    B.push([pts[i][0] + dy * h, pts[i][1] - dx * h]);
  }
  A.forEach((q, i) => (i ? P.lineTo(q[0], q[1]) : P.moveTo(q[0], q[1])));
  B.reverse().forEach((q) => P.lineTo(q[0], q[1]));
  P.closePath();
  g.fillStyle = col;
  g.fill(P);
}
const seg = (a, b, n = 6) => {
  const o = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    o.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
  }
  return o;
};
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
function bbox(pts, m = 4) {
  let a = 1e9,
    b = 1e9,
    c = -1e9,
    d = -1e9;
  pts.forEach((q) => {
    a = Math.min(a, q[0]);
    b = Math.min(b, q[1]);
    c = Math.max(c, q[0]);
    d = Math.max(d, q[1]);
  });
  return [a - m, b - m, c - a + 2 * m, d - b + 2 * m];
}
