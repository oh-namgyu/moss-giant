// Cel smoke, engine flame, light trail, wind ring, speed lines and the final grade.
function puffShape(p, x, y, rad, seed) {
  const n = 12;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU,
      k = rad * (0.72 + 0.36 * hash2(seed, i % n)),
      X = x + Math.cos(a) * k,
      Y = y + Math.sin(a) * k * 0.82,
      a2 = ((i + 0.5) / n) * TAU,
      k2 = rad * (1.02 + 0.3 * hash2(seed + 3, i % n));
    if (!i) p.moveTo(X, Y);
    else p.quadraticCurveTo(x + Math.cos(a2 - TAU / n) * k2, y + Math.sin(a2 - TAU / n) * k2 * 0.82, X, Y);
  }
  p.closePath();
}
// Cel smoke: hard-edged tones. It shrinks and breaks up as it dies instead of fading to transparent.
function drawPuffs(g, t) {
  const P = FX.P.puffs,
    A = new Path2D(),
    B = new Path2D(),
    C = new Path2D(),
    D = new Path2D();
  let any = false;
  P.forEach((p) => {
    const age = t - p.t0;
    if (age < 0 || age > p.life) return;
    any = true;
    const q = age / p.life,
      e = 1 - Math.pow(1 - q, 2.4),
      x = p.x + p.vx * e * p.life * 0.55,
      y = p.y + p.vy * e * p.life * 0.55 - q * q * 40,
      rad = p.rad * (0.35 + q * 0.95) * (q > 0.72 ? 1 - ((q - 0.72) / 0.28) * 0.62 : 1);
    puffShape(A, x, y, rad, p.seed);
    puffShape(B, x - rad * 0.07, y - rad * 0.13, rad * 0.88, p.seed);
    puffShape(C, x - rad * 0.16, y - rad * 0.26, rad * 0.64, p.seed + 1);
    puffShape(D, x - rad * 0.24, y - rad * 0.38, rad * 0.34, p.seed + 2);
  });
  if (!any) return;
  g.fillStyle = "#9a8366";
  g.fill(A);
  g.fillStyle = "#c6ae88";
  g.fill(B);
  g.fillStyle = "#e7d3aa";
  g.fill(C);
  g.fillStyle = "#fff0cc";
  g.fill(D);
}
function drawFlame(g, X, p, t, f, pow) {
  if (pow <= 0) return;
  const a = X.torso[2];
  g.save();
  g.translate(X.nozW[0], X.nozW[1]);
  g.rotate(a);
  const L = pow * (130 + 45 * vnoise(f * 1.7, 3)),
    W = pow * (42 + 6 * vnoise(f * 2.3, 9));
  const fl = (l, w, c) => {
    const q = [];
    for (let i = 0; i <= 10; i++) {
      const u = i / 10,
        wd = w * Math.sin(Math.PI * Math.pow(u, 0.55)) * (1 + 0.16 * (vnoise(i * 0.9, f * 1.3) - 0.5));
      q.push([wd, u * l]);
    }
    const P = new Path2D();
    P.moveTo(0, -4);
    q.forEach((v) => P.lineTo(v[0], v[1]));
    for (let i = q.length - 1; i >= 0; i--) P.lineTo(-q[i][0], q[i][1]);
    P.closePath();
    g.fillStyle = c;
    g.fill(P);
  };
  g.globalCompositeOperation = "lighter";
  const gl = g.createRadialGradient(0, L * 0.3, 4, 0, L * 0.3, L * 1.45);
  gl.addColorStop(0, `rgba(255,226,160,${0.7 * Math.min(1, pow)})`);
  gl.addColorStop(0.4, `rgba(255,170,90,${0.25 * Math.min(1, pow)})`);
  gl.addColorStop(1, "rgba(255,150,80,0)");
  g.fillStyle = gl;
  g.fillRect(-L * 1.5, -L * 1.2, L * 3, L * 3);
  g.globalCompositeOperation = "source-over";
  fl(L * 1.5, W * 1.16, "rgba(244,158,76,.88)");
  fl(L * 1.15, W * 0.84, "rgba(255,214,126,.96)");
  fl(L * 0.82, W * 0.56, "rgba(255,248,210,1)");
  fl(L * 0.5, W * 0.3, "rgba(216,250,255,1)");
  g.restore();
}
function drawTrail(g, t, t0, S0) {
  const u = t - t0;
  if (u <= 0) return;
  const pts = [];
  for (const s of FX.flight) {
    if (s.u > u) break;
    pts.push([S0[0] + s.o[0], S0[1] + s.o[1], s.u]);
  }
  pts.push([S0[0] + flightOffset(u)[0], S0[1] + flightOffset(u)[1], u]);
  if (pts.length < 2) return;
  const band = (mul, col, alpha) => {
    const L = [],
      R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)],
        b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0],
        dy = b[1] - a[1];
      const m = Math.hypot(dx, dy) || 1;
      dx /= m;
      dy /= m;
      const age = u - pts[i][2],
        lead = clamp((pts.length - 1 - i) / 3),
        w = mul * (26 + age * 135) * lead * (0.86 + 0.3 * vnoise(i * 0.31, Math.floor(t * 12) * 0.2));
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
      R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    const P = new Path2D();
    L.forEach((q, i) => (i ? P.lineTo(q[0], q[1]) : P.moveTo(q[0], q[1])));
    R.reverse().forEach((q) => P.lineTo(q[0], q[1]));
    P.closePath();
    g.fillStyle = css(col, alpha);
    g.fill(P);
  };
  band(1.7, hex("#ffe7b8"), 0.14);
  band(1.0, hex("#fff0cf"), 0.32);
  band(0.34, hex("#fffbe8"), 0.85);
  const A = new Path2D(),
    B = new Path2D(),
    C = new Path2D(),
    F = Math.floor(t * 12);
  for (let i = 1; i < pts.length - 1; i += 1) {
    const age = u - pts[i][2],
      q = clamp(age / 1.3),
      rad = (30 + age * 120) * (1 - q * 0.35) * (0.7 + 0.6 * hash2(i, 7)),
      sd = (hash2(i, 3) - 0.5) * (30 + age * 170),
      x = pts[i][0] + sd,
      y = pts[i][1] + (hash2(i, 5) - 0.5) * 40 + age * age * 26;
    if (age < 0.05) continue;
    puffShape(A, x, y, rad, i + (F % 3) * 0);
    puffShape(B, x - rad * 0.1, y - rad * 0.14, rad * 0.84, i);
    puffShape(C, x - rad * 0.22, y - rad * 0.3, rad * 0.5, i + 1);
  }
  g.globalAlpha = 0.86;
  g.fillStyle = "#e0bd8c";
  g.fill(A);
  g.fillStyle = "#f5dcae";
  g.fill(B);
  g.fillStyle = "#fff5da";
  g.fill(C);
  g.globalAlpha = 1;
}
function drawRing(g, t, t0, cx, cy, speed, th) {
  const age = t - t0;
  if (age < 0 || age > 1.15) return;
  const R = age * speed,
    a = Math.pow(1 - age / 1.15, 1.4),
    n = 90,
    f = Math.floor(t * 12);
  for (let k = 0; k < 3; k++) {
    const rr = R * (1 - k * 0.09);
    g.strokeStyle = `rgba(255,250,232,${a * (0.78 - k * 0.2)})`;
    g.lineWidth = (th - k * th * 0.28) * (1 + age);
    g.beginPath();
    let on = false;
    for (let i = 0; i <= n; i++) {
      const an = (i / n) * TAU,
        vis = vnoise(i * 0.16 + k * 9, f * 0.35 + k) > 0.42,
        x = cx + Math.cos(an) * rr,
        y = cy + Math.sin(an) * rr * 0.17;
      if (vis) {
        on ? g.lineTo(x, y) : g.moveTo(x, y);
        on = true;
      } else on = false;
    }
    g.stroke();
  }
}
function speedLines(g, t, cx, cy) {
  const age = t - 8.28;
  if (age < 0 || age > 0.3) return;
  const r = rng(7000 + Math.floor(t * 24));
  g.fillStyle = `rgba(255,252,236,${0.82 * (1 - age / 0.3)})`;
  for (let i = 0; i < 46; i++) {
    const a = r() * TAU,
      R0 = 220 + r() * 420,
      R1 = R0 + 200 + r() * 680,
      w = 2 + r() * 8,
      c = Math.cos(a),
      s = Math.sin(a);
    g.beginPath();
    g.moveTo(cx + c * R0, cy + s * R0);
    g.lineTo(cx + c * R1 - s * w, cy + s * R1 + c * w);
    g.lineTo(cx + c * R1 + s * w, cy + s * R1 - c * w);
    g.closePath();
    g.fill();
  }
}
function grade(g, f) {
  const b = FX.bloom,
    x = b.getContext("2d");
  x.imageSmoothingQuality = "high";
  x.drawImage(g.canvas, 0, 0, 240, 135);
  g.setTransform(Q, 0, 0, Q, 0, 0);
  g.globalCompositeOperation = "screen";
  g.globalAlpha = 0.1;
  g.drawImage(b, 0, 0, VW, VH);
  g.globalCompositeOperation = "soft-light";
  g.globalAlpha = 0.3;
  const w = g.createLinearGradient(0, 0, VW, VH);
  w.addColorStop(0, "#ffcf8a");
  w.addColorStop(0.55, "#b0a890");
  w.addColorStop(1, "#39506f");
  g.fillStyle = w;
  g.fillRect(0, 0, VW, VH);
  g.globalCompositeOperation = "multiply";
  g.globalAlpha = 1;
  g.drawImage(FX.vig, 0, 0, VW, VH);
  g.globalCompositeOperation = "overlay";
  g.globalAlpha = 0.075;
  g.drawImage(FX.grain[f % 4], ((f * 37) % 40) - 40, ((f * 53) % 30) - 30, VW + 60, VH + 60);
  g.globalCompositeOperation = "source-over";
  g.globalAlpha = 1;
}
