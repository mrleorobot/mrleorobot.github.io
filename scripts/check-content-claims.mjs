import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const stripHtml = (source) => source
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&nbsp;", " ")
  .replaceAll("&amp;", "&")
  .replace(/\s+/g, " ");

const cvSource = (await readFile(resolve(root, "scripts/build-cv.py"), "utf8"))
  .replaceAll('width="100%"', "");

const sources = [
  ["index.html", stripHtml(await readFile(resolve(root, "index.html"), "utf8"))],
  ["cases/dashboard-inventario.html", stripHtml(await readFile(resolve(root, "cases/dashboard-inventario.html"), "utf8"))],
  ["projects.json", await readFile(resolve(root, "projects.json"), "utf8")],
  ["scripts/build-cv.py", cvSource],
];

const forbiddenClaims = [
  ["porcentagem promocional", /\b\d+(?:[.,]\d+)?\s*%/i],
  ["quantidade promocional com sinal de mais", /\b\d+(?:[.,]\d+)?\s*\+/i],
  ["volume vago", /\bmais de\s+\d+/i],
  ["usuários ativos", /\busuários ativos\b/i],
  ["taxa de conversão", /\btaxa de conversão\b/i],
  ["aumento não documentado", /\baumentou em\b/i],
  ["redução não documentada", /\breduziu em\b/i],
  ["volume de clientes", /\bclientes atendidos\b/i],
  ["volume de downloads", /\bdownloads realizados\b/i],
];

const failures = [];
for (const [file, content] of sources) {
  for (const [label, pattern] of forbiddenClaims) {
    const match = content.match(pattern);
    if (match) failures.push(`${file}: ${label} (${match[0]})`);
  }
}

if (failures.length) {
  console.error("Afirmações quantitativas sem evidência encontradas:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Conteúdo verificado em ${sources.length} fontes: nenhuma métrica promocional sem evidência.`);
