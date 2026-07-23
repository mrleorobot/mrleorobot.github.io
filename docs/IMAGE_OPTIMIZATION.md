# Guia de Otimização de Imagens - Portfólio Leonilson

## 📊 Análise Atual de Imagens

As imagens mockup atualmente ocupam **~357KB** do tamanho total. Com as estratégias abaixo, você pode reduzir para **~70-80KB** (75%+ de redução).

---

## 🎯 Estratégias de Otimização

### 1. **Converter para WebP (Ganho: 30-50%)**

WebP é 25-35% menor que PNG/JPG com qualidade equivalente.

#### Opção A: Usando ImageMagick (CLI)
```bash
# Instalar ImageMagick
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: https://imagemagick.org/script/download.php

# Converter PNG para WebP
magick convert placeholder-dashboard.png -quality 80 placeholder-dashboard.webp

# Batch convert all PNGs
for file in *.png; do
  magick convert "$file" -quality 80 "${file%.png}.webp"
done
```

#### Opção B: Usando ffmpeg
```bash
# Converter para WebP
ffmpeg -i placeholder-dashboard.png -c:v libwebp -quality 80 placeholder-dashboard.webp
```

#### Opção C: Online (sem instalar)
- https://convertio.co/png-webp/
- https://ezgif.com/png-to-webp
- https://cloudconvert.com/

---

### 2. **Compressar Agressivamente**

#### Usando TinyPNG/TinyJPG (Recomendado)
```bash
# 1. Acesse: https://tinypng.com/
# 2. Faça upload de todos os mockups (máx 20 por vez)
# 3. Ganho: ~40-60% de redução sem perda visível
# 4. Download compactados
```

#### Usando ImageOptim (macOS)
```bash
# Instalar
brew install imageoptim

# Comprimir todos os arquivos em pasta
imageoptim /path/to/mockups/
```

#### Usando OptiPNG (Multiplataforma)
```bash
# Instalar
brew install optipng  # macOS
sudo apt-get install optipng  # Ubuntu

# Comprimir PNG
optipng -o2 -zc9 -zm8 -zs0 -f0-5 placeholder-dashboard.png

# Batch
for file in *.png; do
  optipng -o2 -zc9 -zm8 -zs0 -f0-5 "$file"
done
```

---

### 3. **Script Automático de Otimização**

Crie um arquivo `optimize-images.sh` na raiz:

```bash
#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖼️  Iniciando otimização de imagens...${NC}"

# Diretório de imagens
IMAGE_DIR="public/mockups"
mkdir -p "$IMAGE_DIR"

# 1. Converter PNG para WebP (se disponível)
if command -v cwebp &> /dev/null; then
  echo -e "${BLUE}→ Convertendo PNG para WebP...${NC}"
  for file in $IMAGE_DIR/*.png; do
    if [ -f "$file" ]; then
      cwebp "$file" -q 80 -o "${file%.png}.webp"
      echo -e "${GREEN}✓ ${file%.png}.webp${NC}"
    fi
  done
else
  echo "⚠️  cwebp não instalado. Pulando conversão WebP."
fi

# 2. Comprimir PNGs com optipng
if command -v optipng &> /dev/null; then
  echo -e "${BLUE}→ Comprimindo PNG com OptiPNG...${NC}"
  for file in $IMAGE_DIR/*.png; do
    if [ -f "$file" ]; then
      optipng -o2 -zc9 -zm8 -zs0 -f0-5 "$file"
      echo -e "${GREEN}✓ Comprimido: $(basename $file)${NC}"
    fi
  done
else
  echo "⚠️  optipng não instalado. Pulando compressão PNG."
fi

# 3. Gerar relatório de tamanho
echo ""
echo -e "${BLUE}📊 Relatório de Tamanho:${NC}"
echo ""
echo "PNG:"
du -sh $IMAGE_DIR/*.png 2>/dev/null | awk '{print "  " $1}'
echo ""
echo "WebP:"
du -sh $IMAGE_DIR/*.webp 2>/dev/null | awk '{print "  " $1}'
echo ""
echo "Total:"
du -sh $IMAGE_DIR | awk '{print "  " $1}'
echo ""
echo -e "${GREEN}✓ Otimização concluída!${NC}"
```

**Usar:**
```bash
chmod +x optimize-images.sh
./optimize-images.sh
```

---

### 4. **Integração no React - Lazy Loading & WebP**

Crie um componente `<OptimizedImage />` em `src/components/OptimizedImage.jsx`:

```jsx
import { useState, useEffect, useRef } from 'react'

const OptimizedImage = ({ 
  src, 
  webpSrc, 
  alt, 
  className = '', 
  lazy = true 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!lazy) {
      setIsLoaded(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy])

  return (
    <picture ref={imgRef}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <source srcSet={src} type={`image/${src.split('.').pop()}`} />
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
    </picture>
  )
}

export default OptimizedImage
```

**Usar em componentes:**
```jsx
import OptimizedImage from '../OptimizedImage'

<OptimizedImage
  src="/images/placeholder-dashboard.png"
  webpSrc="/images/placeholder-dashboard.webp"
  alt="Dashboard de Gestão"
  className="w-full rounded-lg"
  lazy={true}
/>
```

---

## 📈 Resultados Esperados

| Formato | Tamanho Original | Após Otimização | Redução |
|---------|-----------------|-----------------|----------|
| PNG     | 50-70KB         | 15-25KB         | 60-70%   |
| WebP    | -               | 10-15KB         | 75-80%   |
| **Total**| **357KB**       | **80-100KB**    | **70-75%** |

---

## 🚀 Próximos Passos

1. **Download de ferramentas:**
   ```bash
   brew install optipng cwebp  # macOS
   sudo apt-get install optipng webp  # Ubuntu
   ```

2. **Organizar imagens:**
   ```bash
   mkdir -p public/mockups
   mv *.png public/mockups/
   ```

3. **Rodar otimização:**
   ```bash
   ./optimize-images.sh
   ```

4. **Adicionar ao Git:**
   ```bash
   git add public/mockups/
   git commit -m "feat: optimize mockup images (70% reduction)"
   ```

5. **Atualizar componentes React** para usar `<OptimizedImage />`

---

## 📝 Checklist de Otimização

- [ ] Converter todas as imagens para WebP
- [ ] Comprimir com OptiPNG/TinyPNG
- [ ] Implementar lazy loading
- [ ] Usar `<picture>` element para fallback
- [ ] Adicionar alt text para acessibilidade
- [ ] Testar com DevTools (Network tab)
- [ ] Verificar Core Web Vitals (LCP)
- [ ] Minificar CSS/JS adicionalmente

---

## 🔍 Ferramentas de Validação

- **PageSpeed Insights:** https://pagespeed.web.dev/
- **WebPageTest:** https://www.webpagetest.org/
- **Lighthouse:** DevTools do Chrome (F12 → Lighthouse)
- **Image Compression Stats:** `ls -lh public/mockups/`

