# Leonilson Souza — Portfólio

Portfólio profissional de Leonilson Souza, Desenvolvedor Front-end e Designer de Interfaces, publicado em [mrleorobot.github.io](https://mrleorobot.github.io/).

A experiência atual é intencional: atmosfera cinematográfica, fundo escuro, loader estrelado, Hero tipográfica, títulos editoriais em grande escala, movimento e uma narrativa em nove capítulos. Alterações técnicas devem preservar esse contrato visual.

## Stack real

O site é estático e não depende de framework em produção:

- HTML semântico;
- CSS responsivo;
- JavaScript modular;
- Canvas 2D para o loader e a Hero;
- Lenis apenas em dispositivos compatíveis;
- PWA com service worker e fallback offline;
- GitHub Pages.

Os frameworks citados nos cards pertencem aos projetos apresentados, não à implementação deste portfólio.

## Estrutura

| Caminho | Responsabilidade |
| --- | --- |
| `index.html` | Conteúdo, semântica, metadados e estrutura da página |
| `portfolio.css` | Bundle CSS servido em produção |
| `style.css` e demais camadas CSS | Fontes editáveis do bundle, na ordem documentada |
| `app.js` | Entrada única dos módulos JavaScript servidos pelo site |
| `script.js` | Loader, interações, modais e comportamento principal |
| `hero-ink.js` | Canvas e atmosfera da Hero |
| `projects.json` | Fonte dos seis cases selecionados e verificados |
| `manifest.json`, `sw.js`, `offline.html` | Instalação e funcionamento offline |
| `qa/` | Testes reais em Chromium desktop e mobile |
| `docs/` | Contrato visual, conteúdo e modelo de case |

## Desenvolvimento local

Requer Node.js 20 ou mais recente e Python 3 para o servidor estático.

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Abra `http://127.0.0.1:4173`.

## CSS

O HTML carrega um único arquivo CSS para reduzir requisições, mas as camadas originais continuam separadas para manutenção. Não edite `portfolio.css` manualmente.

```bash
npm run build:css
npm run check:css
```

Os cases do HTML e o Schema.org são gerados da mesma fonte, evitando divergências:

```bash
npm run sync:projects
```

A ordem de composição é preservada para que a cascata e o visual não mudem.

## QA desktop e mobile

```bash
npm run qa:install
npm run qa
```

A suíte verifica ordem e presença das seções, escala tipográfica, loader, rolagem desktop/mobile, imagens, links, IDs únicos, navegação por teclado, copyright, erros JavaScript e respostas locais. Também gera capturas completas para inspeção visual.

O workflow `Portfolio QA` executa esses testes em cada push e pull request para `main`.

## Conteúdo e credibilidade

`projects.json`, os cards e o Schema.org descrevem apenas funcionalidades observáveis e links públicos. Métricas só podem entrar no site quando houver evidência documentada, seguindo [docs/CONTENT-VERIFICATION.md](docs/CONTENT-VERIFICATION.md).

O currículo é gerado de uma fonte versionada e validado em A4:

```bash
npm run build:cv
```

## Regras de manutenção

Leia [docs/VISUAL-CONTRACT.md](docs/VISUAL-CONTRACT.md) antes de mudar CSS, layout, animações, navegação ou comportamento de scroll.
