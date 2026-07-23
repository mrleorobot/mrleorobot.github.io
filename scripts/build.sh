#!/bin/bash
# Build script para deploy em GitHub Pages

echo "🔨 Building..."
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✓ Build successful!"
  echo ""
  echo "📦 Bundle contents:"
  du -sh dist
  
  echo ""
  echo "Ready to deploy to GitHub Pages:"
  echo ""
  echo "  git add dist/"
  echo "  git commit -m 'build: production build'"
  echo "  git push"
else
  echo "❌ Build failed!"
  exit 1
fi
