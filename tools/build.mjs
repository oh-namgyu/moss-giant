// Concatenates src/ into one self-contained HTML file. Order matters only for top-level constants.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ORDER = [
  "core",
  "brush",
  "filters",
  "scenery/sky",
  "scenery/forest",
  "scenery/clearing",
  "robot/ink",
  "robot/weathering",
  "robot/pose",
  "robot/parts-body",
  "robot/parts-head",
  "robot/parts-limbs",
  "robot/draw",
  "critters",
  "fx/sprites",
  "fx/particles",
  "fx/effects",
  "film/timeline",
  "film/stage",
  "film/render",
  "audio/mixer",
  "audio/score",
  "main",
];
const js = ORDER.map((name) => readFileSync(`src/${name}.js`, "utf8")).join("\n");
const html = readFileSync("src/shell.html", "utf8").replace("/*__JS__*/", () => js);
mkdirSync("dist", { recursive: true });
writeFileSync("dist/moss-giant.html", html);
console.log(`dist/moss-giant.html: ${html.length} bytes`);
