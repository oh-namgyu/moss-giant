// Saves full-size stills for close inspection. Usage: node tools/still.mjs 112 172
import * as fs from "node:fs";
import { openFilm, saveDataUrl } from "./lib.mjs";

const { browser, page, errors } = await openFilm();
await page.evaluate(() => MOSS.prepare(1));
fs.mkdirSync("out", { recursive: true });
for (const f of process.argv.slice(2).map(Number)) {
  const url = await page.evaluate((n) => {
    MOSS.frame(n);
    return MOSS.canvas.toDataURL("image/jpeg", 0.92);
  }, f);
  saveDataUrl(`out/f${f}.jpg`, url);
  console.log(`out/f${f}.jpg`);
}
await browser.close();
if (errors.length) throw new Error(`page errors: ${errors.join("; ")}`);
