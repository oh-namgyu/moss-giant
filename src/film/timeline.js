// The 10-second board: forest (0-2.7s), close-up with bird and sunlight (2.7-5.2s), standing up (5.2-7.75s), ignition and launch (7.75-10s).
const T2 = 2.7,
  T3 = 5.2,
  T4 = 7.75,
  TL = 8.28;
const K1 = Object.assign({}, KNEEL, {
  x: -22,
  y: -212,
  torso: -0.66,
  head: -0.42,
  ns: 0.3,
  ne: 1,
  nw: 0.3,
  fs: 0.72,
  fe: 0.62,
});
const K2 = Object.assign({}, KNEEL, {
  x: -55,
  y: -325,
  torso: -0.42,
  head: -0.2,
  ns: 0.1,
  ne: 0.55,
  nw: 0.3,
  fs: 0.55,
  fe: 0.4,
  fw: 0.25,
  fax: 95,
  fay: -110,
  ff: -0.75,
});
const K3 = Object.assign({}, KNEEL, {
  x: -85,
  y: -395,
  torso: -0.16,
  head: 0.02,
  ns: 0.1,
  ne: 0.35,
  nw: 0.2,
  fs: 0.25,
  fe: 0.15,
  fw: 0.1,
  fax: 10,
  fay: -37,
  ff: 0,
});
const K4 = Object.assign({}, K3, {
  x: -95,
  y: -404,
  torso: -0.03,
  head: 0.3,
  ns: 0.16,
  ne: 0.3,
  nw: 0.15,
  fs: 0.06,
  fe: 0.18,
});
const K5 = Object.assign({}, K4, {
  y: -336,
  torso: -0.3,
  head: 0.2,
  ns: -0.45,
  ne: -0.15,
  nw: 0,
  fs: -0.6,
  fe: -0.25,
  fw: 0,
});
const KEYS = [
  [0, KNEEL],
  [5.25, KNEEL],
  [5.62, K1],
  [6.28, K2],
  [6.85, K3],
  [7.36, K4],
  [7.8, K4],
  [8.24, K5],
];
function poseAt(t) {
  let a = KEYS[0],
    b = KEYS[0];
  for (let i = 0; i < KEYS.length - 1; i++)
    if (t >= KEYS[i][0]) {
      a = KEYS[i];
      b = KEYS[i + 1];
    }
  const u = sstep(a[0], b[0], t),
    p = {};
  for (const k in KNEEL) p[k] = lerp(a[1][k], b[1][k], u);
  p.torso += Math.sin(t * 1.4) * 0.004 * (t < T3);
  p.head += sstep(3.5, 4.7, t) * (1 - sstep(5.2, 5.5, t)) * 0.2;
  p.eye = sstep(3.75, 3.9, t) * 0.12 + sstep(4, 4.8, t) * 0.78 + sstep(6.6, 7.2, t) * 0.1;
  if (t > 3.85 && t < 4.05) p.eye *= 0.3;
  p.core =
    (t < 4.42 ? 0 : (0.25 + 0.5 * sstep(4.42, 5, t)) * (t < 4.9 && Math.floor(t * 12) % 2 ? 0.4 : 1)) +
    sstep(7.7, 8.28, t) * 0.3;
  if (t >= TL) {
    const f = sstep(TL, TL + 0.2, t);
    p.torso = lerp(K5.torso, -0.52, f);
    p.head = lerp(K5.head, -0.06, f);
    p.ns = lerp(K5.ns, -0.95, f);
    p.ne = lerp(K5.ne, -0.72, f);
    p.nw = lerp(K5.nw, -0.5, f);
    p.fs = lerp(K5.fs, -1.05, f);
    p.fe = lerp(K5.fe, -0.82, f);
    p.fw = lerp(K5.fw, -0.6, f);
    p.nax = lerp(K5.nax, K5.x + 70, f);
    p.nay = lerp(K5.nay, K5.y + 360, f);
    p.fax = lerp(K5.fax, K5.x + 126, f);
    p.fay = lerp(K5.fay, K5.y + 325, f);
    p.nf = -0.62 * f;
    p.ff = -0.74 * f;
    p.core = 1;
  }
  return p;
}
const pelvisBase = () => [ROOT.x + ROOT.S * K5.x, ROOT.y + ROOT.S * K5.y];
function camAt(t) {
  let c;
  if (t < T2) {
    const u = t / T2;
    c = { x: lerp(54, 28, u), y: lerp(-120, -94, u), zoom: lerp(0.9, 0.97, u) };
  } else if (t < T3) {
    const u = (t - T2) / (T3 - T2);
    c = { x: lerp(-58, -44, u), y: lerp(-296, -288, u), zoom: lerp(2.04, 2.2, u) };
  } else if (t < T4) {
    const u = sstep(T3, T4, t);
    c = { x: lerp(46, -16, u), y: lerp(-128, -326, u), zoom: lerp(0.92, 0.87, u) };
  } else {
    const u = sstep(TL + 0.08, 9.7, t);
    c = { x: lerp(-22, -170, u), y: lerp(-322, -1238, u), zoom: lerp(0.88, 0.93, u) };
  }
  const shk = t > 5.25 && t < 7.4 ? 3.6 : 0,
    ev = (a, amp, d) => (t >= a ? amp * Math.exp(-(t - a) / d) : 0),
    A = shk + ev(6.85, 17, 0.14) + ev(5.72, 7, 0.12) + ev(7.84, 8, 0.3) + ev(TL, 34, 0.28),
    n = Math.floor(t * 24);
  c.x += (vnoise(n * 0.77, 1) - 0.5) * A * 2 + (vnoise(Math.floor(t * 12) * 0.9, 8) - 0.5) * 0.5;
  c.y += (vnoise(n * 0.77, 5) - 0.5) * A * 2 + (vnoise(Math.floor(t * 12) * 0.9, 3) - 0.5) * 0.5;
  return c;
}
