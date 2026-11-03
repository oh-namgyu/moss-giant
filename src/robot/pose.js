// The skeleton: joint positions from a pose, with two-bone IK for the legs. One rig in every shot keeps the character on model.
const ROOT = { x: 120, y: 330, S: 1.25 },
  LEG = 190;
const KNEEL = {
  x: 0,
  y: -227,
  torso: -0.5,
  head: -0.38,
  ns: 0.38,
  ne: 1.2,
  nw: 0.28,
  fs: 0.74,
  fe: 0.66,
  fw: 0.2,
  nax: -190,
  nay: -37,
  nf: 0,
  fax: 170,
  fay: -135,
  ff: -1.25,
  eye: 0,
  core: 0,
};
function solveLeg(hx, hy, ax, ay) {
  const dx = ax - hx,
    dy = ay - hy,
    m = Math.hypot(dx, dy) || 1,
    ux = dx / m,
    uy = dy / m,
    d = Math.min(m, LEG * 2 - 1),
    a = d / 2,
    h = Math.sqrt(Math.max(0, LEG * LEG - a * a)),
    kx = hx + ux * a - uy * h,
    ky = hy + uy * a + ux * h,
    ex = hx + ux * d,
    ey = hy + uy * d;
  return { kx, ky, ex, ey, th: Math.atan2(-(kx - hx), ky - hy), sh: Math.atan2(-(ex - kx), ey - ky) };
}
function rigOf(p) {
  const T = (lx, ly) => {
      const v = rot([lx, ly], p.torso);
      return [p.x + v[0], p.y + v[1]];
    },
    X = {};
  X.torso = [p.x, p.y, p.torso];
  X.pelvis = [p.x, p.y, p.torso * 0.45];
  const nk = T(-58, -268);
  X.head = [nk[0], nk[1], p.head, 1.32];
  const legN = solveLeg(p.x, p.y + 8, p.nax, p.nay),
    legF = solveLeg(p.x - 12, p.y + 2, p.fax, p.fay);
  X.thighN = [p.x, p.y + 8, legN.th];
  X.shinN = [legN.kx, legN.ky, legN.sh];
  X.footN = [legN.ex, legN.ey, p.nf];
  X.thighF = [p.x - 12, p.y + 2, legF.th];
  X.shinF = [legF.kx, legF.ky, legF.sh];
  X.footF = [legF.ex, legF.ey, p.ff];
  const arm = (sh, s, e, w) => {
    const a = rot([0, 190], s),
      el = [sh[0] + a[0], sh[1] + a[1]],
      b = rot([0, 215], e),
      wr = [el[0] + b[0], el[1] + b[1]];
    return { up: [sh[0], sh[1], s], fo: [el[0], el[1], e], ha: [wr[0], wr[1], w] };
  };
  const aN = arm(T(48, -205), p.ns, p.ne, p.nw),
    aF = arm(T(-10, -214), p.fs, p.fe, p.fw);
  X.upN = aN.up;
  X.foN = aN.fo;
  X.haN = aN.ha;
  X.upF = aF.up;
  X.foF = aF.fo;
  X.haF = aF.ha;
  X.paul = [aN.up[0], aN.up[1], lerp(p.torso, p.ns, 0.35), 0.84];
  X.paulF = [aF.up[0], aF.up[1], lerp(p.torso, p.fs, 0.3), 0.8];
  const lp = (tr, v) => {
    const q = rot([v[0] * (tr[3] || 1), v[1] * (tr[3] || 1)], tr[2]);
    return [tr[0] + q[0], tr[1] + q[1]];
  };
  X.eyeW = lp(X.head, [-40, -58]);
  X.coreW = lp(X.torso, [-82, -168]);
  X.nozW = lp(X.torso, [157, -6]);
  X.shoulderTop = lp(X.paul, [-46, -98]);
  return X;
}
