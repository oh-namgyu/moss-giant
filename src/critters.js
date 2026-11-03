// The blue bird and the flock. Wings cycle through three drawings; distant birds are two ink strokes.
const BIRDC = {
  back: hex("#3c76b8"),
  backD: hex("#274f8c"),
  belly: hex("#f6f0df"),
  cheek: hex("#e58a3a"),
  beak: "#3a2e2a",
};
function birdBody(g, lw) {
  const body = [
      [-30, -6],
      [-24, -18],
      [-10, -22],
      [6, -14],
      [22, -6],
      [42, 2],
      [62, 12],
      [58, 18],
      [34, 14],
      [16, 18],
      [-6, 18],
      [-22, 10],
    ],
    P = polyPath(rp(body, 7, 5));
  g.fillStyle = css(BIRDC.back);
  g.fill(P);
  g.save();
  g.clip(P);
  g.fillStyle = css(BIRDC.belly);
  g.beginPath();
  g.ellipse(-8, 16, 28, 15, -0.1, 0, TAU);
  g.fill();
  g.fillStyle = css(BIRDC.cheek);
  g.beginPath();
  g.ellipse(-20, 3, 8, 6, 0, 0, TAU);
  g.fill();
  g.globalCompositeOperation = "multiply";
  g.fillStyle = "#b9bcd6";
  g.beginPath();
  g.ellipse(12, 24, 44, 12, 0, 0, TAU);
  g.fill();
  g.restore();
  inkClosed(g, rp(body, 7, 5), lw, 5, [-0.6, -0.8]);
  g.fillStyle = BIRDC.beak;
  g.beginPath();
  g.moveTo(-30, -8);
  g.lineTo(-41, -4);
  g.lineTo(-29, -1);
  g.closePath();
  g.fill();
  g.fillStyle = "#17131a";
  g.beginPath();
  g.arc(-20, -9, 3.3, 0, TAU);
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(-21, -10.2, 1.1, 0, TAU);
  g.fill();
}
function birdWing(g, a, lw) {
  g.save();
  g.translate(0, -10);
  g.rotate(a);
  const w = [
      [-12, 0],
      [10, -4],
      [34, -28],
      [52, -52],
      [58, -40],
      [50, -14],
      [32, 6],
      [6, 8],
    ],
    P = rp(w, 5, 5);
  g.fillStyle = css(BIRDC.backD);
  g.fill(polyPath(P));
  inkOpen(g, seg([26, -14], [48, -40], 3), lw * 0.6, "rgba(20,18,40,.8)");
  inkOpen(g, seg([18, -6], [42, -22], 3), lw * 0.6, "rgba(20,18,40,.8)");
  inkClosed(g, P, lw, 7, [-0.6, -0.8]);
  g.restore();
}
function drawBirdPerched(g, x, y, s) {
  g.save();
  g.translate(x, y);
  g.scale(s, s);
  const lw = 2.2;
  inkOpen(g, seg([-6, 14], [-8, 30], 2), 2.4);
  inkOpen(g, seg([8, 14], [6, 30], 2), 2.4);
  g.save();
  g.rotate(-0.1);
  birdBody(g, lw);
  g.fillStyle = css(BIRDC.backD);
  const w = rp(
    [
      [-4, -8],
      [24, -4],
      [52, 12],
      [26, 10],
      [4, 8],
    ],
    4,
    5,
  );
  g.fill(polyPath(w));
  inkClosed(g, w, lw * 0.8, 7, [-0.6, -0.8]);
  g.restore();
  g.restore();
}
function drawBirdFly(g, x, y, s, flap, heading = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(heading);
  g.scale(s, s);
  const a = [-0.75, 0.1, 0.95][flap % 3];
  birdWing(g, a + 0.15, 2);
  birdBody(g, 2.2);
  birdWing(g, a, 2.2);
  g.restore();
}
// A distant bird is two ink strokes.
function tinyBird(p, x, y, s, flap) {
  const up = [-0.9, -0.25, 0.45][flap % 3],
    dx = s,
    dy = s * up;
  p.moveTo(x - dx, y + dy);
  p.quadraticCurveTo(x - dx * 0.4, y - s * 0.1 + dy * 0.3, x, y);
  p.quadraticCurveTo(x + dx * 0.4, y - s * 0.1 + dy * 0.3, x + dx, y + dy);
  p.quadraticCurveTo(x + dx * 0.4, y + s * 0.22 + dy * 0.3, x, y + s * 0.26);
  p.quadraticCurveTo(x - dx * 0.4, y + s * 0.22 + dy * 0.3, x - dx, y + dy);
  p.closePath();
}
