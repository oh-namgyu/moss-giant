// Renders every frame and the score, then encodes out/moss-giant.mp4 with ffmpeg.
// Usage: node tools/render.mjs [--limit 24] [--quality 1]   (set FFMPEG to choose the binary)
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import { parseArgs } from "node:util";
import { openFilm, saveDataUrl } from "./lib.mjs";

const { values } = parseArgs({
  options: { limit: { type: "string" }, quality: { type: "string", default: "1" } },
});
const { browser, page, errors } = await openFilm();
const { fps, total } = await page.evaluate((q) => {
  MOSS.prepare(q);
  return { fps: MOSS.FPS, total: MOSS.FRAMES };
}, Number(values.quality));
const count = Math.min(total, Number(values.limit ?? total));

fs.rmSync("out/frames", { recursive: true, force: true });
fs.mkdirSync("out/frames", { recursive: true });
for (let i = 0; i < count; i++) {
  const url = await page.evaluate((n) => {
    MOSS.frame(n);
    return MOSS.canvas.toDataURL("image/jpeg", 0.97);
  }, i);
  saveDataUrl(`out/frames/${String(i).padStart(4, "0")}.jpg`, url);
  if (i % 60 === 0) console.log(`frame ${i}/${count}`);
}
fs.writeFileSync("out/score.wav", Buffer.from(await page.evaluate(() => MOSS.wavB64()), "base64"));
await browser.close();
if (errors.length) throw new Error(`page errors: ${errors.join("; ")}`);

execFileSync(process.env.FFMPEG ?? "ffmpeg", [
  "-y",
  "-hide_banner",
  "-loglevel",
  "error",
  "-framerate",
  String(fps),
  "-i",
  "out/frames/%04d.jpg",
  "-i",
  "out/score.wav",
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "19",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-shortest",
  "-movflags",
  "+faststart",
  "out/moss-giant.mp4",
]);
console.log("out/moss-giant.mp4");
