// Opens the built film in a headless browser. Set CHROME to use an existing browser binary.
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

export const HTML = resolve("dist/moss-giant.html");

export async function openFilm(hash = "#capture", launch = {}) {
  if (!existsSync(HTML)) throw new Error("dist/moss-giant.html is missing. Run: npm run build");
  const options = process.env.CHROME ? { executablePath: process.env.CHROME, ...launch } : launch;
  const browser = await chromium.launch(options);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(`file://${HTML}${hash}`);
  return { browser, page, errors };
}

export function saveDataUrl(path, url) {
  writeFileSync(path, Buffer.from(url.split(",")[1], "base64"));
}
