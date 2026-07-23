#!/bin/bash

# Script para otimizar imagens do portfólio
# Reduz tamanho de imagens PNG/JPG em ~70-75%

set -e

# Cores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}🖼️  Image Optimization Tool${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Verificar se estamos no diretório certo
if [ ! -d "public" ]; then
  echo -e "${RED}❌ Erro: Diretório 'public' não encontrado!${NC}"
  echo -e "${RED}Execute este script a partir da raiz do projeto.${NC}"
  exit 1
fi

# Criar diretório de mockups se não existir
mkdir -p public/mockups

echo -e "${BLUE}📁 Diretório alvo: public/mockups/${NC}"
echo ""

# ============================================
# 1. Verificar dependências
# ============================================
echo -e "${BLUE}→ Verificando dependências...${NC}"

HAS_OPTIPNG=false
HAS_CWEBP=false

if command -v optipng &> /dev/null; then
  OPTIPNG_VERSION=$(optipng -version 2>&1 | head -1)
  echo -e "${GREEN}✓ optipng: $OPTIPNG_VERSION${NC}"
  HAS_OPTIPNG=true
else
  echo -e "${YELLOW}⚠ optipng não instalado${NC}"
fi

if command -v cwebp &> /dev/null; then
  CWEBP_VERSION=$(cwebp -version 2>&1)
  echo -e "${GREEN}✓ cwebp: $CWEBP_VERSION${NC}"
  HAS_CWEBP=true
else
  echo -e "${YELLOW}⚠ cwebp não instalado (WebP conversion será pulada)${NC}"
fi

echo ""
echo -e "${YELLOW}Para instalar ferramentas:${NC}"
echo "  macOS: brew install optipng webp"
echo "  Ubuntu: sudo apt-get install optipng webp"
echo ""

# ============================================
# 2. Gerar relatório ANTES
# ============================================
echo -e "${BLUE}→ Calculando tamanho inicial...${NC}"

TOTAL_BEFORE=0
for file in public/mockups/*.png public/mockups/*.jpg public/mockups/*.jpeg 2>/dev/null; do
  if [ -f "$file" ]; then
    SIZE=$(du -b "$file" | awk '{print $1}')
    TOTAL_BEFORE=$((TOTAL_BEFORE + SIZE))
  fi
done

if [ $TOTAL_BEFORE -eq 0 ]; then
  echo -e "${YELLOW}⚠ Nenhuma imagem encontrada em public/mockups/${NC}"
  echo -e "${YELLOW}Coloque suas imagens PNG/JPG em public/mockups/ e tente novamente.${NC}"
  exit 0
fi

TOTAL_BEFORE_MB=$(echo "scale=2; $TOTAL_BEFORE / 1024 / 1024" | bc)
echo -e "${GREEN}Tamanho total antes: ${TOTAL_BEFORE_MB}MB${NC}"
echo ""

# ============================================
# 3. Comprimir PNGs com OptiPNG
# ============================================
if [ "$HAS_OPTIPNG" = true ]; then
  echo -e "${BLUE}→ Comprimindo PNG com OptiPNG...${NC}"
  PNG_COUNT=0
  
  for file in public/mockups/*.png; do
    if [ -f "$file" ]; then
      echo -e "  Processando: $(basename "$file")..."
      optipng -o2 -zc9 -zm8 -zs0 -f0-5 "$file" 2>/dev/null
      PNG_COUNT=$((PNG_COUNT + 1))
      echo -e "${GREEN}  ✓ Comprimido$(NC)"
    fi
  done
  
  echo -e "${GREEN}✓ $PNG_COUNT arquivo(s) PNG processado(s)${NC}"
  echo ""
fi

# ============================================
# 4. Converter para WebP
# ============================================
if [ "$HAS_CWEBP" = true ]; then
  echo -e "${BLUE}→ Convertendo para WebP...${NC}"
  WEBP_COUNT=0
  
  for file in public/mockups/*.png public/mockups/*.jpg public/mockups/*.jpeg; do
    if [ -f "$file" ]; then
      BASENAME=$(basename "$file" | rev | cut -d. -f2- | rev)
      OUTFILE="public/mockups/${BASENAME}.webp"
      
      echo -e "  Convertendo: $(basename "$file") → $(basename "$OUTFILE")..."
      cwebp "$file" -q 80 -m 6 -mt -o "$OUTFILE"
      WEBP_COUNT=$((WEBP_COUNT + 1))
      echo -e "${GREEN}  ✓ Convertido${NC}"
    fi
  done
  
  echo -e "${GREEN}✓ $WEBP_COUNT arquivo(s) convertido(s) para WebP${NC}"
  echo ""
else
  echo -e "${YELLOW}⚠ Pulando conversão WebP (cwebp não instalado)${NC}"
  echo ""
fi

# ============================================
# 5. Gerar relatório DEPOIS
# ============================================
echo -e "${BLUE}→ Calculando tamanho final...${NC}"

TOTAL_AFTER=0
for file in public/mockups/*.png public/mockups/*.jpg public/mockups/*.jpeg public/mockups/*.webp 2>/dev/null; do
  if [ -f "$file" ]; then
    SIZE=$(du -b "$file" | awk '{print $1}')
    TOTAL_AFTER=$((TOTAL_AFTER + SIZE))
  fi
done

TOTAL_AFTER_MB=$(echo "scale=2; $TOTAL_AFTER / 1024 / 1024" | bc)
REDUCTION=$((100 - (TOTAL_AFTER * 100 / TOTAL_BEFORE)))

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}📊 RELATÓRIO DE OTIMIZAÇÃO${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "  Tamanho ANTES:  ${YELLOW}${TOTAL_BEFORE_MB}MB${NC}"
echo -e "  Tamanho DEPOIS: ${GREEN}${TOTAL_AFTER_MB}MB${NC}"
echo -e "  Redução:        ${GREEN}${REDUCTION}%${NC}"
echo ""

if [ "$HAS_CWEBP" = true ]; then
  echo -e "${BLUE}Arquivos PNG/JPG: Comprimidos${NC}"
  echo -e "${BLUE}Arquivos WebP:    Novos formato${NC}"
  echo ""
  echo -e "${YELLOW}Dica: Use <picture> element em HTML/JSX:${NC}"
  echo ""
  echo -e "  <picture>\n    <source srcSet=\"image.webp\" type=\"image/webp\" />\n    <img src=\"image.png\" alt=\"...\" />\n  </picture>"
  echo ""
fi

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}✓ Otimização concluída!${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# ============================================
# 6. Próximos passos
# ============================================
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo ""
echo "1. Verificar as imagens otimizadas em public/mockups/"
echo "2. Atualizar componentes React para usar <OptimizedImage />"
echo "3. Fazer commit e push:"
echo ""
echo -e "${BLUE}   git add public/mockups/\n   git commit -m 'feat: optimize images (~${REDUCTION}% reduction)'\n   git push${NC}"
echo ""
echo "4. Validar performance:"
echo "   • https://pagespeed.web.dev/"
echo "   • DevTools → Lighthouse"
echo ""
