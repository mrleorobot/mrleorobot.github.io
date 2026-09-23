# Refinamento visual — setembro de 2026

Esta revisão continua o PR editorial existente. A referência é o portfólio principal em `mrleorobot.github.io`, com identidade preta, estrelas, aurora monocromática e imagens dos trabalhos em suas cores originais.

## Problema observado

Na página publicada, o movimento era aplicado a seções inteiras. A escala deixava margens nas laterais e fazia o fundo parecer um conjunto de painéis. No celular, um controlador também reduzia brilho e opacidade conforme a área visível da seção. A sobreposição de luzes no hero e o espaço vertical entre conteúdos diminuíam a clareza da composição.

## Ajustes desta etapa

- Seções ocupam a largura completa e permanecem estáveis durante a rolagem. Entradas e interações continuam nos elementos internos. O controlador de escala e escurecimento foi removido.
- A aurora usa luz difusa, sem bordas fechadas, com menor intensidade atrás da leitura. Linhas divisórias acompanham a largura do conteúdo.
- O hero, a trajetória e os intervalos entre seções ficaram mais compactos, mantendo títulos grandes e datas completas.
- Projetos principais permanecem em duas colunas no desktop. As seis peças de design usam três colunas a partir de 1101 px, duas em telas intermediárias e galeria horizontal no celular.
- Links, projetos, imagens, depoimentos, currículo e canais de contato foram preservados. A localização foi padronizada para “Natal, RN”.
- A versão do service worker e das referências de assets foi atualizada para evitar misturar arquivos de revisões diferentes.

## Implementação

O refinamento visual está em `visual-polish.css`, dentro da cascata existente. `portfolio.css` continua sendo gerado por `npm run build:css`. A retirada dos controladores antigos ocorre em `script.js` e `evolution.js`. Não há nova biblioteca ou imagem nesta etapa.

A aplicação continua estática e compatível com GitHub Pages. A Vercel ligada ao repositório gera uma prévia do PR; essa prévia exige login e não substitui a publicação principal.

## Verificação

- Bundle CSS, sintaxe JavaScript, conteúdo factual e `git diff --check`: aprovados.
- Comparação com o início da etapa: os mesmos 18 elementos de imagem e 46 links no HTML, na mesma ordem.
- A suíte responsiva verifica 360, 390, 430, 768, 1440 e 1920 px e a orientação horizontal de 844 × 390 px.
- A regressão acrescentada verifica que, com movimento ativo, as seções não encolhem, não escurecem e continuam alinhadas às bordas da página.
- A regra de estabilidade tem prioridade sobre as classes antigas de entrada; a regressão verifica a seção antes e depois de entrar na tela.
- O resultado atualizado da execução em Chromium, Firefox e WebKit fica registrado em [Portfolio QA](https://github.com/mrleorobot/mrleorobot.github.io/actions/workflows/portfolio-qa.yml) e no PR de revisão.

A publicação principal permanece pendente da aprovação visual exigida pelo contrato do repositório.
