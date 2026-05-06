const fs = require('fs');

let styleCSS = fs.readFileSync('style.css', 'utf8');
let indexHTML = fs.readFileSync('index.html', 'utf8');
let scriptJS = fs.readFileSync('script.js', 'utf8');

// 1. Replace #02040a with #030712
styleCSS = styleCSS.replace(/#02040a/g, '#030712');
indexHTML = indexHTML.replace(/#02040a/g, '#030712');
scriptJS = scriptJS.replace(/#02040a/g, '#030712');

// 2. Favicon SVG
indexHTML = indexHTML.replace(
  /<link rel="icon" href="data:image\/svg\+xml,[^"]+">/g, 
  `<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23030712%22/><circle cx=%2250%22 cy=%2250%22 r=%2220%22 fill=%22%2300e5ff%22/></svg>">`
);

// 3. Remove Emoticons from HTML
indexHTML = indexHTML.replace(/🤖/g, '');
indexHTML = indexHTML.replace(/♥/g, '');
indexHTML = indexHTML.replace(/✦/g, '');

// 4. Remove Emoticons from JS
scriptJS = scriptJS.replace(/🚀/g, '');
scriptJS = scriptJS.replace(/✨/g, '');
scriptJS = scriptJS.replace(/😉/g, '');

// General Emoji Regex removal (in case there are any)
const regex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu;
indexHTML = indexHTML.replace(regex, '');
styleCSS = styleCSS.replace(regex, '');
scriptJS = scriptJS.replace(regex, '');

// 5. Buttons white-space nowrap and flex alignment
styleCSS = styleCSS.replace(
  /\.btn-cv,\s*\n\s*\.btn-spider,\s*\n\s*\.btn-projeto,\s*\n\s*\.close-search,\s*\n\s*\.theme-toggle-btn,\s*\n\s*\.pixel-toggle,\s*\n\s*\.contact-link\s*\{/g,
  `.btn-cv,
    .btn-spider,
    .btn-projeto,
    .close-search,
    .theme-toggle-btn,
    .pixel-toggle,
    .contact-link {
      white-space: nowrap !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;`
);

// 6. Glassmorphism Padding increased and background refined
styleCSS = styleCSS.replace(
  /background: rgba\(10, 14, 20, 0\.8\) !important; \/\* Fundo mais sólido e consistente \*\//g,
  `background: rgba(10, 14, 20, 0.4) !important; /* Glassmorphism lighter */`
);

styleCSS = styleCSS.replace(
  /border-radius: 24px/g,
  `border-radius: 32px` // Softer rounding
);

styleCSS = styleCSS.replace(
  /\.narrative-box,\s*\n\s*\.testimonial-card,\s*\n\s*\.kurz-card,\s*\n\s*\.contact-panel,\s*\n\s*\#game-wrapper,\s*\n\s*\.design-card\s*\{/g,
  `.narrative-box,
    .testimonial-card,
    .kurz-card,
    .contact-panel,
    #game-wrapper,
    .design-card {
      padding: 3rem !important; /* Abundant padding for respiro */`
);

fs.writeFileSync('style.css', styleCSS);
fs.writeFileSync('index.html', indexHTML);
fs.writeFileSync('script.js', scriptJS);

console.log('Update finished.');
