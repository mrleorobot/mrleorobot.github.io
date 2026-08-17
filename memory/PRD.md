# PRD — Portfólio Leonilson Souza

## Problem statement (original)
Elevar a qualidade visual/interativa do portfólio a nível Awwwards. Estética
estritamente monocromática (preto e branco / dark premium). Microinterações
fluidas, scroll moderno, tipografia e grid mais fortes — SEM alterar/inventar
qualquer dado pessoal, histórico, projetos, links ou tecnologias.

## User choices (2026-06)
- Refinamento premium + redesign mais ousado.
- Estritamente P&B, MAS com "revelações coloridas" (colored reveals).
- Manter e refinar o loader cinematográfico.
- Refinar todas as seções.
- Desktop: máximo "efeito uau"; Mobile: foco em fluidez/performance.

## Architecture
- Static site, Vanilla JS + Vite. Root at /app (index.html, style.css, script.js,
  gallery.js, hero-ink.js). Served on :3000 via supervisor (`yarn dev`).
- vite.config.ts: added server/preview host+port+allowedHosts for preview URL.

## Implemented (2026-06)
- Neutralized ALL stray chromatic values (amber/cyan/green/red/violet/teal/slate)
  in style.css + inline HTML to strict grayscale → base is now pure monochrome.
- Fixed a pre-existing broken CSS block (orphan declarations inside a media query).
- Added cohesive polish layer (additive, non-destructive):
  - `polish.css`: refined kinetic gradient section titles, editorial eyebrows with
    animated ticks, monochrome scrollbar/selection, refined nav ink-underline,
    signature CHROMATIC REVEAL (grayscale→colour) on project/design/game/profile
    imagery (hover on desktop, colour-on for touch), custom cursor styling,
    grain/vignette atmosphere, loader glow refinement, mobile-fluid + reduced-motion.
  - `polish.js`: desktop-only custom cursor (dot+ring, blend), magnetic buttons,
    subtle 3D tilt on media cards. Disabled on touch / <1024 / reduced-motion.
- Tightened cinematic loader timing (~3.6s → ~2.9s), same sequence.
- 100% of textual content, links, dates, project data and tech list preserved.

## Verified
- Build passes; no console JS errors; loader dismisses correctly (loader:false).
- All sections render cohesively and monochrome, with intentional colour reveals
  on real project/design/game imagery (captured via headless Chrome).

## Backlog / Next
- P1: desktop hover chromatic-reveal QA on a real pointer device.
- P2: optional page-transition curtain between anchor navigations.
- P2: replace external devicon CDN icons with local monochrome SVG set for offline.
