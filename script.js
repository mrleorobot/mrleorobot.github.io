
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

  // Limites em px — muito discreto para nã