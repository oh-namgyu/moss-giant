// Draws a contact sheet: many frames on one image, the fastest way to judge a whole cut.
// Usage: node tools/sheet.mjs [--every 10] [--cols 6] [--quality 0.5] [--out out/sheet.jpg] [frame ...]
import * as fs from "node:fs";
import { dirname } from "node:path";
import { parseArgs } from "node:util";
import { openFilm, saveDataUrl } from "./lib.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    every: { type: "string", default: "10" },
    cols: { type: "string", default: "6" },
    quality: { type: "string", default: "0.5" },
    out: { type: "string", default: "out/sheet.jpg" },
  },
});
const { browser, page, errors } = await openFilm();
const url = await page.evaluate(
  ({ q, every, cols, picked }) => {
    MOSS.prepare(q);
    const frames = picked.length ? picked : [];
    if (!frames.length) for (let i = 4; i < MOSS.FRAMES; i += every) frames.push(i);
    const w = 480,
      h = 270,
      sheet = document.createElement("canvas");
    sheet.width = cols * w;
    sheet.height = Math.ceil(frames.length / cols) * h;
    const g = sheet.getContext("2d");
    frames.forEach((f, k) => {
      MOSS.frame(f);
      g.drawImage(MOSS.canvas, (k % cols) * w, Math.floor(k / cols) * h, w, h);
    });
    return sheet.toDataURL("image/jpeg", 0.88);
  },
  {
    q: Number(values.quality),
    every: Number(values.every),
    cols: Number(values.cols),
    picked: positionals.map(Number),
  },
);
await browser.close();
if (errors.length) throw new Error(`page errors: ${errors.join("; ")}`);
fs.mkdirSync(dirname(values.out), { recursive: true });
saveDataUrl(values.out, url);
console.log(values.out);
