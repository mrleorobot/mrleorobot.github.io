# Contrato visual do portfólio

Este documento registra a decisão editorial vigente: upgrades técnicos devem preservar completamente o visual atual. Qualquer alteração perceptível exige aprovação explícita antes da publicação.

## Invariantes visuais

1. O fundo permanece escuro, monocromático e atmosférico.
2. O loader cinematográfico com estrelas continua aparecendo para quem não solicita redução de movimento.
3. A Hero mantém o nome **LEONILSON** como principal âncora tipográfica, com Canvas, estrelas e animações.
4. Os títulos das seções permanecem em escala próxima à Hero, em caixa alta, com forte peso e presença editorial.
5. A ordem narrativa é: Hero, Trajetória, Projetos, UX/UI Design, Tecnologias, Game Dev, Comunidade, FAQ e Vamos conversar.
6. Cards, imagens, mockups, Pixel Art, microinterações e transições existentes permanecem disponíveis.
7. O rodapé mantém marca à esquerda, citação à direita e copyright centralizado.
8. No mobile, o dock inferior e a rolagem vertical nativa permanecem funcionais.

## Invariantes de comportamento

- O scroll nunca pode permanecer bloqueado depois do loader, de um modal, de `pageshow` ou de uma falha no Canvas.
- Todo bloqueio de rolagem deve passar por `window.PortfolioScrollLock`; nenhum componente deve escrever `body.style.overflow` sem fallback e liberação correspondente.
- Lenis e overlays de case em tela cheia permanecem desativados em dispositivos coarse/touch.
- Regras do menu principal devem usar `nav.nav-motion`. Seletores globais de tag `nav` são proibidos porque também atingem dock e rodapé.
- `prefers-reduced-motion` deve remover movimento sem ocultar conteúdo.
- Elementos acionáveis por clique também precisam funcionar por teclado.

## Cascata CSS

O bundle `portfolio.css` é gerado, nesta ordem exata, a partir de:

1. `style.css`
2. `performance.css`
3. `css/ag-upgrade-2026.css`
4. `polish.css`
5. `awwwards-upgrade.css`
6. `motion.css`
7. `evolution.css`

A ordem é parte do visual. Use `npm run build:css` e `npm run check:css`. Não edite `portfolio.css` diretamente.

## Viewports mínimos de validação

| Perfil | Viewport | Entrada |
| --- | ---: | --- |
| Desktop | 1440 × 900 | Mouse e teclado |
| Mobile | 390 × 844 | Touch |
| Mobile compacto | 360 × 800 | Touch |
| Desktop largo | 1920 × 1080 | Mouse e teclado |

## Checklist antes de publicar

- Loader aparece e libera o scroll.
- Hero, estrelas e Canvas carregam.
- Títulos editoriais continuam grandes.
- Todas as nove seções mantêm a ordem.
- Nenhuma imagem local está quebrada.
- Mobile rola verticalmente sem travar.
- Rodapé não recebe estilos do menu superior.
- Copyright permanece centralizado.
- `npm run check:css` e `npm run qa` passam.
