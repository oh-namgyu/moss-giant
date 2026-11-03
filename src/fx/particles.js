// Particles keep only start values; every position is a closed-form function of time, so any frame renders alone.
function buildParticles() {
  const r = rng(1234),
    P = { ambient: [], shed: [], clods: [], blast: [], screen: [], flock: [], puffs: [] };
  for (let i = 0; i < 84; i++)
    P.ambient.push({
      x: -1250 + r() * 2500,
      y: -700 + r() * 1000,
      s: 5 + r() * 7,
      ph: r() * TAU,
      sp: 18 + r() * 24,
      gold: r(),
    });
  const anchors = ["torso", "head", "upN", "foN", "paul", "thighN", "pack", "shinN"];
  for (let i = 0; i < 300; i++) {
    const t0 = 5.35 + r() * 2,
      a = anchors[(r() * anchors.length) | 0];
    P.shed.push({
      t0,
      a,
      lx: (r() - 0.5) * 150,
      ly: -r() * 170,
      vx: (r() - 0.5) * 90 - 10,
      vy: -20 + r() * 50,
      s: 4.5 + r() * 7.5,
      ph: r() * TAU,
      gold: r(),
    });
  }
  for (let i = 0; i < 54; i++) {
    const t0 = 5.4 + r() * 1.9,
      a = anchors[(r() * anchors.length) | 0];
    P.clods.push({
      t0,
      a,
      lx: (r() - 0.5) * 150,
      ly: -r() * 150,
      vx: (r() - 0.5) * 150,
      vy: -40 + r() * 40,
      s: 2.5 + r() * r() * 11,
      seed: (r() * 999) | 0,
      rot: r() * TAU,
      spin: (r() - 0.5) * 7,
    });
  }
  for (let i = 0; i < 260; i++) {
    const a = r() * TAU,
      k = 0.35 + r() * 1.1;
    P.blast.push({
      t0: 8.28 + r() * 0.1,
      x: ROOT.x - 110,
      y: ROOT.y + Math.sin(a) * 12 - 10,
      vx: Math.cos(a) * 1150 * k,
      vy: -260 - r() * 760,
      s: 6 + r() * 11,
      ph: r() * TAU,
      gold: r(),
    });
  }
  for (let i = 0; i < 130; i++)
    P.screen.push({
      x: r() * VW * 1.3 - VW * 0.15,
      t0: 8.55 + r() * 1.1,
      sp: 130 + r() * 190,
      s: 11 + r() * 24,
      ph: r() * TAU,
      amp: 30 + r() * 80,
      gold: r(),
    });
  for (let i = 0; i < 70; i++) {
    const near = i < 10;
    P.flock.push({
      x: -1250 + r() * 2500,
      y: -210 + r() * 210,
      t0: 5.22 + r() * 0.52,
      vx: (r() < 0.5 ? -1 : 1) * (120 + r() * 280),
      vy: -(250 + r() * 260),
      s: near ? 11 + r() * 7 : 5 + r() * 5.5,
      ph: (r() * 3) | 0,
      wob: r() * TAU,
    });
  }
  [
    [5.45, -300, -10, 7, 70],
    [5.6, -120, -6, 6, 60],
    [5.72, 190, -36, 6, 66],
    [6.05, 70, -12, 8, 86],
    [6.3, 185, -120, 5, 54],
    [6.85, 10, -20, 12, 92],
    [6.87, -190, -20, 6, 62],
  ].forEach((e, k) => {
    for (let i = 0; i < e[3]; i++) {
      const a = -Math.PI * r(),
        sp = r();
      P.puffs.push({
        t0: e[0] + r() * 0.08,
        x: ROOT.x + e[1] * ROOT.S + (r() - 0.5) * 70,
        y: ROOT.y + e[2] * 0.2,
        vx: Math.cos(a) * (70 + sp * 190),
        vy: Math.sin(a) * (14 + sp * 62),
        rad: e[4] * (0.5 + r() * 0.7),
        seed: k * 40 + i,
        life: 1.0 + r() * 0.8,
      });
    }
  });
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * TAU + r() * 0.1,
      sp = 0.65 + r() * 0.5;
    P.puffs.push({
      t0: 7.86 + r() * 0.06,
      x: ROOT.x - 110 + Math.cos(a) * 80,
      y: ROOT.y + Math.sin(a) * 14,
      vx: Math.cos(a) * 520 * sp,
      vy: Math.sin(a) * 92 * sp - 6,
      rad: 50 + r() * 62,
      seed: 400 + i,
      life: 1 + r() * 0.5,
    });
  }
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * TAU + r() * 0.06,
      sp = 0.7 + r() * 0.6;
    P.puffs.push({
      t0: 8.28 + r() * 0.05,
      x: ROOT.x - 110 + Math.cos(a) * 120,
      y: ROOT.y + Math.sin(a) * 22 - 8,
      vx: Math.cos(a) * 1250 * sp,
      vy: Math.sin(a) * 210 * sp - 14,
      rad: 78 + r() * 120,
      seed: 600 + i,
      life: 1.05 + r() * 0.55,
    });
  }
  return P;
}
function leafAt(p, x, y, s, a, flip) {
  const w = s * Math.max(0.2, Math.abs(Math.cos(flip))),
    ca = Math.cos(a),
    sa = Math.sin(a),
    h = s * 0.42,
    pt = (q, v) => [x + q * ca - v * sa, y + q * sa + v * ca],
    A = pt(-w, 0),
    B = pt(0, -h),
    C = pt(w, 0),
    D = pt(0, h);
  p.moveTo(A[0], A[1]);
  p.quadraticCurveTo(B[0], B[1], C[0], C[1]);
  p.quadraticCurveTo(D[0], D[1], A[0], A[1]);
  p.closePath();
}
function drawLeafBatch(g, list) {
  const b = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
  list.forEach((l) => {
    const k = l.gold < 0.3 ? 0 : l.gold < 0.62 ? 1 : l.gold < 0.86 ? 2 : 3;
    leafAt(b[k], l.x, l.y, l.s, l.a, l.flip);
  });
  ["#4f7a3d", "#7e9c45", "#c7b25a", "#e7c778"].forEach((c, i) => {
    g.fillStyle = c;
    g.fill(b[i]);
  });
}
const quantized = (t) => Math.floor(t * 12) / 12;
// Where a piece of debris left the body: the part's transform at the moment it was shed.
function spawnPoint(a) {
  FX.cache = FX.cache || {};
  const k = Math.round(a.t0 * 12),
    X = FX.cache[k] || (FX.cache[k] = rigOf(poseAt(k / 12))),
    xf = X[a.a === "pack" ? "torso" : a.a],
    q = rot([a.lx, a.ly], xf[2]);
  return [ROOT.x + ROOT.S * (xf[0] + q[0]), ROOT.y + ROOT.S * (xf[1] + q[1])];
}
function drawLeavesBehind(g, cam, t) {
  const step = quantized(t),
    L = FX.P.ambient.map((a) => ({
      x: a.x + Math.sin(step * 1.3 + a.ph) * 26,
      y: ((a.y + 500 + step * a.sp) % 1000) - 500,
      s: a.s,
      a: a.ph + step * 1.4,
      flip: a.ph + step * 2.7,
      gold: a.gold,
    }));
  camT(g, cam);
  drawLeafBatch(g, L);
  g.setTransform(Q, 0, 0, Q, 0, 0);
}
function shedLeaves(step) {
  const L = [];
  FX.P.shed.forEach((a) => {
    const age = step - a.t0;
    if (age < 0 || age > 3.2) return;
    const [x0, y0] = spawnPoint(a),
      y = y0 + a.vy * age + Math.min(age * age * 170, age * 132);
    if (y > ROOT.y + 18) return;
    L.push({
      x: x0 + a.vx * age + Math.sin(age * 3.2 + a.ph) * 24,
      y,
      s: a.s,
      a: a.ph + age * 3,
      flip: a.ph + age * 6,
      gold: a.gold,
    });
  });
  return L;
}
function drawClods(g, step) {
  const body = new Path2D(),
    top = new Path2D();
  FX.P.clods.forEach((a) => {
    const age = step - a.t0;
    if (age < 0 || age > 2) return;
    const [x0, y0] = spawnPoint(a),
      y = y0 + a.vy * age + 640 * age * age;
    if (y > ROOT.y + 14) return;
    const x = x0 + a.vx * age,
      rr = rng(a.seed);
    blobPath(body, x, y, a.s, rr, 0.8, 7);
    blobPath(top, x - a.s * 0.2, y - a.s * 0.3, a.s * 0.5, rr, 0.7, 6);
  });
  g.fillStyle = "#43372b";
  g.fill(body);
  g.fillStyle = "#6a5a42";
  g.fill(top);
}
function blastLeaves(step) {
  const L = [];
  FX.P.blast.forEach((a) => {
    const age = step - a.t0;
    if (age < 0 || age > 1.72) return;
    const e = 1 - Math.exp(-age * 2.3);
    L.push({
      x: a.x + a.vx * e * 0.55 + Math.sin(age * 5 + a.ph) * 18,
      y: a.y + a.vy * e * 0.62 + age * age * 118,
      s: a.s,
      a: a.ph + age * 8,
      flip: a.ph + age * 11,
      gold: a.gold,
    });
  });
  return L;
}
function drawFlock(g, step) {
  const path = new Path2D();
  FX.P.flock.forEach((a) => {
    const age = step - a.t0;
    if (age < 0 || age > 2.6) return;
    tinyBird(
      path,
      a.x + a.vx * age + Math.sin(age * 5 + a.wob) * 7,
      a.y + a.vy * age - 16 * age * age,
      a.s,
      Math.floor(step * 12) + a.ph,
    );
  });
  g.fillStyle = "#253044";
  g.fill(path);
}
function drawDebrisAndFlock(g, cam, t) {
  const step = quantized(t);
  camT(g, cam);
  drawLeafBatch(g, shedLeaves(step));
  drawClods(g, step);
  drawLeafBatch(g, blastLeaves(step));
  drawFlock(g, step);
  g.setTransform(Q, 0, 0, Q, 0, 0);
}
function drawFallingLeaves(g, t) {
  const step = quantized(t),
    L = [];
  FX.P.screen.forEach((a) => {
    const age = step - a.t0;
    if (age < 0) return;
    L.push({
      x: a.x + Math.sin(age * 1.7 + a.ph) * a.amp,
      y: -40 + age * a.sp + Math.sin(age * 2.6 + a.ph) * 16,
      s: a.s,
      a: a.ph + age * 2.4,
      flip: a.ph + age * 4.2,
      gold: 0.35 + a.gold * 0.65,
    });
  });
  drawLeafBatch(g, L);
}
