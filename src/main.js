// The public API used by the tools and the player. prepare() paints every plate once; frame(i) draws frame i.
const MOSS = {
  FPS: 24,
  FRAMES: 240,
  prepare(q = 1) {
    Q = q;
    MOSS.B = buildBackdrops();
    buildParts();
    buildFX();
    MOSS.closeFore = closeFore();
    MOSS.canvas = MOSS.canvas || mk(VW * Q, VH * Q);
    MOSS.R = mk(VW * Q, VH * Q);
    MOSS.g = MOSS.canvas.getContext("2d");
  },
  frame(i) {
    renderFrame(MOSS.g, MOSS.R, i);
  },
  async wavB64() {
    const b = new Uint8Array(wavBytes(await renderScore()));
    let s = "";
    for (let i = 0; i < b.length; i += 32768) s += String.fromCharCode.apply(null, b.subarray(i, i + 32768));
    return btoa(s);
  },
};
window.MOSS = MOSS;
// Waits for a click, paints at a resolution that suits the screen, and uses the audio clock as the master clock.
function boot() {
  if (location.hash === "#capture") return;
  const $ = (id) => document.getElementById(id),
    cv = $("film"),
    veil = $("veil"),
    go = $("go"),
    note = $("note"),
    q = Math.min(innerWidth, innerHeight * 1.78) < 760 ? 0.5 : 0.72;
  let raf = 0,
    ac = null,
    score = null,
    now = () => 0,
    last = -1,
    playing = false;
  cv.width = VW * q;
  cv.height = VH * q;
  MOSS.canvas = cv;
  const stop = () => {
    playing = false;
    cancelAnimationFrame(raf);
    if (ac) ac.close();
    ac = null;
    veil.hidden = false;
    go.textContent = "Watch again";
  };
  const tick = () => {
    if (!playing) return;
    const i = Math.floor(now() * MOSS.FPS);
    if (i >= MOSS.FRAMES) return stop();
    if (i !== last && i >= 0) {
      MOSS.frame(i);
      last = i;
    }
    raf = requestAnimationFrame(tick);
  };
  const startClock = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx && score) {
      ac = new Ctx();
      ac.resume();
      const src = ac.createBufferSource(),
        start = ac.currentTime + 0.08;
      src.buffer = score;
      src.connect(ac.destination);
      src.start(start);
      now = () => ac.currentTime - start;
    } else {
      const start = performance.now();
      now = () => (performance.now() - start) / 1000;
    }
  };
  go.addEventListener("click", () => {
    veil.hidden = true;
    last = -1;
    startClock();
    playing = true;
    tick();
  });
  setTimeout(async () => {
    MOSS.prepare(q);
    MOSS.frame(30);
    score = await renderScore().catch(() => null);
    go.hidden = false;
    note.textContent =
      "Every picture and sound is computed live by this file. It contains no images, video or audio.";
  }, 60);
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
