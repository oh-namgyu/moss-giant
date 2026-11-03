// The soundtrack is synthesised too. The same score renders for live playback and for the MP4.
function forestBed({ bus, noise, tone }) {
  noise(0, 10, "bandpass", 620, 0.5, [
    [0.05, 0],
    [1, 0.05],
    [5.2, 0.06],
    [7.8, 0.03],
    [9.9, 0.09],
  ]);
  const chirp = (t, pitch, n = 3) => {
    for (let i = 0; i < n; i++) {
      const s = t + i * 0.11;
      tone(s, s + 0.08, "sine", pitch * (1 + i * 0.08), pitch * 1.35, 0.05, 0.012, bus(0.5));
    }
  };
  [
    [0.5, 2900],
    [1.15, 3500, 2],
    [1.7, 2600, 4],
    [2.35, 3200],
    [3.0, 3650, 2],
    [3.2, 4100, 3],
    [4.25, 3350, 2],
  ].forEach((a) => chirp(a[0], a[1], a[2]));
}
// Strings and piano: a simple original melody in D major.
function music({ ac, bus, tone }) {
  const dst = bus(0.55),
    hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const piano = (t, m, v = 0.13, d = 2.6) => {
    [
      [1, 1],
      [2, 0.32],
      [3, 0.1],
      [4.01, 0.05],
    ].forEach((h) => tone(t, t + d / h[0], "sine", hz(m) * h[0], hz(m) * h[0] * 0.999, v * h[1], 0.006, dst));
  };
  const pad = (t, d, chord, v) => {
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(600, t);
    lp.frequency.linearRampToValueAtTime(1600, t + d * 0.6);
    lp.connect(dst);
    chord.forEach((m) =>
      [-0.08, 0.08].forEach((detune) => {
        const o = ac.createOscillator(),
          g = ac.createGain();
        o.type = "sawtooth";
        o.frequency.value = hz(m + detune);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(v, t + d * 0.4);
        g.gain.setValueAtTime(v, t + d * 0.7);
        g.gain.linearRampToValueAtTime(0, t + d);
        o.connect(g);
        g.connect(lp);
        o.start(t);
        o.stop(t + d + 0.02);
      }),
    );
  };
  [
    [0.6, 74],
    [1.3, 81],
    [1.9, 78],
    [2.75, 76],
    [3.3, 74],
    [3.75, 71],
    [4.35, 73],
    [4.85, 78],
  ].forEach((a) => piano(a[0], a[1]));
  pad(0.2, 2.8, [50, 62, 69], 0.018);
  pad(2.7, 2.6, [47, 59, 66, 74], 0.018);
  pad(5.1, 2.7, [43, 55, 62, 71], 0.026);
  pad(7.7, 0.7, [45, 57, 64, 73], 0.036);
  pad(8.28, 1.72, [50, 62, 69, 78, 86], 0.05);
  [
    [8.3, 86],
    [8.3, 90],
    [8.3, 93],
    [8.62, 98],
    [8.95, 93],
    [9.3, 90],
  ].forEach((a) => piano(a[0], a[1], 0.13, 2));
}
// Wingbeats, the eye lens waking, the heartbeat from the chest core.
function wakeSounds({ bus, noise, tone }) {
  noise(2.85, 3.2, "highpass", 2600, 0.7, [
    [2.88, 0.04],
    [3.12, 0.02],
    [3.19, 0],
  ]);
  tone(3.95, 4.75, "sine", 300, 860, 0.035, 0.2, bus(0.5));
  tone(4.05, 4.9, "triangle", 1250, 1900, 0.012, 0.3, bus(0.7));
  [4.45, 4.78, 5.05].forEach((t) => tone(t, t + 0.34, "sine", 62, 44, 0.3, 0.02));
}
function metalGroan({ ac, bus }) {
  const o = ac.createOscillator(),
    f = ac.createBiquadFilter(),
    g = ac.createGain();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(46, 5.35);
  [
    [5.9, 62],
    [6.3, 55],
    [6.75, 74],
    [7.3, 58],
  ].forEach((k) => o.frequency.linearRampToValueAtTime(k[1], k[0]));
  f.type = "bandpass";
  f.Q.value = 5;
  f.frequency.setValueAtTime(190, 5.35);
  f.frequency.linearRampToValueAtTime(430, 6.7);
  f.frequency.linearRampToValueAtTime(240, 7.3);
  g.gain.setValueAtTime(0, 5.35);
  g.gain.linearRampToValueAtTime(0.26, 5.75);
  g.gain.setValueAtTime(0.26, 6.9);
  g.gain.linearRampToValueAtTime(0, 7.4);
  o.connect(f);
  f.connect(g);
  g.connect(bus(0.45));
  o.start(5.35);
  o.stop(7.42);
}
// The ground shaking, metal creaking, footfalls.
function riseSounds(m) {
  const { r, bus, noise, tone } = m;
  noise(
    5.2,
    7.5,
    "lowpass",
    115,
    0.8,
    [
      [5.25, 0],
      [5.45, 0.8],
      [6.4, 0.68],
      [7.2, 0.5],
      [7.5, 0],
    ],
    0.1,
  );
  noise(
    5.22,
    5.9,
    "highpass",
    1800,
    0.6,
    [
      [5.26, 0.11],
      [5.62, 0.05],
      [5.88, 0],
    ],
    0.5,
  );
  metalGroan(m);
  for (let i = 0; i < 20; i++) {
    const t = 5.5 + r() * 1.8;
    tone(t, t + 0.09 + r() * 0.13, "square", 360 + r() * 560, 240 + r() * 300, 0.014, 0.01, bus(0.6));
  }
  [
    [5.72, 0.45],
    [6.85, 1],
    [6.87, 0.5],
  ].forEach((a) => {
    tone(a[0], a[0] + 0.5, "sine", 74, 30, a[1] * 0.8, 0.006);
    noise(
      a[0],
      a[0] + 0.26,
      "lowpass",
      620,
      0.7,
      [
        [a[0] + 0.01, a[1] * 0.32],
        [a[0] + 0.25, 0],
      ],
      0.3,
    );
  });
}
function launchSounds({ noise, tone }) {
  const sweep = noise(7.82, 8.3, "bandpass", 700, 0.7, [
    [7.86, 0.04],
    [8.27, 0.34],
    [8.29, 0],
  ]);
  sweep.frequency.exponentialRampToValueAtTime(3000, 8.28);
  tone(7.85, 8.28, "sawtooth", 55, 120, 0.08, 0.1);
  tone(8.28, 9.5, "sine", 90, 24, 0.72, 0.004);
  noise(
    8.28,
    9.8,
    "lowpass",
    2400,
    0.5,
    [
      [8.29, 0.72],
      [8.7, 0.3],
      [9.8, 0],
    ],
    0.4,
  );
  noise(
    8.3,
    10,
    "bandpass",
    1300,
    0.5,
    [
      [8.5, 0.17],
      [9.2, 0.08],
      [10, 0.015],
    ],
    0.5,
  );
}
function scoreAudio(ac) {
  const m = mixer(ac);
  forestBed(m);
  music(m);
  wakeSounds(m);
  riseSounds(m);
  launchSounds(m);
}
function renderScore() {
  const ac = new OfflineAudioContext(2, 48000 * 10, 48000);
  scoreAudio(ac);
  return ac.startRendering();
}
