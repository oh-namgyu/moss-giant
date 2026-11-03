// Shared maths, colour, noise and canvas helpers. Everything random is seeded, so a frame number always gives the same picture.
const VW = 1920,
  VH = 1080,
  TAU = Math.PI * 2;
let Q = 1;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const sstep = (a, b, x) => {
  const t = inv(a, b, x);
  return t * t * (3 - 2 * t);
};
const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const jit = (c, r, a) => {
  const d = (r() - 0.5) * a;
  return [
    clamp(c[0] + d + (r() - 0.5) * a * 0.5, 0, 255),
    clamp(c[1] + d + (r() - 0.5) * a * 0.5, 0, 255),
    clamp(c[2] + d + (r() - 0.5) * a * 0.5, 0, 255),
  ];
};
function hash2(x, y) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(x, y) {
  const ix = Math.floor(x),
    iy = Math.floor(y);
  let fx = x - ix,
    fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  return lerp(
    lerp(hash2(ix, iy), hash2(ix + 1, iy), fx),
    lerp(hash2(ix, iy + 1), hash2(ix + 1, iy + 1), fx),
    fy,
  );
}
function fbm(x, y, o = 4) {
  let v = 0,
    a = 0.5;
  for (let i = 0; i < o; i++) {
    v += a * vnoise(x, y);
    x = x * 2.03 + 11;
    y = y * 2.03 + 7;
    a *= 0.5;
  }
  return v;
}
function mk(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}
// Blur by repeated down- and up-scaling; ctx.filter is not available in Safari.
function blurred(src, f, passes = 2) {
  let w = src.width,
    h = src.height,
    cur = src;
  for (let i = 0; i < passes; i++) {
    w = Math.max(2, Math.round(w / f));
    h = Math.max(2, Math.round(h / f));
    const c = mk(w, h),
      x = c.getContext("2d");
    x.imageSmoothingQuality = "high";
    x.drawImage(cur, 0, 0, w, h);
    cur = c;
  }
  const o = mk(src.width, src.height),
    x = o.getContext("2d");
  x.imageSmoothingQuality = "high";
  x.drawImage(cur, 0, 0, o.width, o.height);
  return o;
}
// A plate painted in set coordinates. d is its depth for parallax: 1 is the robot plane, smaller is further away.
function layer(x0, y0, w, h, res0, d) {
  const res = res0 * Q,
    c = mk(w * res, h * res),
    g = c.getContext("2d", { willReadFrequently: true });
  g.scale(res, res);
  g.translate(-x0, -y0);
  return { c, g, x0, y0, w, h, res, d };
}
function drawLayer(ctx, L, cam, alpha = 1) {
  const z = 1 + (cam.zoom - 1) * L.d;
  ctx.globalAlpha = alpha;
  ctx.drawImage(L.c, VW / 2 + (L.x0 - cam.x * L.d) * z, VH / 2 + (L.y0 - cam.y * L.d) * z, L.w * z, L.h * z);
  ctx.globalAlpha = 1;
}
