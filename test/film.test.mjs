// Checks the claims the README makes: self-contained, deterministic pictures, a real score, a working player.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { HTML, openFilm } from "../tools/lib.mjs";

const Q = 0.25; // Small plates keep the suite fast; the drawing code path is the same at any size.
const hashFrame = (page, i) =>
  page
    .evaluate((n) => {
      MOSS.frame(n);
      return MOSS.canvas.toDataURL("image/png");
    }, i)
    .then((u) => createHash("sha1").update(u).digest("hex"));

let film;
before(async () => {
  film = await openFilm();
  await film.page.evaluate((q) => MOSS.prepare(q), Q);
});
after(async () => film.browser.close());

test("the built page embeds no media and loads nothing from the network", () => {
  const html = readFileSync(HTML, "utf8");
  assert.doesNotMatch(html, /data:(image|video|audio)\//);
  assert.doesNotMatch(html, /<(img|video|audio|source|iframe|link)\b/i);
  assert.doesNotMatch(html, /\b(src|href)\s*=\s*["']?https?:/i);
  assert.doesNotMatch(html, /\b(fetch|XMLHttpRequest|WebSocket|importScripts)\b/);
});

test("a frame number always gives the same picture, whatever was drawn before it", async () => {
  const first = await hashFrame(film.page, 172);
  await hashFrame(film.page, 30);
  await hashFrame(film.page, 222);
  assert.equal(await hashFrame(film.page, 172), first);
});

test("a fresh page paints the same picture", async () => {
  const expected = await hashFrame(film.page, 112),
    other = await openFilm();
  await other.page.evaluate((q) => MOSS.prepare(q), Q);
  const actual = await hashFrame(other.page, 112);
  await other.browser.close();
  assert.equal(actual, expected);
});

test("frames across all four shots render without page errors and are not blank", async () => {
  const hashes = new Set();
  for (const i of [20, 100, 160, 205, 230]) hashes.add(await hashFrame(film.page, i));
  assert.equal(hashes.size, 5);
  assert.deepEqual(film.errors, []);
});

test("the score is ten seconds of stereo sound that does not clip", async () => {
  const s = await film.page.evaluate(async () => {
    const b = await renderScore(),
      d = b.getChannelData(0);
    let peak = 0,
      sum = 0;
    for (const v of d) {
      peak = Math.max(peak, Math.abs(v));
      sum += v * v;
    }
    return { seconds: b.duration, channels: b.numberOfChannels, peak, rms: Math.sqrt(sum / d.length) };
  });
  assert.equal(s.seconds, 10);
  assert.equal(s.channels, 2);
  assert.ok(s.rms > 0.01, `rms ${s.rms}`);
  assert.ok(s.peak <= 1, `peak ${s.peak}`);
});

test("the player waits for a click, plays to the end and offers a replay", { timeout: 90_000 }, async () => {
  const { browser, page, errors } = await openFilm("", {
    args: ["--autoplay-policy=no-user-gesture-required"],
  });
  await page.waitForSelector("#go:not([hidden])", { timeout: 60_000 });
  assert.equal(await page.locator("#go").textContent(), "Watch with sound");
  await page.click("#go");
  assert.equal(await page.locator("#veil").isHidden(), true);
  await page.waitForFunction(() => !document.getElementById("veil").hidden, null, { timeout: 30_000 });
  assert.equal(await page.locator("#go").textContent(), "Watch again");
  assert.deepEqual(errors, []);
  await browser.close();
});
