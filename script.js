
// =========================================
// APP DEPTH SCROLL (mobile) — a seção que domina a tela fica em primeiro
// plano; as outras recuam/escurecem. Mede pela área visível na TELA (não
// pelo tamanho da própria seção), então funciona igual numa seção curta
// (Game Dev) e numa bem longa (Projetos, FAQ).
// =========================================
function initAppDepthScroll() {
  if (window.innerWidth > 768) return;

  const sections = document.querySelectorAll(".app-depth");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const thresholds = [];
  for (let i = 0; i <= 20; i++) thresholds.push(i / 20);

  const observer = new IntersectionObserver(
    (entries) => {
      const vh = window.innerHeight;
      entries.forEach((entry) => {
        const visiblePx = entry.intersectionRect.height;
        const visibleFraction = vh > 0 ? visiblePx / vh : 0;
        if (visibleFraction > 0.5) {
          entry.target.classList.add("is-active");
        } else {
          entry.target.classList.remove("is-active");
        }
      });
    },
    { threshold: thresholds },
  );

  sections.forEach((s) => observer.observe(s));
}
document.addEventListener("DOMContentLoaded", initAppDepthScroll);

// =========================================
// TEXT MASK REVEAL (TITLES)
// =========================================
function initTextMaskReveal() {
  if (window.innerWidth <= 768) return;
  
  const mainTitles = document.querySelectorAll('.skills-header h2, .design-header h2, .faq-container h2, .contact-panel h2');
  
  mainTitles.forEach(title => {
    // avoid empty or nested complex HTML
    if (title.children.length === 0 || (title.children.length === 1 && title.children[0].tagName === 'BR')) {
       const text = title.innerHTML;
       title.innerHTML = `<span class="text-mask-wrapper"><span class="text-mask-inner">${text}</span></span>`;
    } else {
       // if it already has complex HTML, just wrap innerHTML
       const text = title.innerHTML;
       title.innerHTML = `<span class="text-mask-wrapper"><span class="text-mask-inner">${text}</span></span>`;
    }
    
    const maskObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed-mask');
          maskObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    
    maskObserver.observe(title);
  });
}
document.addEventListener("DOMContentLoaded", initTextMaskReveal);


// =========================================
// INNER IMAGE PARALLAX
// =========================================
function initImageParallax() {
  // Only apply on non-mobile devices for better performance
  if (window.innerWidth <= 768) return;
  
  const parallaxWrappers = document.querySelectorAll('.project-thumbnail-wrapper');
  if (!parallaxWrappers.length) return;

  let parallaxTicking = false;

  window.addEventListener('scroll', () => {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(() => {
      parallaxWrappers.forEach(wrapper => {
        const rect = wrapper.getBoundingClientRect();
        // Check if in viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Calculate progress from 0 (bottom of screen) to 1 (top of screen)
          const progress = 1 - ((rect.top + rect.height) / (window.innerHeight + rect.height));
          // Map to a Y translation (e.g. -15% to 5%)
          const yMove = (progress * 25) - 15; 
          
          const img = wrapper.querySelector('img');
          if (img) {
            img.style.setProperty('--parallax-y', `${yMove}%`);
          }
        }
      });
      parallaxTicking = false;
    });
  }, { passive: true });
}
document.addEventListener("DOMContentLoaded", initImageParallax);

// =========================================
// CINEMATIC LOADER ANIMATION (Optimized)
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("cinematic-loader");
  const brandEl = document.getElementById("cinematic-brand");
  const canvas = document.getElementById("loader-stars-canvas");
  const shootingStarEl = document.getElementById("loader-shooting-star");
  const body = document.body;

  if (!loader || !brandEl) {
    if (loader) loader.remove();
    body.classList.remove("loading-locked");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    body.classList.remove("loading-locked");
    loader.remove();
    return;
  }

  const alreadyShownThisSession = sessionStorage.getItem("loaderShown") === "1";
  if (alreadyShownThisSession) {
    body.classList.remove("loading-locked");
    loader.remove();
    return;
  }
  sessionStorage.setItem("loaderShown", "1");

  body.classList.add("loading-locked");

  // --- Lightweight canvas starfield (brighter, more visible) ---
  let animId = null;
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = window.innerWidth * dpr);
    const h = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.scale(dpr, dpr);

    const logicalW = window.innerWidth;
    const logicalH = window.innerHeight;
    const STAR_COUNT = Math.min(120, Math.floor((logicalW * logicalH) / 8000));
    const stars = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      const isBright = Math.random() < 0.15; // 15% are brighter accent stars
      stars.push({
        x: Math.random() * logicalW,
        y: Math.random() * logicalH,
        r: isBright ? Math.random() * 1.2 + 1.0 : Math.random() * 0.8 + 0.4,
        baseAlpha: isBright ? Math.random() * 0.3 + 0.6 : Math.random() * 0.35 + 0.2,
        twinkleSpeed: Math.random() * 0.008 + 0.003,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function drawStars(t) {
      ctx.clearRect(0, 0, logicalW, logicalH);
      for (const s of stars) {
        const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.05, Math.min(1, alpha))})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(drawStars);
    }
    animId = requestAnimationFrame(drawStars);
  }

  // --- Shooting star: position trail above brand name ---
  function fireShootingStar() {
    if (!shootingStarEl) return;
    const trail = shootingStarEl.querySelector(".loader-shooting-star__trail");
    if (!trail) return;

    // Position: start from above-left of the brand name
    const brandRect = brandEl.getBoundingClientRect();
    const startX = brandRect.left - 100;
    const startY = brandRect.top - 80;

    trail.style.left = startX + "px";
    trail.style.top = startY + "px";
    trail.classList.add("animate");
  }

  // --- Animation sequence (~2.25s total) ---
  //   0ms    : starfield fades in
  //   250ms  : brand name appears (letter cascade, ~700ms for all letters)
  //   850ms  : shooting star fires above the name
  //   1350ms : curtains reveal
  //   2250ms : loader removed from DOM

  requestAnimationFrame(() => {
    loader.classList.add("starfield-on");
  });

  setTimeout(() => {
    brandEl.classList.add("show");

    // Fire shooting star after name animation completes
    setTimeout(() => {
      fireShootingStar();

      // Start reveal after shooting star finishes
      setTimeout(() => {
        loader.classList.add("reveal");
        if (animId) cancelAnimationFrame(animId);

        setTimeout(() => {
          body.classList.remove("loading-locked");
          loader.remove();
        }, 900);
      }, 500); // wait for shooting star to cross
    }, 600); // wait for letter cascade to finish
  }, 250);

  // Safety fallback
  setTimeout(() => {
    if (document.getElementById("cinematic-loader")) {
      if (animId) cancelAnimationFrame(animId);
      body.classList.remove("loading-locked");
      loader.remove();
    }
  }, 5000);
});

// Garantir que a página recomece no topo ao recarregar (Melhora a percepção das animações de entrada)
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

/**
 * ========================================================
 * VERSION 1.1: LIGHTWEIGHT MOTION DESIGN (VANILLA JS)
 * ========================================================
 * Este script adiciona interatividade elegante sem bibliotecas externas.
 * Focado em performance e experiência do usuário.
 */

// Easter Egg para Recrutadores Técnicos
console.log(
  "%c Olá, Tech Recruiter ou Tech Lead! %c\n\nVejo que você gosta de olhar debaixo do capô. Este portfólio é 100% Vanilla JS, com Tipografia Fluida, Acessibilidade Sensorial, Busca Fuzzy e Cache de API no LocalStorage.\n\nSe gostou da organização e da atenção aos detalhes, vamos conversar sobre a próxima vaga da sua equipe!",
  "color: #ffffff; font-size: 20px; font-weight: bold; text-shadow: 1px 1px 0 #ffffff;",
  "color: #a0aec0; font-size: 14px; line-height: 1.5;",
);

// --------------------------------------------------------
// 0. Hero Generative Art (Node-Link reactive web)
// --------------------------------------------------------
function initHeroParticles() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let particles = [];
  const particleCount = window.innerWidth < 768 ? 12 : 60; // Fewer for performance on mobile
  const colors = ["#ffffff", "#e5e5e5", "#a3a3a3", "#525252"];
  const mouse = { x: null, y: null, radius: 100 }; // Constrain interaction area for speed

  let heroOffsetTop = 0;
  let heroOffsetLeft = 0;
  const updateHeroRect = () => {
    const rect = canvas.getBoundingClientRect();
    heroOffsetTop = rect.top + window.scrollY;
    heroOffsetLeft = rect.left + window.scrollX;
  };
  window.addEventListener("resize", updateHeroRect, { passive: true });
  // Call once
  updateHeroRect();

  let mouseMoveScheduled = false;
  window.addEventListener(
    "mousemove",
    (e) => {
      if (!mouseMoveScheduled) {
        mouseMoveScheduled = true;
        window.requestAnimationFrame(() => {
          mouse.x = e.pageX - heroOffsetLeft;
          mouse.y = e.pageY - heroOffsetTop;
          mouseMoveScheduled = false;
        });
      }
    },
    { passive: true },
  );

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    if (!canvas) return;
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.vx = (Math.random() - 0.5) * 1.2;
      this.vy = (Math.random() - 0.5) * 1.2;
      this.size = Math.random() * 2 + 1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.5 + 0.2;
      this.density = Math.random() * 30 + 1;
    }

    update() {
      // Normal floating movement
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      // Mouse interaction (Magnetic Effect)
      if (mouse.x !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distSq = dx * dx + dy * dy;
        let maxRadiusSq = mouse.radius * mouse.radius;
        if (distSq < maxRadiusSq) {
          let distance = Math.sqrt(distSq);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let force = (mouse.radius - distance) / mouse.radius;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }

    draw(introAlpha = 1) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha * introAlpha;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function drawLines(introAlpha = 1) {
    if (window.innerWidth < 768) return; // Skip expensive line drawing on mobile to maximize performance
    const maxDist = window.innerWidth < 768 ? 55 : 95;
    const maxDistSq = maxDist * maxDist; // Pre-calculate square distance

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;

        // Fast distance check using square distance (avoids expensive Math.sqrt)
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistSq) {
          const distance = Math.sqrt(distSq); // Only calc sqrt if we actually need to draw
          const alpha = (1 - distance / maxDist) * 0.12 * introAlpha;
          ctx.beginPath();
          ctx.strokeStyle = p1.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  let introAlpha = 0;
  let isHeroVisible = true;
  const heroSection = document.getElementById("hero");
  if (heroSection) {
    new IntersectionObserver(
      (entries) => {
        isHeroVisible = entries[0].isIntersecting;
      },
      { threshold: 0 },
    ).observe(heroSection);
  }
  // Espera o loader terminar antes de iniciar o loop de partículas
  let particlesStarted = false;
  function startParticles() {
    if (particlesStarted) return;
    particlesStarted = true;
    animate();
  }

  if (!document.body.classList.contains("loading-locked")) {
    // Loader já saiu
    setTimeout(startParticles, 200);
  } else {
    const pObs = new MutationObserver(() => {
      if (!document.body.classList.contains("loading-locked")) {
        pObs.disconnect();
        startParticles();
      }
    });
    pObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    setTimeout(() => { pObs.disconnect(); startParticles(); }, 7000);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!isHeroVisible) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (introAlpha < 1) {
      introAlpha += 0.04;
      if (introAlpha > 1) introAlpha = 1;
    }

    particles.forEach((p) => {
      p.update();
      p.draw(introAlpha);
    });

    drawLines(introAlpha);
  }

  animate();
}

// --------------------------------------------------------
// 0.1 Hero Micro-Parallax Effect
// Moves #hero-parallax-layer (conteúdo) e hero-canvas (partículas)
// em velocidades diferentes — cria profundidade sutil.
// Desktop only; sem efeito quando prefers-reduced-motion.
// --------------------------------------------------------
function initHeroParallax() {
  if (window.innerWidth <= 768) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layer = document.getElementById("hero-parallax-layer");
  const canvas = document.getElementById("hero-canvas");
  if (!layer) return;

  // Limites em px — muito discreto para não parecer exagerado
  const CONTENT_LIMIT = 6;   // conteúdo se move até 6px
  const CANVAS_LIMIT  = 12;  // canvas de partículas se move um pouco mais

  let cx = 0, cy = 0;  // current (suavizado)
  let tx = 0, ty = 0;  // target
  const EASE = 0.06;

  let visible = true;
  const hero = document.getElementById("hero");
  if (hero) {
    new IntersectionObserver(
      (entries) => { visible = entries[0].isIntersecting; },
      { threshold: 0 }
    ).observe(hero);
  }

  window.addEventListener("mousemove", (e) => {
    // Normaliza -1 → +1 a partir do centro da janela
    tx = ((e.clientX / window.innerWidth)  - 0.5) * 2;
    ty = ((e.clientY / window.innerHeight) - 0.5) * 2;
  }, { passive: true });

  let lastCx = null, lastCy = null;

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;

    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;

    const rx = Math.round(cx * 100) / 100;
    const ry = Math.round(cy * 100) / 100;
    if (rx === lastCx && ry === lastCy) return;
    lastCx = rx; lastCy = ry;

    // Conteúdo: movimento pequeno e oposto ao mouse (parallax "leve")
    const px = -rx * CONTENT_LIMIT;
    const py = -ry * CONTENT_LIMIT;
    layer.style.setProperty("--ink-px", px.toFixed(2) + "px");
    layer.style.setProperty("--ink-py", py.toFixed(2) + "px");

    // Canvas de partículas: move na mesma direção, mais rápido
    if (canvas) {
      canvas.style.transform =
        `scale(1.1) translate3d(${(rx * CANVAS_LIMIT * 0.5).toFixed(2)}px, ${(ry * CANVAS_LIMIT * 0.5).toFixed(2)}px, 0)`;
    }
  }

  requestAnimationFrame(tick);
}

// --------------------------------------------------------
// 1. The Storyteller Effect (Typewriter)
// --------------------------------------------------------
function initTypewriter() {
  const titleElement = document.querySelector(".typewriter-text");
  if (!titleElement) return;

  // O texto original está no HTML (bom para SEO).
  // Vamos capturá-lo, limpá-lo e redigitá-lo.
  // Usamos o caractere '|' como um marcador secreto para a quebra de linha (<br>).
  const textToType = "Criatividade|em Código.";
  let currentIndex = 0;

  // Limpa o conteúdo inicial para começar a animação
  titleElement.innerHTML = "";

  function type() {
    // Verifica se ainda há letras para digitar
    if (currentIndex < textToType.length) {
      const char = textToType.charAt(currentIndex);

      // Se encontrarmos o marcador '|', inserimos uma quebra de linha real
      if (char === "|") {
        titleElement.innerHTML += "<br>";
      } else {
        titleElement.innerHTML += char;
      }

      currentIndex++;

      // Velocidade realista: variação aleatória entre 50ms e 120ms por letra
      // Imita o ritmo natural de digitação humana
      const typingSpeed = Math.random() * 70 + 50;
      setTimeout(type, typingSpeed);
    }
  }

  // Inicia o efeito com um pequeno atraso (300ms) para ser mais responsivo
  setTimeout(type, 300);
}

// --------------------------------------------------------
// 2. The Cinematic Scroll (Intersection Observer)
// --------------------------------------------------------
function initCinematicScroll() {
  const elementsToAnimate = document.querySelectorAll(
    ".reveal-item, .section-reveal",
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  elementsToAnimate.forEach((element) => observer.observe(element));

  // Hero reveal — espera o loader terminar antes de revelar elementos do hero.
  // Os .ink-reveal são controlados pelo hero-ink.js (que também espera o loader).
  // Aqui controlamos apenas os .reveal-item genéricos do hero.
  const heroItems = document.querySelectorAll(
    "#hero .reveal-item, #hero-intro .reveal-item",
  );

  const revealHeroItems = () => {
    setTimeout(() => {
      heroItems.forEach((item) => item.classList.add("revealed"));
    }, 100);
  };

  if (!document.body.classList.contains("loading-locked")) {
    revealHeroItems();
  } else {
    const heroRevealObs = new MutationObserver(() => {
      if (!document.body.classList.contains("loading-locked")) {
        heroRevealObs.disconnect();
        revealHeroItems();
      }
    });
    heroRevealObs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    // Segurança
    setTimeout(() => {
      heroRevealObs.disconnect();
      revealHeroItems();
    }, 7000);
  }
}

function initSpotlight() {
  const cards = document.querySelectorAll(
    ".kurz-card, .project-card, .design-card, .status-card, .timeline-content",
  );
  cards.forEach((card) => {
    card.classList.add("spotlight-card");
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
}

function initBeyondCodePhoto() {
  // Parallax mínimo na fotografia da seção "Além do Código".
  // Limite 10px conforme especificação. Usa CSS custom properties + rAF,
  // sem loop concorrente e só quando a seção está no viewport.
  const section = document.getElementById("suporte-gestao");
  if (!section) return;

  const media = section.querySelector(".beyond-photo__media");
  if (!media) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth < 641) return;   // mobile: foto é bloco estático

  const MAX_SHIFT = 10;   // px — dentro do limite 5-12px
  const EASE = 0.07;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let raf = null;
  let visible = false;

  const io = new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { threshold: 0 }
  );
  io.observe(section);

  const tick = () => {
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    media.style.setProperty("--photo-px", currentX.toFixed(2) + "px");
    media.style.setProperty("--photo-py", currentY.toFixed(2) + "px");

    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  };

  const onMove = (e) => {
    if (!visible) return;
    const rect = section.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    // Direção inversa ao cursor — profundidade
    targetX = Math.max(-1, Math.min(1, nx)) * -MAX_SHIFT;
    targetY = Math.max(-1, Math.min(1, ny)) * -MAX_SHIFT * 0.6;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const onLeave = () => {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  section.addEventListener("mousemove", onMove, { passive: true });
  section.addEventListener("mouseleave", onLeave);
}

function initGameDevArtwork() {
  // Parallax extremamente sutil na artwork de pixel art.
  // Poucos pixels de deslocamento — respeita a delicadeza da arte.
  // Usa CSS custom properties + rAF; nenhum loop concorrente.
  const section = document.getElementById("game-dev");
  if (!section) return;

  const artwork = section.querySelector(".gamedev-artwork");
  if (!artwork) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth < 768) return;   // sem parallax no mobile

  const MAX_SHIFT = 6;     // px — muito discreto
  const EASE = 0.08;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let raf = null;
  let visible = false;

  // Só roda quando a seção está no viewport
  const io = new IntersectionObserver(
    (entries) => { visible = entries[0].isIntersecting; },
    { threshold: 0 }
  );
  io.observe(section);

  const tick = () => {
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    artwork.style.setProperty("--art-px", currentX.toFixed(2) + "px");
    artwork.style.setProperty("--art-py", currentY.toFixed(2) + "px");

    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  };

  const onMove = (e) => {
    if (!visible) return;
    const rect = artwork.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);
    // Movimento inverso ao cursor — sensação de profundidade
    targetX = Math.max(-1, Math.min(1, nx)) * -MAX_SHIFT;
    targetY = Math.max(-1, Math.min(1, ny)) * -MAX_SHIFT;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const onLeave = () => {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  section.addEventListener("mousemove", onMove, { passive: true });
  section.addEventListener("mouseleave", onLeave);
}

function initDesignGallery() {
  // Vitrine horizontal de UX/UI Design:
  //   • scroll-snap horizontal nativo
  //   • dots sincronizados via scroll position
  //   • setas prev/next com estado disabled
  //   • drag com mouse (desktop) — touch usa scroll nativo
  const section = document.getElementById("projetos-design");
  if (!section) return;

  const track = document.getElementById("design-track");
  if (!track) return;

  const tiles = Array.from(track.querySelectorAll(".design-tile"));
  const dots = Array.from(section.querySelectorAll(".design-pagination__dot"));
  const prevBtn = section.querySelector('.design-nav__btn[data-nav="prev"]');
  const nextBtn = section.querySelector('.design-nav__btn[data-nav="next"]');

  if (!tiles.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ─── Step: largura de 1 tile + gap ───
  const getStep = () => {
    const first = tiles[0];
    if (!first) return 300;
    const rect = first.getBoundingClientRect();
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "16");
    return rect.width + gap;
  };

  // ─── Determina qual tile está mais próximo do início do viewport ───
  const getActiveIndex = () => {
    const step = getStep();
    if (step <= 0) return 0;
    const idx = Math.round(track.scrollLeft / step);
    return Math.max(0, Math.min(idx, dots.length - 1));
  };

  // ─── Sincroniza dots + estado dos botões ───
  const updateUI = () => {
    const idx = getActiveIndex();

    dots.forEach((dot, i) => {
      dot.classList.toggle("design-pagination__dot--active", i === idx);
    });

    const maxScroll = track.scrollWidth - track.clientWidth;
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 2;
    if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 2;
  };

  // ─── Scroll pra um índice específico ───
  const scrollToIndex = (idx) => {
    const step = getStep();
    track.scrollTo({
      left: idx * step,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  };

  // ─── Setas ───
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const step = getStep();
      track.scrollBy({
        left: -step,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const step = getStep();
      track.scrollBy({
        left: step,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }

  // ─── Dots clicáveis ───
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => scrollToIndex(i));
  });

  // ─── Scroll listener (throttled via rAF) ───
  let scrollRaf = null;
  track.addEventListener("scroll", () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      updateUI();
      scrollRaf = null;
    });
  }, { passive: true });

  // ─── Drag com mouse (desktop) — touch usa scroll nativo ───
  let isDown = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  track.addEventListener("pointerdown", (e) => {
    // Só mouse — touch usa o scroll nativo do browser
    if (e.pointerType !== "mouse") return;
    if (e.button !== 0) return;
    isDown = true;
    moved = false;
    startX = e.clientX;
    startScroll = track.scrollLeft;
    track.classList.add("is-dragging");
  });

  track.addEventListener("pointermove", (e) => {
    if (!isDown || e.pointerType !== "mouse") return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    track.scrollLeft = startScroll - dx;
  });

  const endDrag = (e) => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove("is-dragging");
    // Snap suave pro tile mais próximo após soltar
    if (moved) {
      const idx = getActiveIndex();
      scrollToIndex(idx);
    }
  };

  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);
  track.addEventListener("pointerleave", endDrag);

  // Previne click nos links/tiles se houve drag real
  track.addEventListener("click", (e) => {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  }, true);

  // ─── Teclado ───
  track.setAttribute("tabindex", "0");
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (nextBtn) nextBtn.click();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (prevBtn) prevBtn.click();
    }
  });

  // ─── Resize ───
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateUI, 150);
  }, { passive: true });

  // Estado inicial
  requestAnimationFrame(() => setTimeout(updateUI, 100));
}

function initProjectsCarousel() {
  // Navegação da vitrine de projetos com prev/next.
  // Em desktop grande (>=1200px), o grid é 4 colunas — os botões
  // funcionam como scroll horizontal caso o usuário queira revisitar.
  // Em tablet/mobile, os botões controlam o scroll-snap horizontal.
  const viewport = document.getElementById("projects-viewport");
  if (!viewport) return;

  const prevBtn = document.querySelector('#projetos .projects-nav__btn[data-nav="prev"]');
  const nextBtn = document.querySelector('#projetos .projects-nav__btn[data-nav="next"]');
  if (!prevBtn || !nextBtn) return;

  // Distância de scroll por click — largura de 1 card + gap
  const getStep = () => {
    const firstCard = viewport.querySelector(".project-card");
    if (!firstCard) return 320;
    const rect = firstCard.getBoundingClientRect();
    const styles = getComputedStyle(viewport);
    const gap = parseFloat(styles.columnGap || styles.gap || "20");
    return rect.width + gap;
  };

  // Atualiza estado dos botões (disabled quando não pode scrollar mais)
  const updateButtons = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    prevBtn.disabled = viewport.scrollLeft <= 1;
    nextBtn.disabled = viewport.scrollLeft >= maxScroll - 1;
  };

  const scrollBy = (dir) => {
    const step = getStep();
    viewport.scrollBy({
      left: dir * step,
      behavior: "smooth"
    });
  };

  prevBtn.addEventListener("click", () => scrollBy(-1));
  nextBtn.addEventListener("click", () => scrollBy(1));

  // Estado inicial + on scroll
  let scrollTimer = null;
  viewport.addEventListener("scroll", () => {
    if (scrollTimer) return;
    scrollTimer = requestAnimationFrame(() => {
      updateButtons();
      scrollTimer = null;
    });
  }, { passive: true });

  // On resize
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateButtons, 150);
  }, { passive: true });

  // Detecta se o viewport tem overflow — se não, botões desabilitados
  const checkOverflow = () => {
    const hasOverflow = viewport.scrollWidth > viewport.clientWidth + 2;
    if (!hasOverflow) {
      prevBtn.disabled = true;
      nextBtn.disabled = true;
    } else {
      updateButtons();
    }
  };

  // Inicializa após um tick pra layout estar pronto
  requestAnimationFrame(() => setTimeout(checkOverflow, 100));

  // Keyboard support quando o usuário está com foco no viewport
  viewport.setAttribute("tabindex", "-1");
}

function initTechLab() {
  // Laboratório de tecnologias — parallax sutil no orbital + destaque de linha
  // SVG correspondente quando o usuário hovera um nó de tecnologia.
  const section = document.getElementById("tech-stack");
  if (!section) return;

  const orbit  = document.getElementById("tech-orbit");
  if (!orbit) return;
  const nodes  = section.querySelectorAll(".tech-node");
  const lines  = section.querySelectorAll(".tech-line");
  const core   = section.querySelector(".tech-lab__core");

  if (!orbit || !nodes.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // ─── Reveal do orbital: quando o container entra no viewport, propaga .revealed
  // pro próprio orbital (que ativa as linhas SVG e o backdrop) ───
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          orbit.classList.add("revealed");
          // Também revela cada tech-node individualmente pro reveal genérico
          nodes.forEach((n) => n.classList.add("revealed"));
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
  );
  io.observe(orbit);

  // ─── Destacar linha SVG correspondente no hover do nó ───
  const lineMap = {};
  lines.forEach((line) => {
    const tech = line.getAttribute("data-tech");
    if (tech) lineMap[tech] = line;
  });

  nodes.forEach((node) => {
    const techId = node.getAttribute("data-tech-id");
    const line = lineMap[techId];
    if (!line) return;

    const activate = () => line.classList.add("tech-line--active");
    const deactivate = () => line.classList.remove("tech-line--active");

    node.addEventListener("mouseenter", activate);
    node.addEventListener("mouseleave", deactivate);
    node.addEventListener("focus", activate);
    node.addEventListener("blur", deactivate);
  });

  // ─── AUTO-SCAN: sistema "verifica" cada tecnologia em ciclo ───
  // Ciclo através dos nós, destacando um por vez brevemente
  if (!prefersReducedMotion) {
    const nodeArr = Array.from(nodes);
    let scanIndex = -1;
    let scanTimer = null;

    // Cria mapa de linhas para scan também
    const scanLineMap = {};
    lines.forEach((line) => {
      const tech = line.getAttribute("data-tech");
      if (tech) scanLineMap[tech] = line;
    });

    const runScan = () => {
      // Remove scanning class do anterior
      if (scanIndex >= 0) {
        const prev = nodeArr[scanIndex];
        prev.classList.remove("tech-node--scanning");
        const prevTech = prev.getAttribute("data-tech-id");
        if (prevTech && scanLineMap[prevTech]) {
          scanLineMap[prevTech].classList.remove("tech-line--scanning");
        }
      }

      // Avança pro próximo (random ou sequencial)
      scanIndex = Math.floor(Math.random() * nodeArr.length);
      const current = nodeArr[scanIndex];
      current.classList.add("tech-node--scanning");
      const currentTech = current.getAttribute("data-tech-id");
      if (currentTech && scanLineMap[currentTech]) {
        scanLineMap[currentTech].classList.add("tech-line--scanning");
      }
    };

    // Inicia o scan 3.5s após o reveal, depois cicla a cada 2.5s
    let scanStarted = false;
    const startScanCycle = () => {
      if (scanStarted) return;
      scanStarted = true;
      setTimeout(() => {
        runScan();
        scanTimer = setInterval(runScan, 3500);
      }, 4500);
    };

    // Ativa scan quando o orbital fica visível pela primeira vez
    const scanIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startScanCycle();
            scanIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    scanIO.observe(orbit);

    // Pausa scan quando usuário hovera qualquer nó (não competir com hover)
    orbit.addEventListener("mouseenter", () => {
      if (scanTimer) {
        clearInterval(scanTimer);
        // Remove destaque atual
        if (scanIndex >= 0) {
          const prev = nodeArr[scanIndex];
          prev.classList.remove("tech-node--scanning");
          const prevTech = prev.getAttribute("data-tech-id");
          if (prevTech && scanLineMap[prevTech]) {
            scanLineMap[prevTech].classList.remove("tech-line--scanning");
          }
        }
      }
    });

    orbit.addEventListener("mouseleave", () => {
      // Retoma scan 2s depois do mouse sair
      if (scanTimer) clearInterval(scanTimer);
      scanTimer = setTimeout(() => {
        runScan();
        scanTimer = setInterval(runScan, 3500);
      }, 2500);
    });
  }

  // ─── Parallax sutil no orbital (desktop + sem reduced-motion) ───
  if (prefersReducedMotion || window.innerWidth < 992) return;

  let raf = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  const EASE = 0.08;
  const MAX_SHIFT = 12; // px máximos de deslocamento

  const tick = () => {
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    // Aplica parallax via CSS custom properties no container
    // O CSS incorpora essas variáveis no transform sem conflitar com
    // as animações keyframes individuais dos nós
    orbit.style.setProperty("--orbit-px", currentX.toFixed(2) + "px");
    orbit.style.setProperty("--orbit-py", currentY.toFixed(2) + "px");

    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  };

  const onMouseMove = (e) => {
    const rect = orbit.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Normalize -1 → +1
    const nx = (e.clientX - cx) / (rect.width / 2);
    const ny = (e.clientY - cy) / (rect.height / 2);
    // Clamp e escala
    targetX = Math.max(-1, Math.min(1, nx)) * MAX_SHIFT;
    targetY = Math.max(-1, Math.min(1, ny)) * MAX_SHIFT;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const onMouseLeave = () => {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  section.addEventListener("mousemove", onMouseMove, { passive: true });
  section.addEventListener("mouseleave", onMouseLeave);
}

function initTrajectorySpotlight() {
  // Spotlight cursor sutil na seção Trajetória — ambient adicional pra dar vida
  // O #sobre.mouse-active mostra o gradient; posição via CSS custom props
  const sobre = document.getElementById("sobre");
  if (!sobre) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.innerWidth < 769) return;      // desktop only

  let raf = null;
  let pendingX = 0, pendingY = 0;

  const onMove = (e) => {
    const rect = sobre.getBoundingClientRect();
    pendingX = e.clientX - rect.left;
    pendingY = e.clientY - rect.top;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      sobre.style.setProperty("--traj-mx", pendingX + "px");
      sobre.style.setProperty("--traj-my", pendingY + "px");
      raf = null;
    });
  };

  sobre.addEventListener("mouseenter", () => sobre.classList.add("cursor-lit"));
  sobre.addEventListener("mouseleave", () => sobre.classList.remove("cursor-lit"));
  sobre.addEventListener("mousemove", onMove, { passive: true });
}

function initTimelineScroll() {
  // Timeline agora é horizontal e one-shot: o CSS controla o desenho
  // da linha (transform: scaleX) via .revealed no container/section.
  // Este observer apenas marca cada item como "active" para permitir
  // efeitos de hover/state via CSS, quando entrar no viewport.
  const timelineContainer = document.querySelector(".timeline-container");
  const timelineItems = document.querySelectorAll(".timeline-item");
  if (!timelineContainer || !timelineItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -80px 0px" }
  );

  timelineItems.forEach((item) => observer.observe(item));
}

// Inicializa todas as funções quando o DOM estiver pronto com proteção robusta de try-catch individual
document.addEventListener("DOMContentLoaded", () => {
  const initSafe = (fn, name) => {
    try {
      fn();
    } catch (e) {
      console.error(`Erro ao inicializar ${name}:`, e);
    }
  };

  initSafe(setupDynamicTabs, "setupDynamicTabs");
  initSafe(initHeroParticles, "initHeroParticles");
  initSafe(initHeroParallax, "initHeroParallax");
  initSafe(initTypewriter, "initTypewriter");
  initSafe(initCinematicScroll, "initCinematicScroll");
  initSafe(initSearchAndMenu, "initSearchAndMenu");
  initSafe(initInteractiveRipples, "initInteractiveRipples");
  initSafe(initTimelineScroll, "initTimelineScroll");
  initSafe(initTrajectorySpotlight, "initTrajectorySpotlight");
  initSafe(initTechLab, "initTechLab");
  initSafe(initProjectsCarousel, "initProjectsCarousel");
  initSafe(initDesignGallery, "initDesignGallery");
  initSafe(initGameDevArtwork, "initGameDevArtwork");
  initSafe(initBeyondCodePhoto, "initBeyondCodePhoto");
  initSafe(initSpotlight, "initSpotlight");
  initSafe(initTabSystem, "initTabSystem");
  initSafe(initScrollProgressBar, "initScrollProgressBar");
  initSafe(initMuralDepoimentos, "initMuralDepoimentos");
  initSafe(initPremiumCursor, "initPremiumCursor");
});

// --------------------------------------------------------
// 4. Search Filter & Mobile Menu
// --------------------------------------------------------
function initSearchAndMenu() {
  // Mobile Menu
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willBeActive = !hamburger.classList.contains("active");
      hamburger.classList.toggle("active", willBeActive);
      navLinks.classList.toggle("active", willBeActive);
      hamburger.setAttribute("aria-expanded", String(willBeActive));
      hamburger.setAttribute("aria-label", willBeActive ? "Fechar menu" : "Abrir menu");

      if (willBeActive) {
        // Wait for display transition then focus first item
        setTimeout(() => {
          const firstLink = navLinks.querySelector("a");
          if (firstLink) firstLink.focus();
        }, 100);
      }
    });

    // Focus Trap on Mobile Menu
    navLinks.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const focusableElements = navLinks.querySelectorAll("a");
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Se Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Se só Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
      if (e.key === "Escape") {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Abrir menu");
        hamburger.focus();
      }
    });

    // Close menu when clicking a link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "Abrir menu");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (navLinks.classList.contains("active")) {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
          hamburger.classList.remove("active");
          navLinks.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
          hamburger.setAttribute("aria-label", "Abrir menu");
        }
      }
    });
  }

  // Debounce Helper
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // --------------------------------------------------------
  // Skills Infinite Scrolling (Vertical Marquee Cloning)
  // --------------------------------------------------------
  const marqueeGrids = [
    document.getElementById("skills-marquee-grid"),
    document.getElementById("skills-marquee-grid-2"),
  ];

  marqueeGrids.forEach((grid) => {
    if (grid) {
      const originalCards = Array.from(grid.children);
      originalCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.classList.add("clone");
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("tabindex", "-1");
        // Remove scroll reveal animation classes from clones to prevent conflict
        clone.classList.remove(
          "reveal-item",
          "stagger-1",
          "stagger-2",
          "stagger-3",
        );
        grid.appendChild(clone);
      });
    }
  });

  // Search Filter
  const searchInput = document.getElementById("searchInput");
  const marqueeContainer = document.getElementById("skills-marquee-container");
  if (searchInput) {
    const handleSearch = debounce((e) => {
      const term = e.target.value.toLowerCase().trim();
      // Select both inventory cards, project cards, and skills cards
      const cards = document.querySelectorAll(
        ".kurz-card, .ut-card, .kurz-skill-card",
      );

      if (term) {
        if (marqueeContainer) {
          marqueeContainer.classList.add("searching");
        }
        cards.forEach((card) => {
          if (card.classList.contains("clone")) {
            card.style.display = "none";
            return;
          }
          const text = card.innerText.toLowerCase();
          if (text.includes(term)) {
            card.style.display = "";
            card.classList.add("revealed"); // Force showing if searched
          } else {
            card.style.display = "none";
          }
        });
      } else {
        if (marqueeContainer) {
          marqueeContainer.classList.remove("searching");
        }
        cards.forEach((card) => {
          card.style.display = "";
        });
      }
    }, 300);

    searchInput.addEventListener("input", handleSearch);
  }
}

// --------------------------------------------------------
// 6. FAQ Accordion Logic
// --------------------------------------------------------
const faqQuestions = document.querySelectorAll(".faq-question");
faqQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const item = question.parentNode;
    const answer = item.querySelector(".faq-answer-wrapper");
    const isActive = item.classList.contains("active");

    // Fecha outros abertos (opcional, mas garante um visual limpo)
    document.querySelectorAll(".faq-item").forEach((otherItem) => {
      otherItem.classList.remove("active");
      otherItem.querySelector(".faq-answer-wrapper").style.maxHeight = null;
      otherItem
        .querySelector(".faq-question")
        .setAttribute("aria-expanded", "false");
    });

    // Se este estava fechado, abre.
    if (!isActive) {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";
      question.setAttribute("aria-expanded", "true");

      item.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});

// --------------------------------------------------------
// 7. Copy Email Toast Logic
// --------------------------------------------------------
const btnCopiarEmail = document.getElementById("btn-copiar-email");
const toastNotificacao = document.getElementById("toast-notificacao");

if (btnCopiarEmail) {
  const conteudoOriginalBtn = btnCopiarEmail.innerHTML;
  let isWorking = false;

  btnCopiarEmail.addEventListener("click", (e) => {
    e.preventDefault();

    if (isWorking) return;
    isWorking = true;

    // Setup ripple
    const rect = btnCopiarEmail.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    if (e.clientX === 0 && e.clientY === 0) {
      x = rect.width / 2;
      y = rect.height / 2;
    }

    const ripple = document.createElement("span");
    ripple.classList.add("ripple-span");
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btnCopiarEmail.appendChild(ripple);

    setTimeout(() => {
      const emailCopy = "leosouza5555@gmail.com";

      const dispararFeedback = () => {
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }

        const linkText = btnCopiarEmail.querySelector(".link-text");
        if (linkText) {
          linkText.innerText = "Copiado!";
        } else {
          btnCopiarEmail.innerHTML = "E-mail copiado!";
        }
        btnCopiarEmail.style.background = "#ffffff"; // Arcane hex tint
        btnCopiarEmail.classList.add("copied-feedback");

        if (toastNotificacao) {
          toastNotificacao.innerHTML = "E-mail copiado!";
          toastNotificacao.classList.remove("toast-escondido");
          toastNotificacao.classList.add("toast-visivel");
        }

        setTimeout(() => {
          btnCopiarEmail.innerHTML = conteudoOriginalBtn;
          btnCopiarEmail.style.background = "";
          btnCopiarEmail.classList.remove("copied-feedback");
          if (toastNotificacao) {
            toastNotificacao.classList.remove("toast-visivel");
            toastNotificacao.classList.add("toast-escondido");
          }
          const currentRipple = btnCopiarEmail.querySelector(".ripple-span");
          if (currentRipple) currentRipple.remove();
          isWorking = false;
        }, 3000);
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(emailCopy).then(dispararFeedback);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = emailCopy;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          dispararFeedback();
        }
      } catch (err) {
        console.error("Falha ao copiar", err);
        isWorking = false;
        const currentRipple = btnCopiarEmail.querySelector(".ripple-span");
        if (currentRipple) currentRipple.remove();
      }
    }, 350); // let ripple expand before changing text
  });
}

// --------------------------------------------------------
// 7.1. Vertical Ticker Card Interaction Logic
// --------------------------------------------------------
const tickerItems = document.querySelectorAll(".ticker-item");
if (tickerItems.length > 0 && toastNotificacao) {
  let tickerTimeout;
  tickerItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      const title = item.getAttribute("data-title");
      const desc = item.getAttribute("data-desc");

      // Setup micro-interaction ripple
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.classList.add("ripple-span");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      item.appendChild(ripple);

      if (navigator.vibrate) {
        navigator.vibrate(30);
      }

      // Display high-fidelity detailed notification toast
      clearTimeout(tickerTimeout);
      toastNotificacao.innerHTML = `<strong>${title}:</strong> ${desc}`;
      toastNotificacao.classList.remove("toast-escondido");
      toastNotificacao.classList.add("toast-visivel");

      tickerTimeout = setTimeout(() => {
        toastNotificacao.classList.remove("toast-visivel");
        toastNotificacao.classList.add("toast-escondido");
        ripple.remove();
      }, 5000);
    });
  });
}

// --------------------------------------------------------
// 8. Animated Counters Logic
// --------------------------------------------------------
const contadores = document.querySelectorAll(".contador");

if (contadores.length > 0) {
  const observarContadores = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const alvo = parseInt(el.getAttribute("data-alvo"), 10);
          const duration = 2000; // 2 segundos
          const frameRate = 1000 / 60; // 60fps
          const totalFrames = Math.round(duration / frameRate);
          let currentFrame = 0;

          const counterInterval = setInterval(() => {
            currentFrame++;
            const progresso = currentFrame / totalFrames;
            // Easing out cubic
            const easeOut = 1 - Math.pow(1 - progresso, 3);
            const valorAtual = Math.round(alvo * easeOut);

            el.innerText = valorAtual;

            if (currentFrame >= totalFrames) {
              el.innerText = alvo;
              clearInterval(counterInterval);
            }
          }, frameRate);

          // Anima também a barra associada, se houver
          const container = el.closest('div[style*="margin-bottom: 1.5rem"]');
          if (container) {
            const barra = container.querySelector(".tech-bar");
            if (barra) {
              const larguraFinal = barra.getAttribute("data-alvo-largura");
              // Adicionamos um pequeno delay (setTimeout) para dar um charme visual a mais (staggering)
              setTimeout(() => {
                barra.style.width = larguraFinal + "%";
              }, 100);
            }
          }

          // Parar de observar após engatilhar a animação
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.5,
    },
  );

  contadores.forEach((contador) => {
    observarContadores.observe(contador);
  });
}

// --------------------------------------------------------
// 9. GitHub API Integration (Com Cache Inteligente)
// --------------------------------------------------------
async function fetchRecentRepos() {
  const container = document.getElementById("github-repos-grid");
  if (!container) return;

  const username = "mrleorobot";
  const numRepos = 6;
  const cacheKey = "githubReposData";
  const cacheTimestampKey = "githubReposTimestamp";
  const cacheDuration = 3600000; // 1 hr
  const now = Date.now();

  const cachedData = localStorage.getItem(cacheKey);
  const cachedTimestamp = localStorage.getItem(cacheTimestampKey);

  const renderRepos = (reposData) => {
    container.innerHTML = "";

    // Array estático de fallback caso a API falhe ou exija rate limit
    const fallbackRepos = [
      {
        name: "mrleorobot.github.io",
        description:
          "Meu portfólio pessoal construído com foco em UX/UI e interações fluidas.",
        language: "HTML",
        updated_at: new Date().toISOString(),
        html_url: "https://github.com/mrleorobot/mrleorobot.github.io",
        stargazers_count: 5,
        fork: false,
      },
      {
        name: "dashboard_de_inventario",
        description:
          "Dashboard em Power BI para gestão eficiente de estoque e previsão de demandas.",
        language: "DAX",
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        html_url: "https://github.com/mrleorobot/dashboard_de_inventario",
        stargazers_count: 8,
        fork: false,
      },
      {
        name: "design_system_etep",
        description:
          "Biblioteca unificada de componentes e guias de estilo para a ETEP.",
        language: "TypeScript",
        updated_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        html_url: "https://github.com/mrleorobot/design_system_etep",
        stargazers_count: 12,
        fork: false,
      },
      {
        name: "Aulas-Antigas-2024",
        description:
          "Repositório com o material didático das minhas turmas na ETEP.",
        language: "Markdown",
        updated_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        html_url: "https://github.com/mrleorobot/Aulas-Antigas-2024",
        stargazers_count: 15,
        fork: false,
      },
    ];

    const targetData = Array.isArray(reposData) ? reposData : fallbackRepos;

    const repos = targetData.filter((repo) => !repo.fork).slice(0, numRepos);

    if (repos.length === 0) {
      container.innerHTML = `<div style="text-align: center; width: 100%; color: #a0aec0; grid-column: 1 / -1;">Nenhum repositório recente encontrado.</div>`;
      return;
    }

    const localObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            localObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    repos.forEach((repo, i) => {
      const article = document.createElement("article");
      article.className = `design-card reveal-item stagger-${(i % 3) + 1} active`;
      article.style.padding = "1.25rem";
      article.style.borderRadius = "16px";
      article.style.background = "rgba(10, 10, 10, 0.6)";
      article.style.border = "1px solid rgba(255, 255, 255, 0.05)";
      article.style.display = "flex";
      article.style.flexDirection = "column";

      const desc = repo.description
        ? repo.description
        : "Sem descrição fornecida.";
      const lang = repo.language ? repo.language : "Markdown";
      const date = new Date(repo.updated_at).toLocaleDateString("pt-BR");

      article.innerHTML = `
         <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--arcane-hex);">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
            </svg>
            <span style="font-size: 0.8rem; color: #a0aec0; font-family: 'JetBrains Mono', monospace;">${date}</span>
         </div>
         <h3 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.5rem; word-break: break-word; overflow-wrap: break-word; text-transform: uppercase;" class="notranslate" translate="no">${repo.name}</h3>
         <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 1.25rem; flex: 1; line-height: 1.4;">${desc}</p>
         <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05);">
             <span class="notranslate" translate="no" style="font-size: 0.8rem; color: var(--arcane-hex); display: flex; align-items: center; gap: 0.5rem; font-weight: 600;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--arcane-hex); display: inline-block;"></span>
                ${lang}
             </span>
             <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="color: #fff; text-decoration: none; font-size: 0.8rem; border-bottom: 1px dotted currentColor; transition: opacity 0.3s ease; font-family: 'Space Grotesk', sans-serif;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Ver Repositório ↗</a>
         </div>
       `;
      container.appendChild(article);
      localObserver.observe(article);
    });
  };

  if (cachedData && cachedTimestamp && now - cachedTimestamp < cacheDuration) {
    try {
      renderRepos(JSON.parse(cachedData));
      return;
    } catch (e) {
      console.warn("Erro cache repos:", e);
    }
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=15`,
    );
    
    let data;
    try {
      data = await res.json();
    } catch(e) {
      throw new Error("Falha ao buscar repositórios do GitHub");
    }

    if (!res.ok || (data && data.message && data.message.includes("rate limit"))) {
      throw new Error("Falha ao buscar repositórios ou Rate limit hit");
    }
    renderRepos(data);
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(cacheTimestampKey, now.toString());
  } catch (error) {
    console.warn("Aviso na integração com GitHub Repos (usando fallback):", error.message);
    if (cachedData) {
      try {
        renderRepos(JSON.parse(cachedData));
      } catch (e) {
        renderRepos(null); // fallback
      }
    } else {
      renderRepos(null); // fallback se n tiver cache
    }
  }
}

// fetchRecentRepos(); // Desativado: seção substituída pela vitrine estática

// --------------------------------------------------------
// 11. Availability Status Logic (Business Hours)
// --------------------------------------------------------
function verificarDisponibilidade() {
  const agora = new Date();
  const hora = agora.getHours();
  const diaDaSemana = agora.getDay(); // 0 = Domingo, 6 = Sábado

  const bolinhaElement = document.getElementById("bolinha-status");
  const textoElement = document.getElementById("texto-status");

  if (!bolinhaElement || !textoElement) return;

  // Horários Disponíveis:
  // - Segunda a Sexta (1 a 5): 08:00 às 17:59
  // - Sábado (6): 08:00 às 16:59
  const isDiaDeSemana =
    diaDaSemana >= 1 && diaDaSemana <= 5 && hora >= 8 && hora < 18;
  const isSabado = diaDaSemana === 6 && hora >= 8 && hora < 17;

  if (isDiaDeSemana || isSabado) {
    bolinhaElement.style.backgroundColor = "#ffffff";
    bolinhaElement.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.8)";
    textoElement.innerText = "Online - Disponível para contato";
  } else {
    bolinhaElement.style.backgroundColor = "#ffffff";
    bolinhaElement.style.boxShadow = "0 0 10px rgba(255, 255, 255, 0.8)";
    textoElement.innerText = "Offline - Recarregando as baterias";
  }
}

verificarDisponibilidade();
setInterval(verificarDisponibilidade, 60000); // Atualiza a cada 1 minuto

// Back to top button logic
const btnTopo = document.getElementById("btn-topo");
if (btnTopo) {
  let isScrolling = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!isScrolling) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 300) {
            btnTopo.classList.add("show");
          } else {
            btnTopo.classList.remove("show");
          }
          isScrolling = false;
        });
        isScrolling = true;
      }
    },
    { passive: true },
  );
  btnTopo.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// Initialize simple interactions

function initInteractiveRipples() {
  const rippleButtons = document.querySelectorAll(
    ".cardList__btn",
  );

  rippleButtons.forEach((btn) => {
    btn.addEventListener("mousedown", function (e) {
      const rect = btn.getBoundingClientRect();
      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      if (e.clientX === 0 && e.clientY === 0) {
        x = rect.width / 2;
        y = rect.height / 2;
      }

      const ripple = document.createElement("span");
      ripple.classList.add("ripple-span");
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      btn.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600); // the dynamic-ripple animation duration is 0.6s
    });
  });
}

function initStatusParallax() {
  // Desativado a pedido do usuário para remover efeito grosseiro de ampliação
}

// --------------------------------------------------------
// 13. Premium UI Sounds (Minimalist, Dark & Crisp)
// --------------------------------------------------------
const soundToggleBtn = document.getElementById("soundToggleBtn");
let soundEnabled = true;
let audioCtx = null;

const iconVolumeOn =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
const iconVolumeOff =
  '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';

// Load Audio Preference
const savedAudio = localStorage.getItem("portfolioAudio");
if (savedAudio === "off") {
  soundEnabled = false;
  if (soundToggleBtn) soundToggleBtn.innerHTML = iconVolumeOff;
}

function initAudio() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch (e) {}
}

function playHoverSound() {
  if (!soundEnabled) return;
  if (!audioCtx) initAudio();
  if (audioCtx.state === "suspended") return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Subtle low thump for hover
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(100, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    40,
    audioCtx.currentTime + 0.05
  );

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.015, audioCtx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.05);
}

function playClickSound() {
  if (!soundEnabled) return;
  if (!audioCtx) initAudio();

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Crisp modern tap for click
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    150,
    audioCtx.currentTime + 0.05
  );

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
}

if (soundToggleBtn) {
  soundToggleBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      localStorage.setItem("portfolioAudio", "on");
      initAudio();
      soundToggleBtn.innerHTML = iconVolumeOn;
      playClickSound(); // Play test sound
    } else {
      localStorage.setItem("portfolioAudio", "off");
      soundToggleBtn.innerHTML = iconVolumeOff;
    }
  });
}

// Attach sounds to elements
document
  .querySelectorAll("button, a, .kurz-card, .design-card, .ut-card")
  .forEach((el) => {
    el.addEventListener("mouseenter", playHoverSound);
    el.addEventListener("click", playClickSound);
  });

// --------------------------------------------------------
// 16. Modals Logic
// --------------------------------------------------------
const modalBehance = document.getElementById("modal-behance");
if (modalBehance) {
  document.querySelectorAll(".contact-link.behance").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modalBehance.showModal();
    });
  });
}

const modalDribbble = document.getElementById("modal-dribbble");
if (modalDribbble) {
  document.querySelectorAll(".contact-link.dribbble").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modalDribbble.showModal();
    });
  });
}

const modalLightbox = document.getElementById("modal-lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxCategory = document.getElementById("lightbox-category");
const lightboxChallenge = document.getElementById("lightbox-challenge");
const lightboxSolution = document.getElementById("lightbox-solution");
const lightboxTech = document.getElementById("lightbox-tech");
const lightboxWrapper = document.getElementById("lightbox-wrapper");
const lightboxInfoSide = document.getElementById("lightbox-info-side");

const projectDetails = {
  "placeholder-dashboard": {
    title: "Dashboard de Inventário",
    category: "Web & Front-end Development",
    challenge:
      "Organizar e resumir dados densos de estoque de forma legível, fluida e esteticamente agradável para tomadores de decisão.",
    solution:
      "Painel interativo com alertas de produtos em baixa, gráficos de tendência de vendas, busca/filtro instantâneo e exportação de relatórios (planilha e PDF).",
    tech: ["Next.js", "TypeScript", "shadcn/ui", "Framer Motion"],
  },
  "placeholder-refugio": {
    title: "Refúgio Sereno",
    category: "Produtividade & Acessibilidade",
    challenge:
      "Facilitar a rotina diária de pessoas com TDAH, que frequentemente sofrem com sobrecarga cognitiva em interfaces de produtividade convencionais.",
    solution:
      "Gerenciador de tarefas gamificado com estética acolhedora (inspirada em Studio Ghibli) — drag-and-drop, sistema de XP/níveis, sincronização em tempo real via Firebase e sugestões inteligentes com IA.",
    tech: ["React", "Firebase", "Gemini API", "dnd-kit"],
  },
  "placeholder-portal": {
    title: "Portal Corporativo",
    category: "Full-stack & Enterprise Design",
    challenge:
      "Unificar em um só lugar as informações que um colaborador precisa no dia a dia — treinamentos, holerite, avaliações, benefícios e comunicados.",
    solution:
      "Intranet completa com módulos de treinamentos, holerite, avaliações de desempenho, benefícios, férias, mural de avisos e suporte, com formulários validados e navegação fluida.",
    tech: ["Next.js", "React Hook Form", "Zod", "Zustand"],
  },
  "placeholder-chat-ia": {
    title: "Dsol AI",
    category: "Artificial Intelligence UI",
    challenge:
      "Prover um tutor personalizado e sempre disponível para tirar dúvidas de estudo, com respostas claras mesmo em conteúdo técnico.",
    solution:
      "Interface de chat com IA (Gemini), renderização em Markdown com highlight de código, exportação de conversas em PDF, sidebar retrátil e modo escuro.",
    tech: ["React", "Firebase", "Gemini API", "Recharts"],
  },
  "mockup-convite": {
    title: "Convite Digital",
    category: "UX/UI Design",
    challenge:
      "Modernizar o formato tradicional de convites físicos de eventos para um formato dinâmico, interativo e compartilhável.",
    solution:
      "Desenvolvimento de um convite digital de alta fidelidade com micro-interações elegantes de RSVP, integração direta com mapas de rotas e animações sutis de constelações.",
    tech: ["Figma", "Design de Interação", "Prototipagem de Fluxos"],
  },
  "mockup-hamburgueria": {
    title: "Menu Digital",
    category: "Visual Identity & Front-end Layout",
    challenge:
      "Criar um cardápio digital otimizado para celulares, que reduza a fricção de compra e evite a dispersão visual.",
    solution:
      "Estruturação em bento grid focado em usabilidade, com cores quentes baseadas em psicologia alimentar para destacar itens em alta, com adição de barra de busca instantânea.",
    tech: ["Photoshop", "Illustrator", "Grid System Design"],
  },
  "mockup-logo": {
    title: "LDS Magazine Branding",
    category: "Corporate Identity",
    challenge:
      "Projetar uma marca memorável de luxo e alto padrão que comunique sofisticação, precisão e minimalismo.",
    solution:
      "Logotipo desenhado a partir de grids geométricos perfeitos, com tipografia personalizada em serifado clássico e paleta baseada em tons de terra e champanhe.",
    tech: ["Illustrator", "Teoria de Grid", "Manual de Identidade"],
  },
  "mockup-editorial": {
    title: "LDS Magazine Editorial",
    category: "Editorial Design",
    challenge:
      "Diagramar um artigo longo e complexo de forma a convidar a uma leitura tranquila e absorção aprofundada.",
    solution:
      "Direção de arte editorial aplicando grids assimétricos de colunas, tipografia com alto contraste e respiros generosos no layout, evitando fadiga de leitura.",
    tech: ["InDesign", "Diagramação", "Tipografia Avançada"],
  },
  "mockup-pixelart": {
    title: "Creative C. Pixel Art",
    category: "Retro Visual Assets",
    challenge:
      "Criar um ambiente imersivo, nostálgico e autêntico de RPG retrô para projetos pessoais e marcas criativas.",
    solution:
      "Criação de sprites e paleta de cores reduzida de 16-bits. O design busca guiar as interações de forma lúdica através de elementos clássicos de jogos pixelados.",
    tech: ["Aseprite", "Pixel Art Theory", "Nostalgic UX"],
  },
  "mockup-psicologia": {
    title: "Estudo: Cores & UX",
    category: "Design Research",
    challenge:
      "Sistematizar o impacto das decisões cromáticas no comportamento dos usuários em produtos de saúde digital.",
    solution:
      "Um artigo científico prático que compila paletas testadas, métricas de conversão e acessibilidade para interfaces de bem-estar social.",
    tech: [
      "Análise Qualitativa",
      "Heurísticas de Jakob",
      "Acessibilidade WCAG",
    ],
  },
};

if (modalLightbox && lightboxImg) {
  // Attach to all images inside gallery wrapper and project thumbnails
  document
    .querySelectorAll(".cards__wrapper img, .project-lightbox-trigger")
    .forEach((img) => {
      img.addEventListener("click", () => {
        let targetImg = img;
        if (!img.src && img.querySelector("img")) {
          targetImg = img.querySelector("img");
        }

        const srcAttr = targetImg.getAttribute("src") || "";
        const srcFile = srcAttr.split("/").pop() || "";
        const key = srcFile.split(".")[0] || "";

        lightboxImg.src = targetImg.src || srcAttr;

        const details = projectDetails[key];
        if (
          details &&
          lightboxTitle &&
          lightboxCategory &&
          lightboxChallenge &&
          lightboxSolution &&
          lightboxTech
        ) {
          lightboxTitle.textContent = details.title;
          lightboxCategory.textContent = details.category;
          lightboxChallenge.textContent = details.challenge;
          lightboxSolution.textContent = details.solution;

          lightboxTech.innerHTML = "";
          details.tech.forEach((t) => {
            const span = document.createElement("span");
            span.textContent = t;
            lightboxTech.appendChild(span);
          });

          if (lightboxInfoSide) lightboxInfoSide.style.display = "flex";
          if (lightboxWrapper)
            lightboxWrapper.style.gridTemplateColumns = "1.1fr 0.9fr";
        } else {
          if (lightboxInfoSide) lightboxInfoSide.style.display = "none";
          if (lightboxWrapper)
            lightboxWrapper.style.gridTemplateColumns = "1fr";
        }

        modalLightbox.showModal();
      });
      img.style.cursor = "zoom-in";
    });
}

const modalFullscreen = document.getElementById("modal-fullscreen-image");
const fullscreenImg = document.getElementById("fullscreen-img");

if (lightboxImg && modalFullscreen && fullscreenImg) {
  lightboxImg.addEventListener("click", () => {
    fullscreenImg.src = lightboxImg.src;
    fullscreenImg.alt = lightboxImg.alt;
    modalFullscreen.showModal();
  });
}

// Close modals when clicking outside
document.querySelectorAll(".custom-modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.close();
    }
  });
});

// Share button logic
const btnShare = document.getElementById("btn-share");
if (btnShare) {
  btnShare.addEventListener("click", () => {
    const fallbackCopy = () => {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          const t = document.getElementById("toast-notificacao");
          if (t) {
            t.innerHTML = "Link copiado para área de transferência!";
            t.classList.remove("toast-escondido");
            t.classList.add("toast-visivel");
            setTimeout(() => {
              t.classList.remove("toast-visivel");
              t.classList.add("toast-escondido");
            }, 3000);
          }
        })
        .catch((err) => console.error("Erro ao copiar", err));
    };

    if (navigator.share) {
      navigator
        .share({
          title: "Portfólio - Leonilson Souza",
          text: "Confira o portfólio de Leonilson Souza!",
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Erro ao compartilhar", err);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  });
}

// --------------------------------------------------------
// X. Language Logic (Google Translate)
// --------------------------------------------------------
const langToggleBtn = document.getElementById("langToggleBtn");
if (langToggleBtn) {
  let isEnglish = localStorage.getItem("site_lang") === "en";

  const updateLangButton = () => {
    const span = langToggleBtn.querySelector(".lang-text");
    if (span) {
      span.innerText = isEnglish ? "PT" : "EN";
    }
  };

  const triggerGoogleTranslate = (targetLang) => {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event("change"));
    } else {
      // Wait till it is available
      setTimeout(() => triggerGoogleTranslate(targetLang), 500);
    }
  };

  // Set initial state
  if (isEnglish) {
    updateLangButton();
    // Wait slightly for Google script to load before applying if it's EN
    setTimeout(() => triggerGoogleTranslate("en"), 1000);
  }

  langToggleBtn.addEventListener("click", () => {
    isEnglish = !isEnglish;
    localStorage.setItem("site_lang", isEnglish ? "en" : "pt");
    updateLangButton();
    triggerGoogleTranslate(isEnglish ? "en" : "pt");
  });
}

// --------------------------------------------------------
// Scroll Spy & Navigation Links Handling (No-tab Continuous Landing Page)
// --------------------------------------------------------
function setupDynamicTabs() {
  // Discarded because user requested a complete continuous landing page on a single screen scroll.
  // We keep the method defined so it doesn't cause script errors, but do not execute any DOM manipulation.
}

function initTabSystem() {
  const navLinks = document.querySelectorAll(".nav-links a, .logo");

  // Intercept all navigation links and add smooth scroll
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#") && href !== "#") {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          // Close mobile menu if open
          const navLinksContainer = document.querySelector(".nav-links");
          const hamburger = document.querySelector(".hamburger");
          if (
            navLinksContainer &&
            navLinksContainer.classList.contains("active")
          ) {
            navLinksContainer.classList.remove("active");
            if (hamburger) hamburger.setAttribute("aria-expanded", "false");
          }

          // Smooth scroll to target element
          const offset = 80; // height of fixed header to prevent overlapping
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = targetElement.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });

          // Update hash in URL
          history.pushState(null, null, href);
        }
      }
    });
  });

  // Scroll Spy using IntersectionObserver to update active state of navbar links dynamically!
  const spySections = ["hero", "sobre", "tech-stack", "projetos", "cta-final"];
  const options = {
    root: null,
    rootMargin: "-20% 0px -60% 0px", // triggers when section enters the viewport nicely
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");

        // Find corresponding link
        document.querySelectorAll(".nav-tab-link").forEach((link) => {
          const href = link.getAttribute("href");
          if (href === `#${id}`) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, options);

  spySections.forEach((sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) observer.observe(el);
  });
}

function initScrollProgressBar() {
  const progressBar = document.getElementById("header-scroll-progress");
  if (!progressBar) return;

  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        progressBar.style.width = "0%";
        return;
      }
      let scrollPercent = (scrollTop / docHeight) * 100;
      if (scrollPercent < 0) scrollPercent = 0;
      if (scrollPercent > 100) scrollPercent = 100;
      progressBar.style.width = `${scrollPercent}%`;
    },
    { passive: true },
  );
}

// Cursor glow logic removed

// --------------------------------------------------------
// 12. Mural de Depoimentos & Feedback Hub Interativo
// --------------------------------------------------------
function initMuralDepoimentos() {
  const gridElement = document.getElementById("mural-depoimentos-grid");
  const formWrapper = document.getElementById("mural-form-wrapper");
  const formElement = document.getElementById("mural-form");
  const btnAbrirForm = document.getElementById("btn-abrir-mural-form");
  const btnCancelarForm = document.getElementById("btn-cancelar-mural-form");
  const filterButtons = document.querySelectorAll(".feedback-filter-btn");
  const starsContainer = document.getElementById("mural-rating-container");

  if (!gridElement) return;

  // Comentários Padrão
  const defaultComments = [
    {
      id: "c1",
      name: "Arthur Medeiros",
      type: "aluno",
      text: "O Professor Leo tem uma paciência incrível para explicar conceitos difíceis. Graças à sua didática, consegui entender a lógica por trás do código sem me sentir frustrado.",
      role: "Ex-Aluno de Web Design",
      date: "Dez/2025",
      rating: 5,
      avatar: "AM",
      color: "linear-gradient(135deg, #111111, #333333)",
    },
    {
      id: "c2",
      name: "Jennyfer",
      type: "colega",
      text: "Trabalhar com ele é ter a certeza de que os processos técnicos estarão sempre organizados e acessíveis. Ele consegue simplificar o uso de sistemas para qualquer pessoa da equipe.",
      role: "Colega de Administração",
      date: "Out/2025",
      rating: 5,
      avatar: "JE",
      color: "linear-gradient(135deg, #222222, #444444)",
    },
    {
      id: "c3",
      name: "Julio Nogueira",
      type: "aluno",
      text: "As aulas de informática eram muito visuais e fáceis de acompanhar. Ele realmente se importa em garantir que o aluno não apenas decore, mas entenda a ferramenta.",
      role: "Ex-Aluno de Informática",
      date: "Nov/2025",
      rating: 5,
      avatar: "JN",
      color: "linear-gradient(135deg, #333333, #555555)",
    },
  ];

  // Cores de gradiente exclusivas para novos avatares
  const avatarGradients = [
    "linear-gradient(135deg, #111111, #333333)", // Mono 1
    "linear-gradient(135deg, #222222, #444444)", // Mono 2
    "linear-gradient(135deg, #333333, #555555)", // Mono 3
    "linear-gradient(135deg, #1a1a1a, #2a2a2a)", // Mono 4
    "linear-gradient(135deg, #444444, #666666)", // Mono 5
    "linear-gradient(135deg, #0a0a0a, #1a1a1a)", // Charcoal/Slate
  ];

  let comments = [];
  try {
    const saved = localStorage.getItem("mural_comments");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filtra os comentários salvos para remover duplicatas dos padrões pelo id ou nome
        const savedNonDefault = parsed.filter(
          (c) =>
            !defaultComments.some(
              (dc) =>
                dc.id === c.id ||
                dc.name.toLowerCase() === c.name.toLowerCase(),
            ),
        );
        comments = [...defaultComments, ...savedNonDefault];
      } else {
        comments = [...defaultComments];
      }
    } else {
      comments = [...defaultComments];
    }
    localStorage.setItem("mural_comments", JSON.stringify(comments));
  } catch (e) {
    console.error("Erro ao carregar comentários do localStorage", e);
    comments = [...defaultComments];
  }

  let activeFilter = "all";
  let ratingValue = 5;

  // Inicializa cliques nas estrelas do formulário
  if (starsContainer) {
    const starButtons = starsContainer.querySelectorAll(".star-btn");
    starButtons.forEach((starBtn) => {
      starBtn.addEventListener("click", () => {
        const val = parseInt(starBtn.getAttribute("data-value"));
        ratingValue = val;

        // Atualiza estilo visual das estrelas
        starButtons.forEach((btn) => {
          const btnVal = parseInt(btn.getAttribute("data-value"));
          if (btnVal <= val) {
            btn.classList.add("active");
            btn.style.color = "#ffffff";
            btn.style.transform = "scale(1.15)";
          } else {
            btn.classList.remove("active");
            btn.style.color = "rgba(255,255,255,0.15)";
            btn.style.transform = "scale(1)";
          }
        });
      });

      // Efeito hover simples
      starBtn.addEventListener("mouseover", () => {
        starBtn.style.transform = "scale(1.3)";
      });
      starBtn.addEventListener("mouseout", () => {
        const val = parseInt(starBtn.getAttribute("data-value"));
        if (val <= ratingValue) {
          starBtn.style.transform = "scale(1.15)";
        } else {
          starBtn.style.transform = "scale(1)";
        }
      });
    });
  }

  // Abre e fecha o formulário
  if (btnAbrirForm && formWrapper) {
    btnAbrirForm.addEventListener("click", () => {
      // Toca som de clique se useSound estiver disponível
      if (window.soundEnabled && typeof AudioContext !== "undefined") {
        // Toca feedback sonoro sutil
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }

      if (
        formWrapper.style.maxHeight === "0px" ||
        !formWrapper.style.maxHeight
      ) {
        formWrapper.style.maxHeight = formWrapper.scrollHeight + "px";
        formWrapper.style.opacity = "1";
        btnAbrirForm.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Fechar Formulário
        `;
        // Scroll suave até o formulário
        setTimeout(() => {
          formWrapper.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 150);
      } else {
        fecharFormulario();
      }
    });
  }

  if (btnCancelarForm) {
    btnCancelarForm.addEventListener("click", () => {
      fecharFormulario();
    });
  }

  function fecharFormulario() {
    if (!formWrapper) return;
    formWrapper.style.maxHeight = "0";
    formWrapper.style.opacity = "0";
    if (btnAbrirForm) {
      btnAbrirForm.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
        Escrever Depoimento
      `;
    }
    if (formElement) {
      formElement.reset();
      ratingValue = 5;
      const stars = starsContainer
        ? starsContainer.querySelectorAll(".star-btn")
        : [];
      stars.forEach((s) => {
        s.classList.add("active");
        s.style.color = "#ffffff";
        s.style.transform = "scale(1.15)";
      });
    }
  }

  // Filtragem dos depoimentos
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        b.classList.remove("active");
        b.style.background = "transparent";
        b.style.borderColor = "rgba(255, 255, 255, 0.05)";
        b.style.color = "#888888";
        const badge = b.querySelector(".count-badge");
        if (badge) {
          badge.style.background = "rgba(255, 255, 255, 0.05)";
          badge.style.color = "#888888";
        }
        b.setAttribute("aria-selected", "false");
      });

      btn.classList.add("active");
      btn.style.background = "rgba(255, 255, 255, 0.05)";
      btn.style.borderColor = "rgba(255, 255, 255, 0.15)";
      btn.style.color = "#ffffff";
      const badge = btn.querySelector(".count-badge");
      if (badge) {
        badge.style.background = "rgba(255, 255, 255, 0.15)";
        badge.style.color = "#ffffff";
      }
      btn.setAttribute("aria-selected", "true");

      activeFilter = btn.getAttribute("data-filter");
      renderComments();
    });
  });

  // Atualiza as contagens numéricas nos botões de filtro
  function updateCounters() {
    const allCount = comments.length;
    const alunoCount = comments.filter((c) => c.type === "aluno").length;
    const colegaCount = comments.filter((c) => c.type === "colega").length;
    const recrutadorCount = comments.filter(
      (c) => c.type === "recrutador",
    ).length;

    const lblAll = document.getElementById("count-all");
    const lblAluno = document.getElementById("count-aluno");
    const lblColega = document.getElementById("count-colega");
    const lblRecrutador = document.getElementById("count-recrutador");

    if (lblAll) lblAll.textContent = allCount;
    if (lblAluno) lblAluno.textContent = alunoCount;
    if (lblColega) lblColega.textContent = colegaCount;
    if (lblRecrutador) lblRecrutador.textContent = recrutadorCount;
  }

  // Renderiza a lista de comentários filtrados com belos efeitos em formato de carrossel infinito (Marquee)
  function renderComments() {
    if (!gridElement) return;
    gridElement.innerHTML = "";

    const filtered = comments.filter((c) => {
      if (activeFilter === "all") return true;
      return c.type === activeFilter;
    });

    if (filtered.length === 0) {
      gridElement.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: rgba(255,255,255,0.01); border: 1px dashed rgba(255,255,255,0.05); border-radius: 16px; width: 100%; min-width: 280px; max-width: 600px; margin: 0 auto;">
          <p style="color: #666666; font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; margin-bottom: 0.5rem;">Ainda não há depoimentos nesta categoria.</p>
          <p style="color: #444444; font-size: 0.9rem;">Seja o primeiro a publicar um recado escrevendo um depoimento acima! ✨</p>
        </div>
      `;
      return;
    }

    // Função interna para criar elemento do card de comentário de alta qualidade
    function createCardElement(comment) {
      const card = document.createElement("article");
      card.className = "mural-card spotlight-card";
      card.setAttribute("data-type", comment.type);

      // Estilos iniciais de animação de entrada
      card.style.opacity = "0";
      card.style.transform = "translateY(15px) scale(0.97)";
      card.style.filter = "blur(2px)";
      card.style.transition =
        "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease";

      // Estilo de relacionamento (badge)
      let typeText = "Visitante";
      let typeBg = "rgba(255, 255, 255, 0.05)";
      let typeColor = "#888888";

      if (comment.type === "aluno") {
        typeText = "Aluno";
        typeBg = "rgba(255, 255, 255, 0.08)";
        typeColor = "#cccccc";
      } else if (comment.type === "colega") {
        typeText = "Colega";
        typeBg = "rgba(255, 255, 255, 0.08)";
        typeColor = "#cccccc";
      } else if (comment.type === "recrutador") {
        typeText = "Recrutador";
        typeBg = "rgba(255, 255, 255, 0.08)";
        typeColor = "#cccccc";
      }

      // Detalhe de borda esquerda monocromática por categoria
      card.style.borderLeft = `4px solid ${typeColor}`;

      // Estrelas de Avaliação
      let starsHtml = "";
      for (let i = 0; i < 5; i++) {
        if (i < comment.rating) {
          starsHtml += `<span style="color: #ffffff; margin-right: 2px;">★</span>`;
        } else {
          starsHtml += `<span style="color: rgba(255,255,255,0.1); margin-right: 2px;">★</span>`;
        }
      }

      card.innerHTML = `
        <div style="position: absolute; top: -10px; right: 15px; font-size: 7rem; font-family: Georgia, serif; color: rgba(255,255,255,0.03); pointer-events: none; user-select: none;">“</div>
        
        <!-- Cabeçalho do Card: Informações do Autor e Avatar -->
        <div style="display: flex; gap: 1rem; align-items: center; z-index: 2;">
          <div class="testimonial-avatar" style="transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); width: 44px; height: 44px; border-radius: 50%; background: ${comment.color || "linear-gradient(135deg, #333, #666)"}; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #ffffff; font-size: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0;">
            ${comment.avatar || comment.name.substring(0, 2).toUpperCase()}
          </div>
          <div style="display: flex; flex-direction: column; min-width: 0;">
            <h5 style="font-family: 'Space Grotesk', sans-serif; font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${comment.name}
            </h5>
            <span class="mural-sub" style="font-size: 0.8rem; color: #666666; margin-top: 1px; display: flex; align-items: center; gap: 6px;">
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${comment.role}</span>
              <span style="width: 3px; height: 3px; border-radius: 50%; background: #444; flex-shrink: 0;"></span>
              <span style="flex-shrink: 0;">${comment.date}</span>
            </span>
          </div>
        </div>

        <!-- Conteúdo de Texto -->
        <p class="testimonial-text" style="font-style: italic; color: #d1d5db; font-size: 0.95rem; line-height: 1.6; margin: 0; text-align: left; z-index: 1; min-height: 72px;">
          "${comment.text}"
        </p>

        <!-- Rodapé do Card: Badge e Estrelas de Avaliação -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.75rem; z-index: 2;">
          <span class="testimonial-type-badge" style="background: ${typeBg}; color: ${typeColor}; padding: 3px 10px; border-radius: 100px; font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            ${typeText}
          </span>
          <div style="font-size: 0.85rem; display: flex; align-items: center;">
            ${starsHtml}
          </div>
        </div>
      `;

      return card;
    }

    // 1. Determina a lista base de comentários (garante o mínimo de 6 itens para preencher telas largas sem buracos)
    let baseItems = [...filtered];
    if (baseItems.length > 0) {
      while (baseItems.length < 6) {
        baseItems = [...baseItems, ...filtered];
      }
    }

    // 2. Renderiza a primeira metade do carrossel (Itens originais)
    baseItems.forEach((comment) => {
      const card = createCardElement(comment);
      gridElement.appendChild(card);
    });

    // 3. Renderiza a segunda metade idêntica do carrossel (Clones perfeitos) para rolagem infinita contínua
    baseItems.forEach((comment) => {
      const cloneCard = createCardElement(comment);
      cloneCard.classList.add("clone");
      cloneCard.setAttribute("aria-hidden", "true");
      cloneCard.setAttribute("tabindex", "-1");
      gridElement.appendChild(cloneCard);
    });

    // 4. Adiciona listeners de interação modernos a todos os cards (originais e clonados)
    const allCards = gridElement.querySelectorAll(".mural-card");
    allCards.forEach((card) => {
      // Spotlight follow-mouse glow tracking
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    });

    // Revela os cards em cascata só quando a seção realmente aparece na
    // tela ao rolar — antes disparava num timer fixo desde a criação, o
    // que "gastava" a animação antes do usuário chegar lá.
    const revealMuralCards = () => {
      allCards.forEach((card, index) => {
        setTimeout(
          () => {
            card.style.opacity = "1";
            card.style.transform = "translateX(0) translateY(0) scale(1)";
            card.style.filter = "blur(0)";
          },
          index * 80 + 50,
        );
      });
    };

    const muralContainer = document.getElementById("mural-marquee-container");
    if (muralContainer && "IntersectionObserver" in window) {
      const rect = muralContainer.getBoundingClientRect();
      const alreadyVisible =
        rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
      if (alreadyVisible) {
        revealMuralCards();
      } else {
        const muralObserver = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              revealMuralCards();
              muralObserver.disconnect();
            }
          },
          { threshold: 0.15 },
        );
        muralObserver.observe(muralContainer);
      }
    } else {
      revealMuralCards();
    }

    updateCounters();
  }

  // Lida com o envio do formulário
  if (formElement) {
    formElement.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameInput = document.getElementById("mural-nome");
      const relationSelect = document.getElementById("mural-relacao");
      const roleInput = document.getElementById("mural-role");
      const textInput = document.getElementById("mural-texto");

      if (!nameInput || !relationSelect || !roleInput || !textInput) return;

      const name = nameInput.value.trim();
      const type = relationSelect.value;
      const role = roleInput.value.trim();
      const text = textInput.value.trim();

      // Monta as iniciais do avatar
      const nameParts = name.split(" ");
      let avatar = "";
      if (nameParts.length >= 2) {
        avatar = (
          nameParts[0].charAt(0) + nameParts[1].charAt(0)
        ).toUpperCase();
      } else {
        avatar = name.substring(0, 2).toUpperCase();
      }

      // Sorteia um gradiente de colunas para o avatar
      const randomColor =
        avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

      // Cria a data atual formatada (Ex: "Fev/2026")
      const meses = [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai",
        "Jun",
        "Jul",
        "Ago",
        "Set",
        "Out",
        "Nov",
        "Dez",
      ];
      const dateObj = new Date();
      const currentMonthStr = meses[dateObj.getMonth()];
      const currentYearStr = dateObj.getFullYear();
      const dateFormatted = `${currentMonthStr}/${currentYearStr}`;

      const newComment = {
        id: "c_" + Date.now(),
        name: name,
        type: type,
        text: text,
        role: role,
        date: dateFormatted,
        rating: ratingValue,
        avatar: avatar,
        color: randomColor,
      };

      // Adiciona o comentário no início do array
      comments.unshift(newComment);

      // Salva no localStorage
      try {
        localStorage.setItem("mural_comments", JSON.stringify(comments));
      } catch (err) {
        console.error("Erro ao salvar comentário no localStorage", err);
      }

      // Fecha o formulário
      fecharFormulario();

      // Dispara Toast de sucesso
      const toast = document.getElementById("toast-notificacao");
      if (toast) {
        toast.innerHTML =
          "✨ Seu depoimento foi publicado com sucesso no mural!";
        toast.classList.remove("toast-escondido");
        toast.classList.add("toast-visivel");
        setTimeout(() => {
          toast.classList.remove("toast-visivel");
          toast.classList.add("toast-escondido");
        }, 4000);
      }

      // Recarrega e renderiza comentários
      renderComments();
    });
  }

  // Renderização Inicial
  renderComments();
}

document.addEventListener("DOMContentLoaded", initMuralDepoimentos);

// --------------------------------------------------------
// 17. Premium Custom Cursor & Magnetic Effects (Removed)
// --------------------------------------------------------
function initPremiumCursor() {
  // Efeito de cursor customizado removido a pedido do usuário
}


// --- Modal Close Logic (Added for accessibility and clean code) ---
document.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('[data-close-modal]');
  if (closeBtn) {
    const dialog = closeBtn.closest('dialog');
    if (dialog) {
      dialog.close();
    }
  }
});

// =========================================
// MOBILE CHROMATIC REVEAL — cor automática ao scroll (2026-08-19)
// Detecta quando imagens de projetos estão centralizadas na viewport
// e revela as cores (grayscale → colorido). Só ativa em mobile ≤ 768px.
// =========================================
function initMobileColorReveal() {
  if (window.innerWidth > 768) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const projectCards = document.querySelectorAll("#projetos .project-card");
  const designItems = document.querySelectorAll(".design-gallery-mobile-item");
  const gamedevArt = document.querySelectorAll(".gamedev-artwork");
  const beyondSection = document.querySelectorAll("#suporte-gestao");

  const allTargets = [
    ...projectCards,
    ...designItems,
    ...gamedevArt,
    ...beyondSection,
  ];

  if (!allTargets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio >= 0.35) {
          entry.target.classList.add("mobile-color-reveal");
        } else {
          entry.target.classList.remove("mobile-color-reveal");
        }
      });
    },
    {
      threshold: [0, 0.15, 0.25, 0.35, 0.5, 0.65, 0.8, 1.0],
      rootMargin: "-8% 0px -8% 0px",
    },
  );

  allTargets.forEach((el) => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", function () {
  try {
    initMobileColorReveal();
  } catch (e) {
    console.warn("[MobileColorReveal]", e);
  }
});

// Mobile Bottom Dock Observer
function initMobileDock() {
  const sections = document.querySelectorAll('section[id]');
  const dockItems = document.querySelectorAll('.dock-item');
  if (dockItems.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dockItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${entry.target.id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => observer.observe(section));

  dockItems.forEach(item => {
    item.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(10);
    });
  });
}
document.addEventListener('DOMContentLoaded', initMobileDock);

// Command Palette (Cmd+K)
function initCmdK() {
  const overlay = document.getElementById('cmd-k-overlay');
  const input = document.getElementById('cmd-k-input');
  const items = document.querySelectorAll('.cmd-k-item');
  if(!overlay) return;

  const toggleModal = (show) => {
    if(show) {
      overlay.classList.add('is-open');
      input.focus();
    } else {
      overlay.classList.remove('is-open');
      input.value = '';
    }
  };

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggleModal(!overlay.classList.contains('is-open'));
    }
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      toggleModal(false);
    }
  });

  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) toggleModal(false);
  });

  items.forEach(item => {
    item.addEventListener('click', (e) => {
      toggleModal(false);
      if(item.dataset.action === 'copy-email') {
        navigator.clipboard.writeText('leosouza5555@gmail.com');
        const originalText = item.innerHTML;
        item.innerHTML = '<span class="cmd-k-icon">✅</span> Copiado!';
        setTimeout(() => item.innerHTML = originalText, 2000);
      }
    });
  });
}
document.addEventListener('DOMContentLoaded', initCmdK);



// ==========================================
// FOOTER LIVE CLOCK (Natal/RN)
// ==========================================
function initFooterClock() {
  const clockEl = document.getElementById("local-time-footer");
  if (!clockEl) return;
  
  function update() {
    const now = new Date();
    // Force format to pt-BR timezone America/Fortaleza (Natal/RN time)
    const timeString = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Fortaleza',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(now);
    
    clockEl.innerHTML = `Natal/RN &mdash; ${timeString} BRT`;
  }
  
  update();
  setInterval(update, 1000);
}
document.addEventListener("DOMContentLoaded", initFooterClock);

// =========================================
// PWA: registra o service worker (permite instalar como app / offline)
// =========================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Falha silenciosa: site continua funcionando normalmente sem PWA.
    });
  });
}

// =========================================
// Interações nativas mobile: dots de paginação nos carrosséis
// =========================================
function initSwipeDots(scrollSelector, dotsId) {
  const scroller = document.querySelector(scrollSelector);
  const dotsContainer = document.getElementById(dotsId);
  if (!scroller || !dotsContainer || scroller.dataset.dotsInit) return;
  scroller.dataset.dotsInit = "1";

  const items = Array.from(scroller.children).filter((el) => el.nodeType === 1);
  if (items.length < 2) return;

  dotsContainer.innerHTML = "";
  items.forEach((item, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "swipe-dots__dot";
    dot.setAttribute("aria-label", `Ir para item ${i + 1} de ${items.length}`);
    dot.addEventListener("click", () => {
      item.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function updateActive() {
    const scrollerRect = scroller.getBoundingClientRect();
    const center = scrollerRect.left + scrollerRect.width / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    items.forEach((item, i) => {
      const r = item.getBoundingClientRect();
      const itemCenter = r.left + r.width / 2;
      const dist = Math.abs(itemCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    dots.forEach((d, i) => d.classList.toggle("is-active", i === closestIdx));
  }

  let ticking = false;
  scroller.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", updateActive);

  updateActive();
}

function initAllSwipeDots() {
  initSwipeDots("#projects-viewport", "projects-dots");
  initSwipeDots(".design-bento-gallery", "gallery-dots");
}
document.addEventListener("DOMContentLoaded", initAllSwipeDots);

// =========================================
// Bottom Sheet: arrastar a alça pra baixo fecha o modal (mobile)
// =========================================
(function initSheetDrag() {
  const sheet = document.getElementById("modal-lightbox");
  const handle = sheet ? sheet.querySelector(".sheet-handle") : null;
  if (!sheet || !handle) return;

  let startY = 0;
  let currentY = 0;
  let dragging = false;

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  handle.addEventListener(
    "touchstart",
    (e) => {
      if (!isMobile()) return;
      dragging = true;
      startY = e.touches[0].clientY;
      currentY = startY;
      sheet.classList.add("sheet-dragging");
    },
    { passive: true }
  );

  handle.addEventListener(
    "touchmove",
    (e) => {
      if (!dragging) return;
      currentY = e.touches[0].clientY;
      const delta = Math.max(0, currentY - startY);
      sheet.style.transform = `translateY(${delta}px)`;
    },
    { passive: true }
  );

  handle.addEventListener("touchend", () => {
    if (!dragging) return;
    dragging = false;
    const delta = Math.max(0, currentY - startY);
    sheet.classList.remove("sheet-dragging");

    if (delta > 120) {
      // Passou do ponto de corte: termina a animação pra fora e fecha
      sheet.style.transform = "translateY(100%)";
      sheet.addEventListener(
        "transitionend",
        () => {
          sheet.close();
          sheet.style.transform = "";
        },
        { once: true }
      );
    } else {
      // Não passou: volta suavemente pro lugar
      sheet.style.transform = "";
    }

    startY = 0;
    currentY = 0;
  });
})();

