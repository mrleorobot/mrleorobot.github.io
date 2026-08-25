#!/usr/bin/env node
/**
 * Tira screenshot da hero (viewport 1280x800) de cada projeto Vercel.
 * Salva como ./screenshots/nome.jpg na pasta do projeto.
 * 
 * Uso:
 *   npx puppeteer browsers install chrome   (só na primeira vez)
 *   node take-screenshots.mjs
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const PROJECTS = [
  { name: "one-thing-alive",       url: "https://one-thing-alive.vercel.app/" },
  { name: "komorebi",              url: "https://komorebi-gray.vercel.app/" },
  { name: "memory-archive",        url: "https://memory-archive-project.vercel.app/" },
  { name: "hanamori",              url: "https://hanamori.vercel.app/" },
  { name: "aurvm",                 url: "https://haute-luxe-glow.vercel.app/" },
  { name: "ledgeriq",              url: "https://find-seven-psi.vercel.app/" },
  { name: "mentor-estagio",        url: "https://estagio-steel.vercel.app/" },
  { name: "develite",              url: "https://develite-lemon.vercel.app/" },
  { name: "memoire",               url: "https://memoire-nine-psi.vercel.app/" },
  { name: "nocturne-studio",       url: "https://cozy-night-studio-landing.vercel.app/" },
];

const DIR = "./screenshots";

async function main() {
  if (!existsSync(DIR)) await mkdir(DIR);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const { name, url } of PROJECTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });

    try {
      console.log(`📸 ${name}...`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
      // Espera animações de entrada
      await new Promise(r => setTimeout(r, 2500));

      const path = `${DIR}/${name}.jpg`;
      await page.screenshot({
        path,
        type: "jpeg",
        quality: 82,
        clip: { x: 0, y: 0, width: 1280 * 1.5, height: 800 * 1.5 },
      });
      console.log(`  ✓ Salvo: ${path}`);
    } catch (e) {
      console.log(`  ✗ Erro: ${e.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log("\n✅ Pronto! Screenshots em ./screenshots/");
}

main();
