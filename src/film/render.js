// Composes one frame, back to front.
function drawSkyAndFar(g, cam) {
  drawLayer(g, MOSS.B.sky, cam);
  const [sx, sy] = SPL(cam, 0.3, PAL.sun[0], PAL.sun[1]);
  g.globalCompositeOperation = "lighter";
  const sg = g.createRadialGradient(sx, sy, 0, sx, sy, 620);
  sg.addColorStop(0, "rgba(255,240,196,.95)");
  sg.addColorStop(0.1, "rgba(255,226,160,.5)");
  sg.addColorStop(0.4, "rgba(255,196,120,.13)");
  sg.addColorStop(1, "rgba(255,180,110,0)");
  g.fillStyle = sg;
  g.fillRect(0, 0, VW, VH);
  g.globalCompositeOperation = "source-over";
  drawLayer(g, MOSS.B.far, cam);
  return [sx, sy];
}
function drawBackPlates(g, cam, t, close) {
  const B = MOSS.B,
    m = FX.mist,
    dr = t * 16,
    blow = t > TL ? (t - TL) * 420 : 0;
  spr(g, m[2], cam, 0.5, -1700 + dr, -30, 3400, 500, close ? 0.26 : 0.3);
  if (close) drawLayer(g, B.midSoft, cam);
  else drawWarped(g, B.mid, cam, t);
  spr(g, m[0], cam, 0.72, -1800 + dr * 1.3 - blow, 20, 3600, 430, close ? 0.36 : 0.52);
  if (close) return;
  drawWarped(g, B.near, cam, t);
  if (t > 5.5) sprLayer(g, FX.scar, cam, sstep(5.5, 6.6, t));
  sprLayer(g, FX.shadow, cam, 1 - sstep(TL, TL + 0.4, t));
  spr(g, m[1], cam, 1, -1800 - dr * 1.2 + blow * 0.6, 120, 3600, 300, 0.3);
  drawLeavesBehind(g, cam, t);
}
function drawGroundEffects(g, cam, t, step) {
  const dr = t * 16,
    blow = t > TL ? (t - TL) * 420 : 0;
  camT(g, cam);
  drawPuffs(g, step / 12);
  const rx = ROOT.x - 110,
    ry = ROOT.y;
  drawRing(g, t, 7.86, rx, ry, 950, 14);
  drawRing(g, t, TL, rx, ry, 1900, 26);
  g.setTransform(Q, 0, 0, Q, 0, 0);
  drawDebrisAndFlock(g, cam, t);
  spr(g, FX.mist[1], cam, 1.05, -1800 + dr * 1.6 + blow, 180, 3600, 320, 0.32 * (1 - sstep(TL, TL + 0.5, t)));
}
function drawLightAndLaunch(g, cam, t, close, sun, info) {
  g.globalCompositeOperation = "screen";
  g.globalAlpha =
    (close ? lerp(0.2, 0.7, sstep(3.3, 4.6, t)) : 0.8) *
    (0.84 + 0.16 * Math.sin(t * 1.3)) *
    (1 - 0.7 * sstep(TL, 9.4, t));
  g.drawImage(FX.rays, sun[0], sun[1], 2600, 1625);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  if (t < TL) return;
  drawFallingLeaves(g, t);
  speedLines(g, t, VW / 2 + (info.pv[0] - cam.x) * cam.zoom, VH / 2 + (info.pv[1] - cam.y) * cam.zoom);
  const flash = 1 - inv(TL, TL + 0.125, t);
  if (flash > 0) {
    g.fillStyle = `rgba(255,250,232,${flash * 0.7})`;
    g.fillRect(0, 0, VW, VH);
  }
}
function drawFades(g, t) {
  const fadeIn = 1 - sstep(0, 0.7, t),
    fadeOut = sstep(9.72, 10, t);
  if (fadeIn > 0) {
    g.fillStyle = `rgba(16,14,20,${fadeIn})`;
    g.fillRect(0, 0, VW, VH);
  }
  if (fadeOut > 0) {
    g.fillStyle = `rgba(255,246,222,${fadeOut})`;
    g.fillRect(0, 0, VW, VH);
  }
}
// Picture on twos: the camera moves every frame, but drawings change at most 12 times a second.
function renderFrame(g, R, i) {
  const t = i / MOSS.FPS,
    step = Math.floor(t * 12),
    cam = camAt(t),
    close = t >= T2 && t < T3,
    slowStep = t < T3 ? Math.floor(t * 8) / 8 : step / 12,
    p = poseAt(slowStep);
  g.setTransform(Q, 0, 0, Q, 0, 0);
  g.imageSmoothingQuality = "high";
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  g.fillStyle = "#000";
  g.fillRect(0, 0, VW, VH);
  const sun = drawSkyAndFar(g, cam);
  drawBackPlates(g, cam, t, close);
  const info = renderRobot(R, cam, t, p, (slowStep * 12) | 0, close);
  drawTrail2(g, cam, t);
  g.drawImage(R, 0, 0, VW, VH);
  drawGlows(g, cam, info, p, t);
  drawVines(g, cam, t, info);
  if (!close && t < TL + 1) sprLayer(g, FX.cover, cam, 1);
  if (!close) drawGroundEffects(g, cam, t, step);
  drawCritters(g, cam, t, info);
  if (close) {
    g.globalAlpha = 0.9;
    g.drawImage(MOSS.closeFore, -20, -20, VW + 40, VH + 40);
    g.globalAlpha = 1;
  } else drawWarped(g, MOSS.B.fore, cam, t);
  drawLightAndLaunch(g, cam, t, close, sun, info);
  grade(g, step);
  drawFades(g, t);
}
function drawTrail2(g, cam, t) {
  if (t < TL) return;
  camT(g, cam);
  const [px, py] = pelvisBase();
  drawTrail(g, t, TL, [px, py + 170]);
  g.setTransform(Q, 0, 0, Q, 0, 0);
}
function closeFore() {
  const c = mk(VW, VH),
    g = c.getContext("2d"),
    r = rng(61);
  foliage(
    g,
    [
      { x: 40, y: 1060, r: 300 },
      { x: 290, y: 1120, r: 190 },
      { x: -30, y: 790, r: 190 },
      { x: 1890, y: 1110, r: 250 },
      { x: 1700, y: 1160, r: 150 },
    ],
    PAL.foreT,
    r,
    { size: 30, jit: 8, bias: 0.3 },
  );
  return blurred(c, 5, 2);
}
