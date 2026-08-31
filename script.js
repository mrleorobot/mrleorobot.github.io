
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
  if (document.documentElement.classList.contains("is-chromium")) return;
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
        // Parar canvas do loader para não consumir CPU
        const loaderCanvas = document.getElementById("loader-stars-canvas");
        if (loaderCanvas) {
          loaderCanvas.style.display = "none";
          const ctx = loaderCanvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, loaderCanvas.width, loaderCanvas.height);
        }
        // Revelar hero
        document.body.classList.add("loader-complete");
    body.classList.remove("loading-locked");
    window.PortfolioScrollLock?.unlock("loader");
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    body.classList.remove("loading-locked");
    window.PortfolioScrollLock?.unlock("loader");
    loader.remove();
        // Parar canvas do loader para não consumir CPU
        const loaderCanvas = document.getElementById("loader-stars-canvas");
        if (loaderCanvas) {
          loaderCanvas.style.display = "none";
          const ctx = loaderCanvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, loaderCanvas.width, loaderCanvas.height);
        }
        // Revelar hero
        document.body.classList.add("loader-complete");
    return;
  }

  const alreadyShownThisSession = false; // sessionStorage removido — loader sempre aparece
  if (alreadyShownThisSession) {
    body.classList.remove("loading-locked");
    window.PortfolioScrollLock?.unlock("loader");
    loader.remove();
        // Parar canvas do loader para não consumir CPU
        const loaderCanvas = document.getElementById("loader-stars-canvas");
        if (loaderCanvas) {
          loaderCanvas.style.display = "none";
          const ctx = loaderCanvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, loaderCanvas.width, loaderCanvas.height);
        }
        // Revelar hero
        document.body.classList.add("loader-complete");
    return;
  }
  // sessionStorage removido — loader sempre aparece

  body.classList.add("loading-locked");
  window.PortfolioScrollLock?.lock("loader");

  // Mobile scroll watchdog: schedule this BEFORE optional canvas work.
  // If Canvas/WebGL resources fail on a phone, the page must still unlock.
  const releaseStuckScroll = () => {
    body.classList.remove("loading-locked");
    window.PortfolioScrollLock?.unlock("loader");
    body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overflow");
    document.documentElement.classList.remove(
      "lenis",
      "lenis-smooth",
      "lenis-stopped",
      "lenis-scrolling",
    );
    const activeLoader = document.getElementById("cinematic-loader");
    if (activeLoader) activeLoader.remove();
    body.classList.add("loader-complete");
  };

  window.setTimeout(() => {
    if (body.classList.contains("loading-locked")) {
      releaseStuckScroll();
    }
  }, 5200);

  // --- Lightweight canvas starfield (brighter, more visible) ---
  let animId = null;
  if (canvas) {
    let ctx = null;
    try {
      ctx = canvas.getContext("2d");
    } catch (_) {
      ctx = null;
    }

    if (!ctx) {
      canvas.style.display = "none";
    } else {
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
  }

  // --- Shooting star: big fall toward the brand name ---
  function fireShootingStar() {
    if (!shootingStarEl) return;
    const trail = shootingStarEl.querySelector(".loader-shooting-star__trail");
    if (!trail) return;

    // Starts further up and to the left, giving the longer trail room to
    // build up before arriving near the name.
    const brandRect = brandEl.getBoundingClientRect();
    const startX = brandRect.left - 320;
    const startY = brandRect.top - 260;

    trail.style.left = startX + "px";
    trail.style.top = startY + "px";
    trail.classList.add("animate");
  }

  // --- Animation sequence (~3s total) ---
  //   0ms    : starfield fades in
  //   200ms  : big shooting star begins falling toward the name
  //   1300ms : star arrives -> brand name letters cascade in
  //   2100ms : name fully revealed, brief hold
  //   2600ms : curtains reveal
  //   3500ms : loader removed from DOM

  requestAnimationFrame(() => {
    loader.classList.add("starfield-on");
  });

  setTimeout(() => {
    fireShootingStar();

    // Reveal the brand name as the star arrives
    setTimeout(() => {
      brandEl.classList.add("show");

      // Start reveal after a brief hold on the revealed name
      setTimeout(() => {
        loader.classList.add("reveal");
        if (animId) cancelAnimationFrame(animId);

        setTimeout(() => {
          body.classList.remove("loading-locked");
    window.PortfolioScrollLock?.unlock("loader");
          loader.remove();
        // Parar canvas do loader para não consumir CPU
        const loaderCanvas = document.getElementById("loader-stars-canvas");
        if (loaderCanvas) {
          loaderCanvas.style.display = "none";
          const ctx = loaderCanvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, loaderCanvas.width, loaderCanvas.height);
        }
        // Revelar hero
        document.body.classList.add("loader-complete");
        }, 900);
      }, 800); // hold after name reveals
    }, 1100); // wait for the star to arrive near the name
  }, 200);

  // Safety fallback
  setTimeout(() => {
    if (document.getElementById("cinematic-loader")) {
      if (animId) cancelAnimationFrame(animId);
      body.classList.remove("loading-locked");
    window.PortfolioScrollLock?.unlock("loader");
      loader.remove();
        // Parar canvas do loader para não consumir CPU
        const loaderCanvas = document.getElementById("loader-stars-canvas");
        if (loaderCanvas) {
          loaderCanvas.style.display = "none";
          const ctx = loaderCanvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, loaderCanvas.width, loaderCanvas.height);
        }
        // Revelar hero
        document.body.classList.add("loader-complete");
    }
  }, 5000);
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;

  window.PortfolioScrollLock?.clear();
  const pageBody = document.body;
  pageBody.classList.remove("loading-locked");
  pageBody.classList.add("loader-complete");
  pageBody.style.removeProperty("overflow");
  document.documentElement.style.removeProperty("overflow");
  document.documentElement.classList.remove(
    "lenis",
    "lenis-smooth",
    "lenis-stopped",
    "lenis-scrolling",
  );
  const staleLoader = document.getElementById("cinematic-loader");
  if (staleLoader) staleLoader.remove();
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
  // Vitrine horizontal de Interface Design:
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
  const chromiumLite = document.documentElement.classList.contains("is-chromium");
  const initSafe = (fn, name) => {
    try {
      fn();
    } catch (e) {
      console.error(`Erro ao inicializar ${name}:`, e);
    }
  };

  // O canvas hero-ink é o único efeito contínuo do Hero. Os sistemas
  // antigos de partículas e parallax duplicavam o trabalho a cada frame.
  initSafe(initTypewriter, "initTypewriter");
  initSafe(initCinematicScroll, "initCinematicScroll");
  initSafe(initSearchAndMenu, "initSearchAndMenu");
  initSafe(initInteractiveRipples, "initInteractiveRipples");
  initSafe(initTimelineScroll, "initTimelineScroll");
  initSafe(initProjectsCarousel, "initProjectsCarousel");
  initSafe(initDesignGallery, "initDesignGallery");
  if (!chromiumLite) {
    initSafe(initTrajectorySpotlight, "initTrajectorySpotlight");
    initSafe(initGameDevArtwork, "initGameDevArtwork");
    initSafe(initBeyondCodePhoto, "initBeyondCodePhoto");
  }
  initSafe(initTabSystem, "initTabSystem");
  initSafe(initScrollProgressBar, "initScrollProgressBar");
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
      document.body.classList.toggle("mobile-menu-open", willBeActive);
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
        document.body.classList.remove("mobile-menu-open");
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
        document.body.classList.remove("mobile-menu-open");
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
          document.body.classList.remove("mobile-menu-open");
          hamburger.setAttribute("aria-expanded", "false");
          hamburger.setAttribute("aria-label", "Abrir menu");
        }
      }
    });
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
  "screenshot-onething": {
    title: "ONE THING",
    category: "Design Experimental & Tipografia",
    challenge:
      "Testar até onde uma página consegue comunicar usando quase nada — sem cor, sem imagem, só tipografia crua e espaço negativo.",
    solution:
      "Landing page experimental construída em torno de uma única palavra gigante e micro-interações discretas, explorando hierarquia tipográfica pura e um único ponto de cor de destaque.",
    tech: ["Vite", "Framer Motion", "CSS Puro"],
  },
  "screenshot-komorebi": {
    title: "Komorebi",
    category: "Landing Page & Branding",
    challenge:
      "Transmitir a atmosfera calma e artesanal de uma torrefação boutique numa landing page, sem cair no clichê visual de 'site de cafeteria'.",
    solution:
      "Design premium com paleta orgânica, fotografia em close-up do ritual do café e tipografia serifada, guiando o usuário por uma narrativa de pausa e cuidado até a assinatura.",
    tech: ["React", "Vite", "CSS Art"],
  },
  "screenshot-memoryexe": {
    title: "MEMORY.EXE",
    category: "Experiência Narrativa Interativa",
    challenge:
      "Criar uma experiência web que parecesse um artefato digital real de 1998 — não uma imitação óbvia, mas algo que gerasse dúvida genuína no visitante.",
    solution:
      "Interface estilo terminal/boot antigo, bilíngue (PT-BR/EN), com narrativa revelada progressivamente conforme o usuário interage — sem biblioteca visual pronta, tudo em Vanilla JS.",
    tech: ["Vite", "JavaScript", "CSS Terminal UI"],
  },
  "screenshot-hanamori": {
    title: "Hanamori",
    category: "Landing Page Ilustrada",
    challenge:
      "Fazer uma landing page parecer um livro ilustrado à mão, sem perder performance nem responsividade.",
    solution:
      "Cenários pintados em camadas com paralaxe suave, tipografia serifada editorial e transições que imitam a virada de páginas de uma história ilustrada.",
    tech: ["Vite", "CSS Art", "Parallax Scroll"],
  },
  "screenshot-aurvm": {
    title: "AURVM",
    category: "E-commerce de Luxo",
    challenge:
      "Projetar uma vitrine digital de joalheria autoral que comunicasse exclusividade e artesania sem depender de um catálogo tradicional de e-commerce.",
    solution:
      "Landing escura e cinematográfica com fotografia macro das peças, tipografia serifada de alto contraste e microtexto guiando a narrativa de cada coleção.",
    tech: ["React", "Vite", "Scroll Storytelling"],
  },
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
    category: "Interface Design",
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
// Navegação contínua e scroll spy
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

/* =========================================================
   ACCESSIBLE MEDIA TRIGGERS
   Keeps the existing pointer interaction and mirrors it for
   keyboard users without changing the default appearance.
   ========================================================= */
function initAccessibleMediaTriggers() {
  document.querySelectorAll(".project-thumbnail-wrapper").forEach((wrapper) => {
    const trigger = wrapper.querySelector(".project-lightbox-trigger");
    if (!trigger) return;

    wrapper.setAttribute("role", "button");
    wrapper.setAttribute("tabindex", "0");
    if (!wrapper.hasAttribute("aria-label")) {
      const label = trigger.getAttribute("alt") || "imagem do projeto";
      wrapper.setAttribute("aria-label", `Ampliar ${label}`);
    }

    wrapper.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      trigger.click();
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAccessibleMediaTriggers, { once: true });
} else {
  initAccessibleMediaTriggers();
}
