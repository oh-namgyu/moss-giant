// Whole-layer finishing passes that make separately drawn marks read as one painted surface.
// Kuwahara filter: flattens detail the way a loaded brush does. Runs once per plate after painting.
function kuwahara(c, rad0) {
  const rad = Math.max(1, Math.round(rad0 * Q)),
    w = c.width,
    h = c.height,
    T = 384,
    g = c.getContext("2d", { willReadFrequently: true }),
    img = g.getImageData(0, 0, w, h),
    D = img.data,
    O = new Uint8ClampedArray(D.length);
  const tw = T + 2 * rad + 1,
    I = [0, 1, 2, 3, 4, 5].map(() => new Float64Array((tw + 1) * (tw + 1)));
  for (let ty = 0; ty < h; ty += T)
    for (let tx = 0; tx < w; tx += T) {
      const x0 = Math.max(0, tx - rad),
        y0 = Math.max(0, ty - rad),
        x1 = Math.min(w, tx + T + rad),
        y1 = Math.min(h, ty + T + rad),
        tw2 = x1 - x0,
        th = y1 - y0,
        st = tw2 + 1;
      for (let k = 0; k < 6; k++) I[k].fill(0, 0, st);
      for (let y = 0; y < th; y++) {
        const s = [0, 0, 0, 0, 0, 0];
        for (let k = 0; k < 6; k++) I[k][(y + 1) * st] = 0;
        for (let x = 0; x < tw2; x++) {
          const i = ((y + y0) * w + x + x0) * 4,
            a = D[i + 3] / 255,
            R = D[i] * a,
            G = D[i + 1] * a,
            B = D[i + 2] * a,
            l = 0.3 * R + 0.59 * G + 0.11 * B,
            v = [R, G, B, D[i + 3], l, l * l];
          for (let k = 0; k < 6; k++) {
            s[k] += v[k];
            I[k][(y + 1) * st + x + 1] = I[k][y * st + x + 1] + s[k];
          }
        }
      }
      const sum = (k, a, b, cc, d) => {
        const A = I[k];
        return A[d * st + cc] - A[b * st + cc] - A[d * st + a] + A[b * st + a];
      };
      for (let y = ty; y < Math.min(h, ty + T); y++)
        for (let x = tx; x < Math.min(w, tx + T); x++) {
          const lx = x - x0,
            ly = y - y0;
          let best = 1e18,
            ba = 0,
            bb = 0,
            bc = 0,
            bd = 0,
            bar = 1;
          const q = [
            [lx - rad, ly - rad, lx + 1, ly + 1],
            [lx, ly - rad, lx + rad + 1, ly + 1],
            [lx - rad, ly, lx + 1, ly + rad + 1],
            [lx, ly, lx + rad + 1, ly + rad + 1],
          ];
          for (let n = 0; n < 4; n++) {
            const a = Math.max(0, q[n][0]),
              b = Math.max(0, q[n][1]),
              cc = Math.min(tw2, q[n][2]),
              d = Math.min(th, q[n][3]),
              ar = (cc - a) * (d - b),
              m = sum(4, a, b, cc, d) / ar,
              va = sum(5, a, b, cc, d) / ar - m * m;
            if (va < best) {
              best = va;
              ba = a;
              bb = b;
              bc = cc;
              bd = d;
              bar = ar;
            }
          }
          const i = (y * w + x) * 4,
            al = sum(3, ba, bb, bc, bd) / bar,
            na = al / 255 || 1;
          O[i] = sum(0, ba, bb, bc, bd) / bar / na;
          O[i + 1] = sum(1, ba, bb, bc, bd) / bar / na;
          O[i + 2] = sum(2, ba, bb, bc, bd) / bar / na;
          O[i + 3] = al;
        }
    }
  img.data.set(O);
  g.putImageData(img, 0, 0);
}
function pigment(c, amt, seed = 1) {
  const g = c.getContext("2d", { willReadFrequently: true }),
    w = c.width,
    h = c.height,
    img = g.getImageData(0, 0, w, h),
    D = img.data;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!D[i + 3]) continue;
      const n =
          (fbm(x * 0.012 + seed, y * 0.012, 3) - 0.5) * 1.5 +
          (vnoise(x * 0.09 + seed, y * 0.32) - 0.5) * 0.9 +
          (hash2(x + seed, y) - 0.5) * 0.5,
        k = 1 + n * amt;
      D[i] *= k;
      D[i + 1] *= k;
      D[i + 2] *= k;
    }
  g.putImageData(img, 0, 0);
}
