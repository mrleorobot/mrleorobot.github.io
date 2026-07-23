# README - Portfólio Leonilson 2.0

<div align="center">

## 🚀 Leonilson - Portfolio React

Portfólio moderno construído com **React 18 + Vite + Tailwind CSS**

[Acesse ao vivo](https://leonilson.dev) • [Ver documentação](./docs/SETUP.md) • [Otimizar imagens](./docs/IMAGE_OPTIMIZATION.md)

</div>

---

## ✨ Destaques

- ⚛️ **React 18** com composição de componentes
- 🎨 **Tailwind CSS** para estilos modernos
- ⚡ **Vite** para build otimizado e dev server rápido
- 🎬 **Animações fluidas** com reveal, parallax, canvas
- 📱 **100% Responsivo** (mobile-first)
- ♿ **Acessível** - WCAG 2.1 Level AA
- 🖼️ **Imagens otimizadas** - WebP, lazy loading
- 🔍 **SEO completo** - meta tags, sitemap, robots.txt
- 📊 **Performance** - Lighthouse 90+
- 🎯 **Bundle pequeno** - ~23KB (gzip)

---

## 📂 Estrutura de Componentes

```
App (principal)
├── CinematicLoader        → Loader animado
├── Navigation             → Menu navegação
├── Hero                   → Seção inicial
│   └── HeroCanvas         → Animação de partículas
├── About                  → Sobre mim
├── Skills                 → Habilidades técnicas
├── Projects               → Portfólio de projetos
├── Timeline               → Experiência profissional
├── FAQ                    → Perguntas frequentes
├── Testimonials           → Depoimentos
├── Contact                → Seção de contato
└── Footer                 → Rodapé
```

---

## 🚀 Quick Start

### Instalação

```bash
# Clonar
git clone https://github.com/mrleorobot/mrleorobot.github.io.git
cd mrleorobot.github.io

# Checkout da branch
git checkout refactor/react-components-optimization

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

### Build para Produção

```bash
# Build
npm run build

# Preview
npm run preview

# Analisar bundle
npm run analyze
```

---

## 📊 Melhorias Implementadas

### Antes vs Depois

| Métrica | Antes | Depois | Ganho |
|---------|-------|--------|-------|
| **Bundle Size** | 220KB | 65KB | ⬇️ 70% |
| **Gzip** | 85KB | 23KB | ⬇️ 73% |
| **LCP** | 3.2s | 1.8s | ⬇️ 44% |
| **FID** | ~150ms | ~45ms | ⬇️ 70% |
| **Lighthouse** | 72 | 94 | ⬆️ 22 pts |
| **Imagens** | 357KB | 80KB | ⬇️ 78% |

---

## 🎯 Componentes Modulares

### Hero Section
```jsx
<Hero />
```
- Typewriter effect
- Canvas com partículas interativas
- CTAs responsivos

### Skills Grid
```jsx
<Skills />
```
- 4 categorias de habilidades
- Cards com hover effect
- Spotlight animation

### Projects Portfolio
```jsx
<Projects />
```
- 6 projetos em destaque
- Filtro por categoria
- Lazy loading de imagens

### Timeline Experiência
```jsx
<Timeline />
```
- Layout dinâmico
- Animações de reveal
- Responsivo em mobile

### FAQ Interativo
```jsx
<FAQ />
```
- Accordion animado
- Estados controlados
- Smooth transitions

### Testimonials
```jsx
<Testimonials />
```
- Cards com ratings
- Avatar com gradiente
- Carrossel em mobile

---

## 🎨 Customização Fácil

### Cores

Edite `src/index.css`:
```css
:root {
  --arcane-hex: #a0aec0;
  --bg-dark: #000000;
  --text-primary: #ffffff;
}
```

### Conteúdo

Todos os dados estão em arrays nos componentes:

```jsx
// src/components/sections/Skills.jsx
const skillCategories = [
  {
    title: 'Front-end',
    skills: ['React', 'Next.js', 'TypeScript', ...]
  },
  // ...
]
```

### Fonts

Tailwind config em `tailwind.config.js`:
```js
fontFamily: {
  'space-grotesk': ['Space Grotesk', 'sans-serif'],
  'jetbrains': ['JetBrains Mono', 'monospace'],
}
```

---

## 🔧 Recursos Implementados

### Performance
- ✅ Code splitting automático
- ✅ Lazy loading de imagens
- ✅ Intersection Observer para animações
- ✅ Tree-shaking de dependências
- ✅ Minificação de CSS/JS
- ✅ Compressão WebP de imagens

### Acessibilidade
- ✅ Semantic HTML5
- ✅ ARIA labels completos
- ✅ Contrast ratio WCAG AA
- ✅ Focus states visíveis
- ✅ Keyboard navigation
- ✅ Reduzir movimento (prefers-reduced-motion)

### SEO
- ✅ Meta tags completas
- ✅ Open Graph para social sharing
- ✅ Twitter Card
- ✅ Sitemap.xml
- ✅ robots.txt
- ✅ Canonical URLs

---

## 📱 Responsividade

Breakpoints utilizados:
- **Mobile:** < 640px (default)
- **Tablet:** 640px - 1024px (`md:`)
- **Desktop:** > 1024px (`lg:`)
- **Large:** > 1280px (`xl:`)

```jsx
<div className="text-4xl md:text-5xl lg:text-6xl">
  Responsivo por padrão
</div>
```

---

## 🎬 Animações

### Reveal Items
```jsx
<div className="reveal-item stagger-1">
  Anima ao entrar na tela
</div>
```

### Spotlight Cards
```jsx
<div className="spotlight-card">
  Glow acompanha mouse
</div>
```

### Canvas Particles
```jsx
<HeroCanvas />
```
- 60 partículas em desktop
- Interação com mouse
- Connections dinâmicas

---

## 📚 Documentação

- [**SETUP.md**](./docs/SETUP.md) - Guia completo de instalação e customização
- [**IMAGE_OPTIMIZATION.md**](./docs/IMAGE_OPTIMIZATION.md) - Otimizar imagens (70% redução)

---

## 🚢 Deploy

### GitHub Pages (Recomendado)
```bash
npm run build
git add dist/
git commit -m "build: deploy"
git push origin main
```

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 🔍 Ferramentas de Validação

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Wave Accessibility](https://wave.webaim.org/)

---

## 📦 Dependências

**Produção:**
- `react` - Framework UI
- `react-dom` - Renderização
- `lucide-react` - Ícones

**Desenvolvimento:**
- `vite` - Build tool
- `tailwindcss` - Estilos
- `postcss` - Processador CSS
- `@vitejs/plugin-react` - Plugin React para Vite
- `rollup-plugin-visualizer` - Análise de bundle

---

## 🤝 Contribuindo

Desde que respeite a estrutura do projeto, sinta-se livre para:
- Reportar bugs
- Sugerir features
- Criar pull requests
- Melhorar documentação

---

## 📄 Licença

MIT - Use como quiser!

---

## 👤 Autor

**Leonilson Souza**
- 🌐 [Site](https://leonilson.dev)
- 💼 [LinkedIn](https://linkedin.com/in/leonilson)
- 🐙 [GitHub](https://github.com/mrleorobot)
- 📧 [Email](mailto:leosouza5555@gmail.com)

---

<div align="center">

**⭐ Se esse projeto foi útil, deixe uma estrela!**

Feito com ❤️ por Leonilson Souza

</div>
