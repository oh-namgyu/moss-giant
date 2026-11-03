// Camera transforms, plate warping, and drawing the robot, its glows, the vines and the birds.
function drawWarped(g, L, cam, t) {
  const age = t - 7.86;
  if (age < 0 || age > 1.7) {
    drawLayer(g, L, cam);
    return;
  }
  const z = 1 + (cam.zoom - 1) * L.d,
    h = L.h,
    step = 40,
    amp = (t < TL ? 10 : 34) * Math.exp(-Math.max(0, t - TL) * 1.5);
  for (let Y = 0; Y < h; Y += step) {
    const k = 1 - Y / h,
      sh = amp * k * k * 2.2 * Math.sin(age * 9 - Y * 0.006),
      sy = Y * L.res,
      sh2 = Math.min(step * L.res + 1, L.c.height - sy);
    if (sh2 <= 0) break;
    g.drawImage(
      L.c,
      0,
      sy,
      L.c.width,
      sh2,
      VW / 2 + (L.x0 - cam.x * L.d) * z + sh * z,
      VH / 2 + (L.y0 + Y - cam.y * L.d) * z,
      L.w * z,
      (sh2 / L.res) * z + 1,
    );
  }
}
const camT = (g, cam) => {
  const z = cam.zoom * Q;
  g.setTransform(z, 0, 0, z, (VW / 2 - cam.x * cam.zoom) * Q, (VH / 2 - cam.y * cam.zoom) * Q);
};
function renderRobot(R, cam, t, p, f, close) {
  const r = R.getContext("2d");
  r.setTransform(Q, 0, 0, Q, 0, 0);
  r.clearRect(0, 0, VW, VH);
  camT(r, cam);
  let s = 1,
    off = [0, 0],
    stretch = 1;
  if (t >= TL) {
    const u = t - TL;
    off = flightOffset(u);
    s = lerp(1, 0.13, Math.pow(clamp(u / 1.5), 0.72));
    stretch = u < 0.14 ? 1.5 - u * 2 : 1;
  }
  const pv = [ROOT.x + ROOT.S * p.x + off[0], ROOT.y + ROOT.S * p.y + off[1]];
  r.translate(pv[0], pv[1]);
  if (stretch !== 1) {
    const a = -0.42;
    r.rotate(a);
    r.scale(1 / Math.sqrt(stretch), stretch);
    r.rotate(-a);
  }
  r.scale(ROOT.S * s, ROOT.S * s);
  r.translate(-p.x, -p.y);
  const X = rigOf(p),
    pow = t < 7.8 ? 0 : t < TL ? sstep(7.8, 8.1, t) * 0.55 : Math.max(1.5 - (t - TL) * 0.2, 0.8);
  drawFlame(r, X, p, t, f, pow);
  drawRobot(r, p, f, cam.zoom * ROOT.S * s);
  r.setTransform(Q, 0, 0, Q, 0, 0);
  r.globalCompositeOperation = "source-atop";
  if (close) {
    const y0 = lerp(-180, 1180, sstep(3.3, 4.85, t)),
      P = new Path2D();
    P.rect(0, 0, VW, VH);
    P.moveTo(-80, y0 + 260);
    P.lineTo(VW + 80, y0 - 260);
    P.lineTo(VW + 80, -300);
    P.lineTo(-80, -300);
    P.closePath();
    r.fillStyle = "rgba(46,58,98,.46)";
    r.fill(P, "evenodd");
    const Q = new Path2D();
    Q.moveTo(-80, y0 + 260);
    Q.lineTo(VW + 80, y0 - 260);
    Q.lineTo(VW + 80, -300);
    Q.lineTo(-80, -300);
    Q.closePath();
    r.fillStyle = "rgba(255,212,140,.15)";
    r.fill(Q);
  } else {
    const gr = r.createLinearGradient(160, 0, 1500, VH);
    gr.addColorStop(0, "rgba(255,200,120,.16)");
    gr.addColorStop(0.42, "rgba(70,70,100,.12)");
    gr.addColorStop(1, "rgba(30,38,78,.5)");
    r.fillStyle = gr;
    r.fillRect(0, 0, VW, VH);
  }
  r.globalCompositeOperation = "source-over";
  return { X, pv, s, off };
}
function drawGlows(g, cam, info, p, t) {
  const toW = (q) => {
      const w = [info.pv[0] + (q[0] - p.x) * ROOT.S * info.s, info.pv[1] + (q[1] - p.y) * ROOT.S * info.s];
      return [VW / 2 + (w[0] - cam.x) * cam.zoom, VH / 2 + (w[1] - cam.y) * cam.zoom];
    },
    Z = cam.zoom * ROOT.S * info.s;
  g.globalCompositeOperation = "lighter";
  const dot = (q, rad, a, c) => {
    if (a <= 0.01) return;
    const [x, y] = toW(q),
      R = rad * Z,
      gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, `rgba(${c},${a})`);
    gr.addColorStop(0.3, `rgba(${c},${a * 0.35})`);
    gr.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = gr;
    g.fillRect(x - R, y - R, R * 2, R * 2);
  };
  dot(info.X.eyeW, 62, p.eye * 0.5, "150,232,255");
  dot(info.X.coreW, 92, p.core * 0.42, "140,226,250");
  if (t >= TL) dot(info.X.nozW, 260, 0.5, "255,226,170");
  g.globalCompositeOperation = "source-over";
}
function drawCritters(g, cam, t, info) {
  const step = Math.floor(t * 12);
  if (t < T2) {
    const u = inv(0.7, 2.6, t);
    if (u > 0 && u < 1) {
      const x = lerp(-880, -90, u),
        y = lerp(-420, -430, u) - Math.sin(u * Math.PI) * 70;
      camT(g, cam);
      drawBirdFly(g, x, y, 0.36, step, 0.05);
      g.setTransform(Q, 0, 0, Q, 0, 0);
    }
  } else if (t < T3) {
    camT(g, cam);
    const q = info.X.shoulderTop,
      h = [ROOT.x + ROOT.S * q[0], ROOT.y + ROOT.S * q[1] - 14],
      s = 0.72;
    if (t < 3.14) {
      const u = inv(T2, 3.14, t),
        e = 1 - (1 - u) * (1 - u),
        x = lerp(h[0] - 340, h[0], e),
        y = lerp(h[1] - 210, h[1] - 4, e);
      drawBirdFly(g, x, y, s, step, lerp(0.22, -0.2, u));
    } else if (t < 5.02) {
      const hop = t < 3.3 ? Math.sin(inv(3.14, 3.3, t) * Math.PI) * 7 : 0;
      drawBirdPerched(g, h[0], h[1] - hop, s);
    } else {
      const u = inv(5.02, T3, t);
      drawBirdFly(g, h[0] + u * 120, h[1] - u * u * 400, s, step, -0.3);
    }
    g.setTransform(Q, 0, 0, Q, 0, 0);
  }
}
function drawVines(g, cam, t, info) {
  if ((t >= T2 && t < T3) || t >= TL + 0.6) return;
  if (!FX.vines) {
    const k = rigOf(KNEEL),
      r = rng(321);
    FX.vines = [
      ["foN", -40, 120],
      ["foN", 50, 170],
      ["thighN", -20, 150],
      ["torso", 70, -30],
      ["torso", 20, -14],
      ["pack", 0, 0],
      ["shinF", 20, 120],
      ["upN", -30, 120],
    ].map((v) => {
      const n = v[0] === "pack" ? "torso" : v[0],
        q = rot([v[1], v[2]], k[n][2]);
      return {
        part: n,
        lx: v[1],
        ly: v[2],
        gx: k[n][0] + q[0] + (r() - 0.5) * 70,
        len: 0,
        w: 2.2 + r() * 1.6,
        leaf: r() * 99,
      };
    });
  }
  camT(g, cam);
  const X = info.X,
    P = new Path2D();
  FX.vines.forEach((v, i) => {
    const xf = X[v.part],
      q = rot([v.lx, v.ly], xf[2]),
      ax = ROOT.x + ROOT.S * (xf[0] + q[0]),
      ay = ROOT.y + ROOT.S * (xf[1] + q[1]),
      gx = ROOT.x + ROOT.S * v.gx,
      gy = ROOT.y - 2,
      snapT = 5.62 + i * 0.17,
      br = t > snapT,
      dt = t - snapT;
    let pts;
    if (!br) {
      const sag = lerp(30, 4, inv(5.2, snapT, t));
      pts = curve(ax, ay, gx, gy, sag * 0.002, 9).map((q, k) => [q[0] + Math.sin(k * 1.9 + i) * 5, q[1]]);
    } else {
      const fall = Math.min(1, dt * 2.4),
        ex = lerp(gx, ax + Math.sin(dt * 5 + i) * 46 * Math.exp(-dt * 1.4), fall),
        ey = lerp(gy, ay + 95 + i * 9, fall);
      pts = curve(ax, ay, ex, ey, 0.1 * Math.sin(dt * 6 + i), 9);
    }
    rib(g, pts, v.w * 1.3, 1, "#2f4a33");
    pts.forEach((q2, k) => {
      if (k % 1 === 0)
        leafAt(P, q2[0] + hash2(i, k) * 12 - 6, q2[1], 6 + hash2(k, i) * 5, hash2(i + 3, k) * 6, 1);
    });
  });
  g.fillStyle = "#5b8a42";
  g.fill(P);
  g.setTransform(Q, 0, 0, Q, 0, 0);
}
