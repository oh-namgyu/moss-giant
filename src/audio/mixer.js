// Audio building blocks: a compressor and reverb bus, filtered noise, enveloped tones, and WAV export.
function mixer(ac) {
  const sr = ac.sampleRate,
    r = rng(2024),
    noiseBuf = ac.createBuffer(2, sr * 3, sr),
    impulse = ac.createBuffer(2, sr * 2.4, sr);
  for (let c = 0; c < 2; c++) {
    const n = noiseBuf.getChannelData(c);
    for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
    const d = impulse.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / d.length, 3.2);
  }
  const master = ac.createDynamicsCompressor();
  master.threshold.value = -14;
  master.ratio.value = 4;
  const out = ac.createGain();
  out.gain.setValueAtTime(0.74, 0);
  out.gain.setValueAtTime(0.74, 9.5);
  out.gain.linearRampToValueAtTime(0, 10);
  master.connect(out);
  out.connect(ac.destination);
  const reverb = ac.createConvolver(),
    reverbGain = ac.createGain();
  reverb.buffer = impulse;
  reverbGain.gain.value = 0.3;
  reverb.connect(reverbGain);
  reverbGain.connect(master);
  const bus = (wet = 0.3) => {
    const g = ac.createGain(),
      w = ac.createGain();
    g.connect(master);
    w.gain.value = wet;
    g.connect(w);
    w.connect(reverb);
    return g;
  };
  // env is a list of [time, gain] ramps. Returns the filter so a caller can sweep it.
  const noise = (t0, t1, type, freq, q, env, wet = 0.2) => {
    const s = ac.createBufferSource(),
      f = ac.createBiquadFilter(),
      g = ac.createGain();
    s.buffer = noiseBuf;
    s.loop = true;
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    g.gain.setValueAtTime(0, 0);
    env.forEach((e) => g.gain.linearRampToValueAtTime(e[1], e[0]));
    s.connect(f);
    f.connect(g);
    g.connect(bus(wet));
    s.start(t0);
    s.stop(t1);
    return f;
  };
  const tone = (t0, t1, type, f0, f1, amp, attack, dst) => {
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t1);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(amp, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0004, t1);
    o.connect(g);
    g.connect(dst || bus(0.3));
    o.start(t0);
    o.stop(t1 + 0.02);
  };
  return { ac, r, bus, noise, tone };
}
function wavBytes(buf) {
  const n = buf.length,
    ch = buf.numberOfChannels,
    o = new ArrayBuffer(44 + n * ch * 2),
    v = new DataView(o),
    text = (p, s) => {
      for (let i = 0; i < s.length; i++) v.setUint8(p + i, s.charCodeAt(i));
    };
  text(0, "RIFF");
  v.setUint32(4, 36 + n * ch * 2, true);
  text(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, ch, true);
  v.setUint32(24, buf.sampleRate, true);
  v.setUint32(28, buf.sampleRate * ch * 2, true);
  v.setUint16(32, ch * 2, true);
  v.setUint16(34, 16, true);
  text(36, "data");
  v.setUint32(40, n * ch * 2, true);
  const data = [];
  for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
  let p = 44;
  for (let i = 0; i < n; i++)
    for (let c = 0; c < ch; c++) {
      v.setInt16(p, clamp(data[c][i], -1, 1) * 32767, true);
      p += 2;
    }
  return o;
}
