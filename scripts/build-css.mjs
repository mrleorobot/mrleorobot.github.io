import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = resolve(scriptDirectory, "..");
const sourceFiles = [
  "style.css",
  "performance.css",
  "css/ag-upgrade-2026.css",
  "polish.css",
  "awwwards-upgrade.css",
  "motion.css",
  "evolution.css",
  "layout-polish.css"
];
const outputFile = resolve(root, "portfolio.css");
const banner = "/* =========================================================\n   PORTFOLIO.CSS — GENERATED FILE\n   Visual contract: source order is preserved byte-for-byte\n   inside each section. Run: npm run build:css\n   ========================================================= */\n";
const sections = [];

for (const file of sourceFiles) {
  const content = await readFile(resolve(root, file), "utf8");
  sections.push(`\n/* ===== SOURCE: ${file} ===== */\n${content.trim()}\n`);
}

const generated = banner + sections.join("");
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const current = await readFile(outputFile, "utf8");
  if (current !== generated) {
    console.error("portfolio.css is out of date. Run: npm run build:css");
    process.exit(1);
  }
  console.log("portfolio.css matches all source stylesheets.");
} else {
  await writeFile(outputFile, generated, "utf8");
  console.log(`Generated portfolio.css from ${sourceFiles.length} sources.`);
}
