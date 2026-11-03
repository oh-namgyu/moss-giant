// Draws the rig. Cel shadows and rim light are recomputed from each joint angle, so lighting follows the pose.
function drawPart(g, P, st, xf, far = false) {
  g.save();
  g.translate(xf[0], xf[1]);
  g.rotate(xf[2]);
  if (xf[3]) g.scale(xf[3], xf[3]);
  const L = rot(LIGHT, -xf[2]),
    amp = st.amp,
    pts = wob(P.pts, P.seed, st.f, amp),
    path = polyPath(pts),
    s2 = Object.assign({}, st, { L });
  g.fillStyle = css(P.col);
  g.fill(path);
  g.save();
  g.clip(path);
  g.drawImage(P.tex.c, P.tex.x, P.tex.y, P.tex.w, P.tex.h);
  P.plates.forEach((q, i) => {
    const pp = polyPath(wob(q.pts, P.seed + i + 3, st.f, amp));
    g.fillStyle = css(q.col);
    g.fill(pp);
    g.save();
    g.clip(pp);
    g.drawImage(q.tex.c, q.tex.x, q.tex.y, q.tex.w, q.tex.h);
    g.restore();
    inkClosed(g, wob(q.pts, P.seed + i + 3, st.f, amp), st.lw * 0.7, P.seed + i, L);
  });
  P.lines.forEach((q, i) => inkOpen(g, wob(q, P.seed + i + 20, st.f, amp), st.lw * 0.62));
  P.riv.forEach((v) => {
    g.fillStyle = css(v.col);
    g.beginPath();
    g.arc(v.x, v.y, v.r, 0, TAU);
    g.fill();
    g.fillStyle = "rgba(255,240,210,.5)";
    g.beginPath();
    g.arc(v.x - 0.9, v.y - 1.1, v.r * 0.42, 0, TAU);
    g.fill();
  });
  const box = new Path2D();
  box.rect(-900, -900, 1800, 1800);
  const cres = (dx, dy) => {
    const q = new Path2D();
    q.addPath(box);
    q.addPath(path, new DOMMatrix().translate(dx, dy));
    return q;
  };
  g.globalCompositeOperation = "multiply";
  g.fillStyle = css(RC.shadow);
  g.fill(cres(L[0] * P.d1, L[1] * P.d1), "evenodd");
  g.fillStyle = css(RC.deep);
  g.fill(cres(L[0] * P.d2 * 0.8, L[1] * P.d2 * 0.8), "evenodd");
  g.globalCompositeOperation = "screen";
  g.fillStyle = css(RC.rim, 0.72);
  g.fill(cres(-L[0] * P.rim, -L[1] * P.rim), "evenodd");
  g.globalCompositeOperation = "source-over";
  if (far) {
    g.globalCompositeOperation = "multiply";
    g.fillStyle = "#a9aecb";
    g.fillRect(-900, -900, 1800, 1800);
    g.globalCompositeOperation = "source-over";
  }
  g.restore();
  if (P.extra) P.extra(g, s2);
  inkClosed(g, pts, st.lw, P.seed, L);
  if (P.mo) g.drawImage(P.mo.c, P.mo.x, P.mo.y, P.mo.w, P.mo.h);
  g.restore();
}
function drawHand(g, set, st, xf, far) {
  set
    .slice()
    .reverse()
    .forEach((P) => drawPart(g, P, st, xf, far));
}
// g is already translated to ROOT. f is the drawing number: the same number gives the same line wobble.
function drawRobot(g, p, f, zoom) {
  const X = rigOf(p),
    P = PARTS,
    st = { f, p, amp: 0.72 / Math.pow(zoom, 0.72), lw: 3.1 / Math.sqrt(zoom) };
  drawHand(g, P.haF, st, X.haF, true);
  drawPart(g, P.foF, st, X.foF, true);
  drawPart(g, P.elF, st, [X.upF[0], X.upF[1], X.upF[2]], true);
  drawPart(g, P.upF, st, X.upF, true);
  drawPart(g, P.paulF, st, X.paulF, true);
  drawPart(g, P.ftF, st, X.footF, true);
  drawPart(g, P.shF, st, X.shinF, true);
  drawPart(g, P.knF, st, X.shinF, true);
  drawPart(g, P.thF, st, X.thighF, true);
  g.save();
  g.translate(X.torso[0], X.torso[1]);
  g.rotate(X.torso[2]);
  g.drawImage(P.tree.c, P.tree.x, P.tree.y, P.tree.w, P.tree.h);
  g.restore();
  drawPart(g, P.nozzle, st, X.torso);
  drawPart(g, P.pack, st, X.torso);
  drawPart(g, P.pelvis, st, X.pelvis);
  drawPart(g, P.torso, st, X.torso);
  coreLens(g, X, p);
  drawPart(g, P.neck, st, X.head);
  drawPart(g, P.head, st, X.head);
  drawPart(g, P.ftN, st, X.footN);
  drawPart(g, P.shN, st, X.shinN);
  drawPart(g, P.thN, st, X.thighN);
  drawPart(g, P.knN, st, X.shinN);
  drawPart(g, P.upN, st, X.upN);
  drawPart(g, P.elN, st, X.upN);
  drawPart(g, P.foN, st, X.foN);
  drawHand(g, P.haN, st, X.haN, false);
  drawPart(g, P.paul, st, X.paul);
  g.save();
  g.translate(X.paul[0], X.paul[1]);
  g.rotate(X.paul[2]);
  g.scale(X.paul[3], X.paul[3]);
  g.drawImage(P.pSap.c, P.pSap.x, P.pSap.y, P.pSap.w, P.pSap.h);
  g.restore();
  return X;
}
function coreLens(g, X, p) {
  g.save();
  g.translate(X.torso[0], X.torso[1]);
  g.rotate(X.torso[2]);
  const c = [-82, -168];
  g.fillStyle = "#3a404c";
  g.beginPath();
  g.arc(c[0], c[1], 38, 0, TAU);
  g.fill();
  const gl = g.createRadialGradient(c[0] - 4, c[1] - 4, 2, c[0], c[1], 29);
  gl.addColorStop(0, css(mixc(hex("#34405a"), hex("#f4feff"), p.core)));
  gl.addColorStop(0.5, css(mixc(hex("#1f2a3d"), hex("#9cecf8"), p.core)));
  gl.addColorStop(1, css(mixc(hex("#10141f"), hex("#2f93b4"), p.core)));
  g.fillStyle = gl;
  g.beginPath();
  g.arc(c[0], c[1], 29, 0, TAU);
  g.fill();
  inkClosed(g, ell(c[0], c[1], 38, 38, 24), 3, 4, [0.2, -0.9]);
  inkClosed(g, ell(c[0], c[1], 29, 29, 22), 2.2, 5, [0.2, -0.9]);
  g.fillStyle = "rgba(255,255,255,.55)";
  g.beginPath();
  g.ellipse(c[0] - 9, c[1] - 11, 7, 4, -0.6, 0, TAU);
  g.fill();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    g.fillStyle = "#8c8678";
    g.beginPath();
    g.arc(c[0] + Math.cos(a) * 33.5, c[1] + Math.sin(a) * 33.5, 1.9, 0, TAU);
    g.fill();
  }
  g.restore();
}
