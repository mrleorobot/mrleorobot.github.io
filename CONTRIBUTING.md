# Contribuindo

## Fluxo recomendado

1. Leia `docs/VISUAL-CONTRACT.md`.
2. Faça mudanças nas fontes, nunca diretamente no bundle `portfolio.css`.
3. Se alterar CSS, execute `npm run build:css`.
4. Execute `npm run check:css`.
5. Instale a suíte uma vez com `npm run qa:install`.
6. Execute `npm run qa`.
7. Revise as capturas em `test-results` antes de publicar.

## Regras de segurança visual

- Não mudar layout, cor, tipografia, escala, imagem ou animação sem aprovação explícita.
- Não criar seletores globais de `nav`.
- Não bloquear scroll fora de `PortfolioScrollLock`.
- Não remover loader, estrelas, Canvas, dock mobile ou títulos editoriais.
- Não editar texto factual ou métricas sem evidência registrada.

## Conteúdo

Para um novo projeto, atualize o card e o feed `projects.json` com a mesma informação. Use `docs/CASE-STUDY-TEMPLATE.md` e verifique números em `docs/CONTENT-VERIFICATION.md`.
